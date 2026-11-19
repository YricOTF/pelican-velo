import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';

const roomCodePattern = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
const maxPlayers = 4;
const maxConnections = 256;
const maxPayload = 4_096;
const maxQueued = 65_536;
const registrationTimeout = 10_000;
const heartbeatInterval = 30_000;
const packetsPerSecond = 60;
const hostPacketsPerSecond = 160;
const maxBurst = 90;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readPacket(raw) {
  try {
    const packet = JSON.parse(raw.toString('utf8'));
    return isObject(packet) ? packet : null;
  } catch {
    return null;
  }
}

function send(socket, packet) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(packet));
}

function reject(socket, message) {
  send(socket, { type: 'error', message });
  socket.close(1008, message);
}

function healthHandler(request, response) {
  if (request.method === 'GET' && (request.url === '/' || request.url === '/healthz')) {
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end('{"status":"ok"}');
    return;
  }
  response.writeHead(404);
  response.end();
}

export function createRelayServer() {
  const server = createServer(healthHandler);
  const sockets = new WebSocketServer({ noServer: true, maxPayload, perMessageDeflate: false });
  const rooms = new Map();
  const clients = new Set();

  server.on('upgrade', (request, stream, head) => {
    if (clients.size >= maxConnections) {
      stream.end('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
      return;
    }
    sockets.handleUpgrade(request, stream, head, (socket) => sockets.emit('connection', socket));
  });

  function register(client, packet) {
    const { socket } = client;
    const { type, code } = packet;
    if (typeof code !== 'string' || !roomCodePattern.test(code)) {
      reject(socket, 'invalid-code');
      return;
    }

    let room = rooms.get(code);
    if (type === 'host') {
      if (room) {
        reject(socket, 'room-exists');
        return;
      }
      room = { code, host: client, members: new Map() };
      rooms.set(code, room);
    } else if (type === 'join') {
      if (!room || room.host.socket.readyState !== WebSocket.OPEN) {
        reject(socket, 'room-not-found');
        return;
      }
      if (room.members.size >= maxPlayers) {
        reject(socket, 'room-full');
        return;
      }
    } else {
      reject(socket, 'invalid-packet');
      return;
    }

    clearTimeout(client.registrationTimer);
    room.members.set(client.id, client);
    client.room = room;
    send(socket, { type: 'open', id: client.id, code, hostId: room.host.id });
    if (client !== room.host) send(room.host.socket, { type: 'member', id: client.id });
  }

  function forward(client, packet) {
    const { socket, room } = client;
    if (packet.type === 'kick' && client === room.host && typeof packet.id === 'string') {
      const guest = room.members.get(packet.id);
      if (guest && guest !== client) {
        guest.socket.close(1008, 'kicked');
        leaveRoom(guest);
      }
      return;
    }
    if (packet.type !== 'data' || typeof packet.to !== 'string' || !isObject(packet.data)) {
      reject(socket, 'invalid-packet');
      return;
    }
    if (client !== room.host && packet.to !== room.host.id) {
      reject(socket, 'invalid-packet');
      return;
    }
    const recipient = room.members.get(packet.to);
    // A host can still have queued snapshots for a guest that just left.
    if (!recipient || recipient === client || recipient.socket.bufferedAmount > maxQueued) return;
    send(recipient.socket, { type: 'data', from: client.id, data: packet.data });
  }

  function leaveRoom(client) {
    const { room } = client;
    if (!room) return;
    client.room = null;
    room.members.delete(client.id);
    if (client !== room.host) {
      send(room.host.socket, { type: 'member-left', id: client.id });
      return;
    }
    rooms.delete(room.code);
    for (const guest of room.members.values()) {
      guest.room = null;
      send(guest.socket, { type: 'closed' });
      guest.socket.close(1000, 'room-closed');
    }
    room.members.clear();
  }

  function disconnect(client) {
    clients.delete(client);
    clearTimeout(client.registrationTimer);
    leaveRoom(client);
  }

  sockets.on('connection', (socket) => {
    const client = {
      socket,
      id: randomUUID(),
      room: null,
      alive: true,
      tokens: maxBurst,
      lastPacket: performance.now(),
      registrationTimer: setTimeout(() => reject(socket, 'registration-timeout'), registrationTimeout),
    };
    clients.add(client);
    socket.on('error', () => socket.terminate());
    socket.on('pong', () => { client.alive = true; });
    socket.on('close', () => disconnect(client));
    socket.on('message', (raw, binary) => {
      if (socket.readyState !== WebSocket.OPEN) return;
      const now = performance.now();
      const rate = client.room?.host === client ? hostPacketsPerSecond : packetsPerSecond;
      client.tokens = Math.min(maxBurst, client.tokens + (now - client.lastPacket) * rate / 1_000);
      client.lastPacket = now;
      if (client.tokens < 1) {
        reject(socket, 'rate-limit');
        return;
      }
      client.tokens -= 1;
      const packet = binary ? null : readPacket(raw);
      if (!packet) {
        reject(socket, 'invalid-packet');
        return;
      }
      if (client.room) forward(client, packet);
      else register(client, packet);
    });
  });

  const heartbeat = setInterval(() => {
    for (const client of clients) {
      if (!client.alive) {
        client.socket.terminate();
      } else if (client.socket.readyState === WebSocket.OPEN) {
        client.alive = false;
        client.socket.ping();
      }
    }
  }, heartbeatInterval);
  heartbeat.unref();

  function close() {
    clearInterval(heartbeat);
    for (const client of clients) client.socket.terminate();
    sockets.close();
    return new Promise((resolve, rejectClose) => {
      server.close((error) => error ? rejectClose(error) : resolve());
    });
  }

  return { server, close };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const relay = createRelayServer();
  const port = Number(process.env.PORT ?? 8787);
  relay.server.listen(port, '0.0.0.0', () => {
    console.log(`Pelican Velo relay listening on port ${relay.server.address().port}`);
  });
  process.once('SIGINT', () => void relay.close());
  process.once('SIGTERM', () => void relay.close());
}
