const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;
const VERSION = 1;
const ROOM_LIMIT = 4;
const CONNECT_TIMEOUT = 18000;
const SNAPSHOT_INTERVAL = 1000 / 12;
const MAX_PACKET_SIZE = 3072;
const PEER_PREFIX = 'pelican-velo-v1-';
const MAPS = new Set(['coast', 'harbor', 'basalt']);
const WEATHER = new Set(['clear', 'cloudy', 'rain', 'mist']);
const TIMES = new Set(['day', 'dusk', 'night']);

const messages = {
  'invalid-code': '请输入 6 位房间码。',
  'room-exists': '这个房间码已被使用，请再开一间。',
  'room-not-found': '找不到这个房间，请核对房间码。',
  'room-full': '这个房间已经有 4 位骑手。',
  'room-closed': '房主已结束房间。',
  'invalid-packet': '联机消息格式有误。',
  'invalid-relay': '中继需要使用 wss://，本机测试可以使用 ws://localhost。',
  'connection-failed': '联机连接失败。可以重试，或在联机设置中使用 TURN 或 WebSocket 中继。',
  'connection-lost': '联机连接已断开。',
  'incompatible': '房间的游戏版本不同，请刷新页面。',
  'rate-limit': '连接消息过于频繁，请重新加入。',
  'timeout': '联机等待超时。可以重试，或在联机设置中使用 TURN 或 WebSocket 中继。',
};

function token(size) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

function randomSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

function normalizeCode(value) {
  return typeof value === 'string' ? value.trim().toUpperCase().replace(/[\s-]/g, '') : '';
}

function cleanName(value) {
  const name = typeof value === 'string' ? value.replace(/[\p{Cc}\p{Cf}]/gu, '').trim() : '';
  return [...name].slice(0, 18).join('');
}

function niceName(value, slot) {
  return cleanName(value) || `骑手 ${slot + 1}`;
}

function validId(id) {
  return typeof id === 'string' && /^[\w-]{1,100}$/.test(id);
}

function packet(value) {
  let parsed = value;
  if (typeof value === 'string') {
    if (value.length > MAX_PACKET_SIZE) return null;
    try {
      parsed = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) && typeof parsed.type === 'string' ? parsed : null;
}

function readNumber(value, min, max, fallback = 0) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function sanitizeSnapshot(value) {
  if (!value || ![value.x, value.y, value.z, value.heading].every(Number.isFinite)) return null;
  return {
    x: readNumber(value.x, -12000, 12000),
    y: readNumber(value.y, -200, 200),
    z: readNumber(value.z, -12000, 12000),
    heading: Math.atan2(Math.sin(value.heading), Math.cos(value.heading)),
    speed: readNumber(value.speed, 0, 60),
    steer: readNumber(value.steer, -1, 1),
    elapsed: readNumber(value.elapsed, 0, 1800),
    laps: Math.floor(readNumber(value.laps, 0, 999)),
    progress: readNumber(value.progress, 0, 1),
    bestLap: Number.isFinite(value.bestLap) ? readNumber(value.bestLap, 0, 1800) : null,
    distance: readNumber(value.distance, 0, 100000),
    wheelAngle: readNumber(value.wheelAngle, -Math.PI * 2, Math.PI * 2),
    crankAngle: readNumber(value.crankAngle, -Math.PI * 2, Math.PI * 2),
    offroad: value.offroad === true,
    yielding: value.yielding === true,
    finished: value.finished === true,
    seq: Math.floor(readNumber(value.seq, 0, 1000000)),
  };
}

function sanitizeRound(value) {
  if (!value || !validId(value.id) || !MAPS.has(value.mapId) || !WEATHER.has(value.weather)
      || !TIMES.has(value.timeOfDay) || !Number.isInteger(value.seed) || value.seed < 0 || value.seed > 0xffffffff
      || !Number.isFinite(value.startsAt) || !Number.isInteger(value.duration) || value.duration < 15 || value.duration > 1800) {
    return null;
  }
  return { id: value.id, mapId: value.mapId, weather: value.weather, timeOfDay: value.timeOfDay,
    seed: value.seed, startsAt: value.startsAt, duration: value.duration };
}

function sanitizePlayers(value, hostId, selfId) {
  if (!Array.isArray(value) || !value.length || value.length > ROOM_LIMIT) return null;
  const ids = new Set();
  const slots = new Set();
  const players = [];
  for (const player of value) {
    if (!player || !validId(player.id) || !Number.isInteger(player.slot) || player.slot < 0
        || player.slot >= ROOM_LIMIT || ids.has(player.id) || slots.has(player.slot)
        || ((player.id === hostId) !== (player.slot === 0))) return null;
    ids.add(player.id);
    slots.add(player.slot);
    players.push({ id: player.id, name: niceName(player.name, player.slot), slot: player.slot });
  }
  if (!ids.has(hostId) || !ids.has(selfId)) return null;
  return players.sort((a, b) => a.slot - b.slot);
}

function cleanIceServers(defaults, extra) {
  const standard = [...defaults, { urls: 'stun:stun.cloudflare.com:3478' }];
  if (!Array.isArray(extra)) return standard;
  const supplied = extra.slice(0, 8).flatMap((server) => {
    const urls = [server?.urls].flat().filter((url) => typeof url === 'string'
      && /^(?:stuns?|turns?):[^\s]+$/i.test(url) && url.length <= 512).slice(0, 4);
    if (!urls.length) return [];
    return [{ urls, ...(typeof server.username === 'string' && { username: server.username }),
      ...(typeof server.credential === 'string' && { credential: server.credential }) }];
  });
  return [...supplied, ...standard];
}

function relayAddress(value) {
  try {
    const url = new URL(value);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.username || url.password || url.hash || (url.protocol !== 'wss:' && !(url.protocol === 'ws:' && local))) return null;
    return url.href;
  } catch {
    return null;
  }
}

function openRelay(role, code, options, handlers) {
  const url = relayAddress(options.relayUrl);
  let socket;
  let stopped = false;
  let opened = false;
  function send(data) {
    if (socket?.readyState === WebSocket.OPEN && socket.bufferedAmount < 64000) socket.send(JSON.stringify(data));
  }
  if (!url) {
    queueMicrotask(() => handlers.error('invalid-relay'));
  } else {
    try {
      socket = new WebSocket(url);
      socket.addEventListener('open', () => send({ type: role, code }));
      socket.addEventListener('message', (event) => {
        if (stopped || typeof event.data !== 'string') return;
        const message = packet(event.data);
        if (!message) return;
        switch (message.type) {
          case 'open':
            if (!opened && message.code === code && validId(message.id) && validId(message.hostId)) {
              opened = true;
              handlers.open(message.id, message.hostId);
            }
            break;
          case 'member': handlers.member(message.id); break;
          case 'member-left': handlers.memberLeft(message.id); break;
          case 'data': handlers.data(message.from, message.data); break;
          case 'closed': handlers.error('room-closed'); break;
          case 'error': handlers.error(message.message); break;
        }
      });
      socket.addEventListener('close', () => {
        if (!stopped) handlers.error(opened ? 'connection-lost' : 'connection-failed');
      });
      socket.addEventListener('error', () => {
        if (!stopped) handlers.error('connection-failed');
      });
    } catch {
      queueMicrotask(() => handlers.error('connection-failed'));
    }
  }
  return {
    send: (to, data) => send({ type: 'data', to, data }),
    kick: (id) => send({ type: 'kick', id }),
    close() {
      stopped = true;
      if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
    },
  };
}

function openPeerRoom(role, code, options, handlers) {
  const hostId = `${PEER_PREFIX}${code.toLowerCase()}`;
  const links = new Map();
  let peer;
  let stopped = false;
  let selfId;

  function attach(link) {
    if (!link) {
      handlers.error('connection-failed');
      return;
    }
    if (stopped || links.has(link.peer) || links.size >= ROOM_LIMIT + 2) {
      link.close();
      return;
    }
    links.set(link.peer, link);
    link.on('open', () => {
      if (stopped) return;
      if (role === 'host') handlers.member(link.peer);
      else handlers.open(selfId, hostId);
    });
    link.on('data', (data) => {
      if (!stopped) handlers.data(link.peer, data);
    });
    link.on('close', () => {
      if (links.get(link.peer) === link) links.delete(link.peer);
      if (!stopped) handlers.memberLeft(link.peer);
    });
    link.on('error', () => {
      if (!stopped && role === 'join') handlers.error('connection-failed');
    });
  }

  import('peerjs').then(({ Peer, util }) => {
    if (stopped) return;
    const config = { ...util.defaultConfig, iceServers: cleanIceServers(util.defaultConfig.iceServers, options.iceServers) };
    const configuration = { config, debug: 0 };
    peer = role === 'host' ? new Peer(hostId, configuration) : new Peer(configuration);
    peer.on('open', (id) => {
      if (stopped || selfId) return;
      selfId = id;
      if (role === 'host') handlers.open(id, id);
      else attach(peer.connect(hostId, { reliable: true, serialization: 'json' }));
    });
    peer.on('connection', (link) => {
      if (role === 'host') attach(link);
      else link.close();
    });
    peer.on('error', (error) => {
      if (stopped) return;
      if (error.type === 'unavailable-id') handlers.error('room-exists');
      else if (error.type === 'peer-unavailable' && role === 'join') handlers.error('room-not-found');
      else if (!selfId || !links.size) handlers.error('connection-failed');
    });
    peer.on('disconnected', () => {
      // Existing data channels remain usable while signaling reconnects.
      if (!stopped && peer && !peer.destroyed) peer.reconnect();
    });
  }).catch(() => {
    if (!stopped) handlers.error('connection-failed');
  });

  return {
    send(to, data) {
      const link = links.get(to);
      if (link?.open && link.dataChannel.bufferedAmount < 64000) link.send(data);
    },
    kick: (id) => links.get(id)?.close(),
    close() {
      stopped = true;
      peer?.destroy();
      links.clear();
    },
  };
}

export function createMultiplayer({ onState = () => {}, onSnapshot = () => {}, onRound = () => {}, transportFactory } = {}) {
  const state = {
    status: 'idle', code: '', role: null, selfId: null, hostId: null, players: [],
    error: null, errorCode: null, round: null, transport: null,
  };
  const handshakes = new Map();
  const received = new Map();
  let transport;
  let armTimeout;
  let clockTimer;
  let generation = 0;
  let playerName = '';
  let localSequence = 0;
  let lastSnapshotTime = -Infinity;
  let clockOffset = 0;
  let bestRoundTrip = Infinity;
  let pendingPing = 0;

  function emit() {
    onState(state);
  }

  function disposeTransport() {
    generation++;
    clearTimeout(armTimeout);
    clearInterval(clockTimer);
    for (const timer of handshakes.values()) clearTimeout(timer);
    handshakes.clear();
    received.clear();
    transport?.close();
    transport = undefined;
  }

  function clearSession() {
    state.selfId = null;
    state.hostId = null;
    state.players = [];
    state.round = null;
    clockOffset = 0;
    bestRoundTrip = Infinity;
    pendingPing = 0;
  }

  function terminate(reason) {
    disposeTransport();
    clearSession();
    state.status = reason === 'room-closed' ? 'closed' : 'error';
    state.errorCode = Object.hasOwn(messages, reason) ? reason : 'connection-failed';
    state.error = messages[state.errorCode];
    emit();
  }

  function send(to, message) {
    transport?.send(to, message);
  }

  function broadcast(message, exclude) {
    for (const { id } of state.players) {
      if (id !== state.selfId && id !== exclude) send(id, message);
    }
  }

  function joinable() {
    return state.status === 'connected' && state.role === 'host';
  }

  function removeGuest(id) {
    clearTimeout(handshakes.get(id));
    handshakes.delete(id);
    received.delete(id);
    const members = state.players.filter((player) => player.id !== id);
    if (members.length === state.players.length) return;
    state.players = members;
    broadcast({ type: 'players', players: members });
    emit();
  }

  function rejectGuest(id, reason) {
    send(id, { type: 'rejected', reason });
    clearTimeout(handshakes.get(id));
    const timer = setTimeout(() => {
      handshakes.delete(id);
      transport?.kick(id);
    }, 100);
    handshakes.set(id, timer);
  }

  function acceptGuest(id, hello) {
    if (hello.version !== VERSION) return rejectGuest(id, 'incompatible');
    if (state.players.some((player) => player.id === id)) return;
    const slot = [1, 2, 3].find((number) => !state.players.some((player) => player.slot === number));
    if (slot === undefined) return rejectGuest(id, 'room-full');
    clearTimeout(handshakes.get(id));
    handshakes.delete(id);
    const player = { id, name: niceName(hello.name, slot), slot };
    state.players = [...state.players, player].sort((a, b) => a.slot - b.slot);
    send(id, {
      type: 'welcome', version: VERSION, players: state.players,
      hostTime: Date.now(), clientTime: hello.sentAt,
      round: state.round,
    });
    broadcast({ type: 'players', players: state.players }, id);
    emit();
  }

  function recordClock(hostTime, clientTime) {
    if (!Number.isFinite(hostTime) || clientTime !== pendingPing) return;
    const now = Date.now();
    const roundTrip = now - clientTime;
    if (roundTrip < 0 || roundTrip >= bestRoundTrip) return;
    bestRoundTrip = roundTrip;
    clockOffset = hostTime - (clientTime + now) / 2;
  }

  function syncClock() {
    pendingPing = Date.now();
    send(state.hostId, { type: 'clock', sentAt: pendingPing });
  }

  function applyRound(round) {
    state.round = round;
    received.clear();
    localSequence = 0;
    lastSnapshotTime = -Infinity;
    emit();
    onRound(round);
  }

  function syncRound(value) {
    const round = sanitizeRound(value);
    if (!round || round.id === state.round?.id) return false;
    const startsAt = round.startsAt - clockOffset;
    if (startsAt > Date.now() + 20000) return false;
    applyRound({ ...round, startsAt });
    return true;
  }

  function processSnapshot(id, message) {
    if (!state.round || message.round !== state.round.id || id === state.selfId
        || !state.players.some((player) => player.id === id)) return;
    const snapshot = sanitizeSnapshot(message.snapshot);
    if (!snapshot) return;
    const now = performance.now();
    const previous = received.get(id);
    if (previous && (snapshot.seq <= previous.seq || now - previous.at < 32)) return;
    received.set(id, { seq: snapshot.seq, at: now });
    if (state.role === 'host') {
      broadcast({ type: 'snapshot', player: id, round: state.round.id, snapshot }, id);
    }
    onSnapshot(id, snapshot);
  }

  function receiveGuest(id, message) {
    if (message.type === 'hello') {
      if (handshakes.has(id)) acceptGuest(id, message);
      return;
    }
    if (!state.players.some((player) => player.id === id)) return;
    if (message.type === 'leave') {
      removeGuest(id);
      transport?.kick(id);
    } else if (message.type === 'clock') {
      send(id, { type: 'clock', clientTime: message.sentAt, hostTime: Date.now() });
    } else if (message.type === 'snapshot') {
      processSnapshot(id, message);
    }
  }

  function receiveHost(message) {
    if (message.type === 'room-closed') return terminate('room-closed');
    if (message.type === 'rejected') return terminate(message.reason);
    if (message.type === 'welcome' && state.status === 'connecting') {
      if (message.version !== VERSION) return terminate('incompatible');
      const roster = sanitizePlayers(message.players, state.hostId, state.selfId);
      if (!roster) return terminate('invalid-packet');
      recordClock(message.hostTime, message.clientTime);
      clearTimeout(armTimeout);
      state.players = roster;
      state.status = 'connected';
      clockTimer = setInterval(syncClock, 9000);
      if (!syncRound(message.round)) emit();
      return;
    }
    if (state.status !== 'connected') return;
    if (message.type === 'players') {
      const players = sanitizePlayers(message.players, state.hostId, state.selfId);
      if (!players) return;
      state.players = players;
      for (const id of received.keys()) {
        if (!players.some((player) => player.id === id)) received.delete(id);
      }
      emit();
    } else if (message.type === 'round') {
      syncRound(message.round);
    } else if (message.type === 'clock') {
      recordClock(message.hostTime, message.clientTime);
    } else if (message.type === 'snapshot' && validId(message.player)) {
      processSnapshot(message.player, message);
    }
  }

  function begin(role, code, options) {
    if (transport) leave();
    clearSession();
    state.code = code;
    state.role = role;
    state.error = null;
    state.errorCode = null;
    const relayUrl = typeof options.relayUrl === 'string' ? options.relayUrl.trim() : '';
    state.transport = relayUrl ? 'relay' : 'peer';
    if (!CODE_PATTERN.test(code)) {
      terminate('invalid-code');
      return false;
    }

    state.status = 'connecting';
    playerName = cleanName(options.name);
    const active = ++generation;
    function current(callback) {
      return (...args) => {
        if (active === generation) callback(...args);
      };
    }

    const handlers = {
      open: current((id, hostId) => {
        if (!validId(id) || !validId(hostId) || (role === 'host') !== (id === hostId)) {
          terminate('invalid-packet');
          return;
        }
        state.selfId = id;
        state.hostId = hostId;
        if (role === 'host') {
          clearTimeout(armTimeout);
          state.status = 'connected';
          state.players = [{ id, name: niceName(playerName, 0), slot: 0 }];
          emit();
        } else {
          pendingPing = Date.now();
          send(hostId, { type: 'hello', version: VERSION, name: playerName, sentAt: pendingPing });
        }
      }),
      member: current((id) => {
        if (!joinable() || !validId(id) || id === state.selfId || handshakes.has(id)
            || state.players.some((player) => player.id === id)) return;
        const timer = setTimeout(() => {
          handshakes.delete(id);
          transport?.kick(id);
        }, 9000);
        handshakes.set(id, timer);
      }),
      memberLeft: current((id) => {
        if (joinable()) removeGuest(id);
        else if (role === 'join' && (id === state.hostId || !state.hostId)) {
          terminate(state.status === 'connected' ? 'room-closed' : 'connection-failed');
        }
      }),
      data: current((id, raw) => {
        if (!validId(id) || id === state.selfId) return;
        const message = packet(raw);
        if (!message) return;
        if (joinable()) receiveGuest(id, message);
        else if (id === state.hostId) receiveHost(message);
      }),
      error: current(terminate),
    };

    armTimeout = setTimeout(() => handlers.error('timeout'), CONNECT_TIMEOUT);
    try {
      const factory = transportFactory ?? (relayUrl ? openRelay : openPeerRoom);
      transport = factory(role, code, { ...options, relayUrl }, handlers);
    } catch {
      terminate('connection-failed');
      return false;
    }
    emit();
    return true;
  }

  function host(options = {}) {
    return begin('host', token(6), options);
  }

  function join(code, options = {}) {
    return begin('join', normalizeCode(code), options);
  }

  function startRound(config = {}) {
    if (!joinable() || state.players.length < 2) return false;
    const now = Date.now();
    const round = {
      id: token(12),
      mapId: MAPS.has(config.mapId) ? config.mapId : 'coast',
      weather: WEATHER.has(config.weather) ? config.weather : 'clear',
      timeOfDay: TIMES.has(config.timeOfDay) ? config.timeOfDay : 'day',
      seed: Number.isFinite(config.seed) ? config.seed >>> 0 : randomSeed(),
      startsAt: readNumber(config.startsAt, now + 1300, now + 14000, now + 3200),
      duration: Math.floor(readNumber(config.duration, 15, 1800, 180)),
    };
    broadcast({ type: 'round', round });
    applyRound(round);
    return true;
  }

  function sendSnapshot(raw) {
    if (state.status !== 'connected' || !state.round) return false;
    const now = performance.now();
    if (now - lastSnapshotTime < SNAPSHOT_INTERVAL) return false;
    const snapshot = sanitizeSnapshot(raw);
    if (!snapshot) return false;
    snapshot.seq = ++localSequence;
    lastSnapshotTime = now;
    const message = { type: 'snapshot', player: state.selfId, round: state.round.id, snapshot };
    if (state.role === 'host') broadcast(message);
    else send(state.hostId, message);
    return true;
  }

  function leave() {
    if (state.status === 'connected') {
      if (state.role === 'host') broadcast({ type: 'room-closed' });
      else send(state.hostId, { type: 'leave' });
    }
    disposeTransport();
    clearSession();
    state.status = 'idle';
    state.code = '';
    state.role = null;
    state.transport = null;
    state.error = null;
    state.errorCode = null;
    emit();
  }

  return { state, host, join, startRound, sendSnapshot, leave };
}
