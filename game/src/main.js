import '@fontsource-variable/space-grotesk';
import './style.css';

import bird from 'lucide-static/icons/bird.svg?raw';
import sun from 'lucide-static/icons/sun.svg?raw';
import moon from 'lucide-static/icons/moon.svg?raw';
import clouds from 'lucide-static/icons/cloud.svg?raw';
import rain from 'lucide-static/icons/cloud-rain.svg?raw';
import fog from 'lucide-static/icons/cloud-fog.svg?raw';
import sunset from 'lucide-static/icons/sunset.svg?raw';
import route from 'lucide-static/icons/route.svg?raw';
import flag from 'lucide-static/icons/flag.svg?raw';
import clock from 'lucide-static/icons/clock-3.svg?raw';
import pause from 'lucide-static/icons/pause.svg?raw';
import play from 'lucide-static/icons/play.svg?raw';
import reset from 'lucide-static/icons/rotate-ccw.svg?raw';
import left from 'lucide-static/icons/chevron-left.svg?raw';
import right from 'lucide-static/icons/chevron-right.svg?raw';
import octagon from 'lucide-static/icons/octagon.svg?raw';
import arrowUp from 'lucide-static/icons/arrow-up.svg?raw';
import keyboard from 'lucide-static/icons/keyboard.svg?raw';
import users from 'lucide-static/icons/users.svg?raw';
import shuffle from 'lucide-static/icons/shuffle.svg?raw';
import check from 'lucide-static/icons/check.svg?raw';
import copy from 'lucide-static/icons/copy.svg?raw';
import house from 'lucide-static/icons/house.svg?raw';
import { createDrivingInput } from './driving-input.js';
import { getMap, maps, defaultMapId } from './maps.js';

const icons = {
  bird, sun, route, flag, pause, play, octagon, keyboard, users, shuffle, check, copy, house,
  'clock-3': clock,
  'rotate-ccw': reset,
  'chevron-left': left,
  'chevron-right': right,
  'arrow-up': arrowUp,
};
for (const element of document.querySelectorAll('[data-icon]')) {
  element.innerHTML = icons[element.dataset.icon];
}

const byId = (id) => document.getElementById(id);
const stage = byId('stage');
const viewport = byId('viewport');
const start = byId('start');
const pauseButton = byId('pause');
const recover = byId('recover');
const shell = document.querySelector('.shell');
const roomForm = byId('room-form');
const roomLobby = byId('room-lobby');
const statusText = byId('room-status');
const connection = byId('connection');
const host = byId('host');
const join = byId('join');
const lobbyMap = byId('lobby-map');
const mapCards = [...document.querySelectorAll('[data-map-id]')];
const weatherLabels = { clear: '晴天', cloudy: '多云', rain: '雨天', mist: '薄雾' };
const timeLabels = { day: '白天', dusk: '黄昏', night: '夜晚' };
const weatherSymbols = { cloudy: clouds, rain, mist: fog };
const timeSymbols = { day: sun, dusk: sunset, night: moon };
const heroImage = document.querySelector('.hero-image');
const poster = viewport.querySelector('.fallback-image');
const brief = byId('brief');
const briefTitle = byId('brief-title');
const briefCopy = byId('brief-copy');
const startLabel = byId('start-label');
const speedReadout = byId('speed');
const lapReadout = byId('laps');
const timeReadout = byId('lap-time');
const bestReadout = byId('best-time');
const progressReadout = byId('lap-progress');
const offroad = byId('offroad');
const trafficWarning = byId('traffic-warning');
const toast = byId('toast');
const minimap = byId('minimap');
const controls = [...document.querySelectorAll('[data-drive]')];
const input = createDrivingInput(document.querySelector('.ride-panel'));
const listeners = new AbortController();
const options = { signal: listeners.signal };
let mode = 'loading';
let chosenMap = defaultMapId;
let screen = 'home';
let multiplayer;
let lobbyState;
let roomRide = false;
let sessionVersion = 0;
let startTimer;
let roomRequest = 0;
const remoteSnapshots = new Map();
let game;
let map;
let laps = 0;
let respawns = 0;
let toastTimer;
let contextReady = true;

function setText(element, text) {
  if (element.textContent !== text) element.textContent = text;
}

function formatTime(seconds, precise = false) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  const wholeSeconds = String(Math.floor(remainder)).padStart(2, '0');
  const tenths = Math.floor((remainder % 1) * 10);
  return `${minutes}:${wholeSeconds}${precise ? '.' + tenths : ''}`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

function setMode(next, moveFocus = false) {
  mode = next;
  stage.dataset.mode = mode;
  game?.setMode(mode);
  if (mode !== 'playing') input.clear();
  const playing = mode === 'playing' && contextReady;
  brief.hidden = playing;
  pauseButton.disabled = !playing;
  recover.disabled = !playing;
  for (const control of controls) control.disabled = !playing;
  const ready = mode === 'ready';
  start.disabled = !contextReady || !(ready || mode === 'paused');
  if (ready) {
    briefTitle.textContent = '准备出发';
    startLabel.textContent = '开始骑行';
  } else if (mode === 'paused') {
    briefTitle.textContent = '骑行暂停';
    startLabel.textContent = '继续骑行';
  }
  if (moveFocus) {
    if (playing) viewport.focus({ preventScroll: true });
    else if (!start.disabled && window.matchMedia('(pointer: fine)').matches) start.focus({ preventScroll: true });
  }
}

function createMinimap(points) {
  const ctx = minimap.getContext('2d');
  if (!ctx) return null;
  const xs = points.map(({ x }) => x);
  const zs = points.map(({ z }) => z);
  const minX = Math.min(...xs);
  const minZ = Math.min(...zs);
  const width = Math.max(...xs) - minX;
  const height = Math.max(...zs) - minZ;
  const scale = Math.min((minimap.width - 24) / width, (minimap.height - 16) / height);
  const left = (minimap.width - width * scale) / 2;
  const top = (minimap.height - height * scale) / 2;
  const mapX = (x) => left + (x - minX) * scale;
  const mapY = (z) => top + (z - minZ) * scale;
  const path = new Path2D();
  const first = points[0];
  path.moveTo(mapX(first.x), mapY(first.z));
  for (const point of points.slice(1)) path.lineTo(mapX(point.x), mapY(point.z));
  path.closePath();
  return ({ position, heading }, cars) => {
    ctx.clearRect(0, 0, minimap.width, minimap.height);
    ctx.fillStyle = '#c3eee721';
    ctx.fill(path);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#b8d6c969';
    ctx.stroke(path);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e6efd9a6';
    ctx.setLineDash([3, 4]);
    ctx.stroke(path);
    ctx.setLineDash([]);
    ctx.fillStyle = '#f1f1da';
    ctx.fillRect(mapX(first.x) - 2, mapY(first.z) - 4, 4, 8);
    ctx.fillStyle = '#ffba9b';
    for (const car of cars) {
      ctx.beginPath();
      ctx.arc(mapX(car.position.x), mapY(car.position.z), 2.2, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = '#8ad7ff';
    for (const snapshot of remoteSnapshots.values()) {
      ctx.beginPath();
      ctx.arc(mapX(snapshot.x), mapY(snapshot.z), 3, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(mapX(position.x), mapY(position.z));
    ctx.rotate(heading);
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-5, -4);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fillStyle = '#dbfa78';
    ctx.strokeStyle = '#263f2d';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  };
}

function showState(state, cars) {
  setText(speedReadout, String(Math.round(state.speed * 3.6)));
  setText(lapReadout, `${state.laps} 圈`);
  setText(timeReadout, formatTime(state.lapTime));
  setText(bestReadout, state.bestLap === null ? '—' : formatTime(state.bestLap, true));
  setText(progressReadout, `${Math.floor(state.progress * 100)}%`);
  trafficWarning.hidden = !state.yielding;
  offroad.hidden = !state.offroad || state.yielding;
  map?.(state, cars);

  if (state.laps > laps) showToast(`完成第 ${state.laps} 圈 · ${formatTime(state.lastLap, true)}`);
  if (state.respawns > respawns) showToast('已回到公路');
  laps = state.laps;
  respawns = state.respawns;
}

function showScreen(next) {
  screen = next;
  shell.dataset.screen = next;
  for (const id of ['home', 'online', 'ride']) byId(id).hidden = id !== next;
  byId('home-label').hidden = next === 'ride';
  byId('conditions').hidden = next !== 'ride';
  byId('ride-footer').hidden = next !== 'ride';
  window.scrollTo(0, 0);
}

function clearRide() {
  sessionVersion += 1;
  clearTimeout(startTimer);
  clearTimeout(toastTimer);
  input.clear();
  game?.dispose();
  game = null;
  map = null;
  viewport.removeAttribute('data-ready');
  remoteSnapshots.clear();
  roomRide = false;
  laps = 0;
  respawns = 0;
  contextReady = true;
  toast.hidden = true;
  trafficWarning.hidden = true;
  offroad.hidden = true;
  minimap.getContext('2d')?.clearRect(0, 0, minimap.width, minimap.height);
  setText(speedReadout, '0');
  setText(lapReadout, '0 圈');
  setText(timeReadout, '0:00');
  setText(bestReadout, '—');
  setText(progressReadout, '0%');
  byId('route-length').textContent = '';
}

function chooseConditions(mapId) {
  const weatherIds = Object.keys(weatherLabels);
  const timeIds = Object.keys(timeLabels);
  const random = crypto.getRandomValues(new Uint32Array(3));
  return {
    mapId,
    weather: weatherIds[random[0] % weatherIds.length],
    timeOfDay: timeIds[Math.floor(random[1] / 4294967296 * timeIds.length)],
    seed: random[2],
  };
}

async function openRide(config, online = false) {
  clearRide();
  const version = sessionVersion;
  roomRide = online;
  document.documentElement.dataset.weather = config.weather;
  document.documentElement.dataset.time = config.timeOfDay;
  const course = getMap(config.mapId);
  byId('ride-name').textContent = course.name;
  byId('ride-edition').textContent = course.label;
  const conditionsText = `${weatherLabels[config.weather]} · ${timeLabels[config.timeOfDay]}`;
  byId('conditions-label').textContent = conditionsText;
  byId('conditions-inline').textContent = conditionsText;
  byId('conditions-icon').innerHTML = weatherSymbols[config.weather] ?? timeSymbols[config.timeOfDay];
  poster.src = mapCards.find((card) => card.dataset.mapId === course.id).querySelector('img').src;
  byId('route-context').textContent = online ? `联机 · ${lobbyState.players.length} 人` : '环岛公路';
  start.hidden = false;
  briefTitle.textContent = '准备出发';
  briefCopy.innerHTML = '<span class="desktop-copy">用方向键或 WASD 控车，留意来往车辆。</span><span class="touch-copy">按住踩踏加速，同时按左转或右转。</span>';
  startLabel.textContent = '正在加载';
  setMode('loading');
  showScreen('ride');

  try {
    const { createRideScene } = await import('./ride-scene.js');
    if (version !== sessionVersion) return;
    const slot = online ? lobbyState.players.find(({ id }) => id === lobbyState.selfId)?.slot ?? 0 : 0;
    game = createRideScene(viewport, {
      mapId: course.id,
      weather: config.weather,
      timeOfDay: config.timeOfDay,
      slot,
      getInput: input.read,
      onState: showState,
      onSnapshot: online ? (snapshot) => multiplayer?.sendSnapshot(snapshot) : null,
      onContextStatus(ready) {
        contextReady = ready;
        if (!ready && mode === 'playing') setMode('paused');
        else setMode(mode);
        if (!ready) startLabel.textContent = '正在恢复 3D 场景';
        else if (mode === 'ready' || mode === 'paused') startLabel.textContent = mode === 'ready' ? '开始骑行' : '继续骑行';
      },
    });
    map = createMinimap(game.route);
    byId('route-length').textContent = `${Math.round(game.length)} m`;
    setMode('ready');
    if (online) {
      game.setPlayers(lobbyState.players, lobbyState.selfId);
      const wait = Math.max(0, Math.min(4500, config.startsAt - Date.now()));
      if (wait > 0) {
        start.disabled = true;
        startLabel.textContent = '等待房间同步';
        startTimer = setTimeout(() => setMode('playing'), wait);
      } else setMode('playing');
    }
  } catch (error) {
    console.error(error);
    if (version !== sessionVersion) return;
    setMode('unavailable');
    briefTitle.textContent = '3D 场景无法启动';
    briefCopy.textContent = '请使用支持 WebGL 2 的浏览器。';
    start.hidden = true;
  }
}

function updateRoomStatus(text, problem = false) {
  statusText.textContent = text;
  statusText.dataset.error = String(problem);
}

const connectionNames = { direct: 'WebRTC 直连', turn: 'WebRTC + TURN', relay: 'WebSocket 中继' };
const connectionHints = {
  direct: '使用公共信令服务，适合网络能直接互通时使用。',
  turn: '网络直连受阻时可用 TURN。各玩家可以填写自己的凭据。',
  relay: '所有玩家通过同一个中继地址连接。适用于已部署的房间服务器。',
};

function syncConnectionFields() {
  const option = connection.value;
  byId('turn-fields').hidden = option !== 'turn';
  byId('relay-fields').hidden = option !== 'relay';
  byId('connection-hint').textContent = connectionHints[option];
}
connection.addEventListener('change', syncConnectionFields, options);

function networkOptions() {
  const name = byId('rider-name').value.trim();
  if (connection.value === 'turn') {
    const urls = byId('turn-url').value.trim().split(/[\s,]+/).filter(Boolean);
    const username = byId('turn-user').value.trim();
    const credential = byId('turn-secret').value;
    if (!urls.length || urls.some((url) => !/^turns?:[^\s]+$/i.test(url)) || !username || !credential) {
      updateRoomStatus('请输入有效的 TURN 地址、用户名和凭据。', true);
      return null;
    }
    return { name, iceServers: [{ urls, username, credential }] };
  }
  if (connection.value === 'relay') {
    const relayUrl = byId('relay-url').value.trim();
    if (!relayUrl) {
      updateRoomStatus('请填写中继服务器地址。', true);
      return null;
    }
    return { name, relayUrl };
  }
  return { name };
}

function showRoomState(state) {
  lobbyState = state;
  const connected = state.status === 'connected';
  const pending = state.status === 'connecting';
  host.disabled = pending;
  join.disabled = pending;
  roomForm.hidden = connected;
  roomLobby.hidden = !connected;
  if (state.error) updateRoomStatus(state.error, true);
  else if (pending) updateRoomStatus('正在连接房间…');
  else if (connected) updateRoomStatus(state.role === 'host' ? '将房间码发给好友，等好友加入后开始。' : '等待房主开始骑行。');
  else updateRoomStatus('');
  if (connected) {
    byId('lobby-code').textContent = state.code;
    byId('lobby-transport').textContent = connectionNames[state.transport === 'relay' ? 'relay' : connection.value] + ` · ${state.players.length}/4 人`;
    const owner = state.role === 'host';
    byId('host-course').hidden = !owner;
    byId('start-round').hidden = !owner;
    byId('start-round').disabled = !owner || state.players.length < 2;
    byId('lobby-players').replaceChildren(...state.players.map((player) => {
      const row = document.createElement('li');
      const tag = document.createElement('small');
      tag.textContent = player.id === state.hostId ? '房主' : '已连接';
      row.append(document.createTextNode(player.name), tag);
      return row;
    }));
  }
  if (roomRide && screen === 'ride') {
    const playerIds = new Set((state.players ?? []).map(({ id }) => id));
    for (const id of remoteSnapshots.keys()) if (!playerIds.has(id)) remoteSnapshots.delete(id);
    game?.setPlayers(state.players ?? [], state.selfId);
    byId('route-context').textContent = connected ? `联机 · ${state.players.length} 人` : '联机已断开';
    if (!connected && state.error) showToast(state.error);
  }
}

async function requestRoom(role) {
  const config = networkOptions();
  const code = byId('room-code').value;
  if (!config) return;
  const request = ++roomRequest;
  try {
    if (!multiplayer) {
      host.disabled = true;
      join.disabled = true;
      updateRoomStatus('正在准备联机…');
      const { createMultiplayer } = await import('./multiplayer.js');
      if (screen !== 'online' || request !== roomRequest) return;
      multiplayer = createMultiplayer({
        onState: showRoomState,
        onRound: (round) => openRide(round, true),
        onSnapshot(id, snapshot) {
          if (!roomRide) return;
          remoteSnapshots.set(id, snapshot);
          game?.receiveSnapshot(id, snapshot);
        },
      });
    }
    if (role === 'host') await multiplayer.host(config);
    else await multiplayer.join(code, config);
  } catch (error) {
    host.disabled = false;
    join.disabled = false;
    updateRoomStatus(error.message || '暂时无法联机，请重试。', true);
  }
}

for (const course of maps) lobbyMap.add(new Option(course.name, course.id));
for (const card of mapCards) card.addEventListener('click', () => {
  chosenMap = card.dataset.mapId;
  heroImage.src = card.querySelector('img').src;
  for (const item of mapCards) item.setAttribute('aria-pressed', String(item === card));
}, options);
byId('solo').addEventListener('click', () => openRide(chooseConditions(chosenMap)), options);
byId('show-online').addEventListener('click', () => {
  lobbyMap.value = chosenMap;
  showScreen('online');
}, options);
byId('back-online').addEventListener('click', () => {
  roomRequest += 1;
  multiplayer?.leave();
  showScreen('home');
}, options);
byId('back-game').addEventListener('click', () => {
  multiplayer?.leave();
  clearRide();
  showScreen('home');
}, options);
host.addEventListener('click', () => requestRoom('host'), options);
roomForm.addEventListener('submit', (event) => {
  event.preventDefault();
  requestRoom('guest');
}, options);
byId('leave-room').addEventListener('click', () => multiplayer?.leave(), options);
byId('copy-code').addEventListener('click', async () => {
  if (!lobbyState?.code) return;
  try {
    await navigator.clipboard.writeText(lobbyState.code);
    updateRoomStatus('已复制房间码。');
  } catch {
    updateRoomStatus(`房间码 ${lobbyState.code}`);
  }
}, options);
byId('start-round').addEventListener('click', () => {
  if (lobbyState?.role !== 'host' || lobbyState.players.length < 2) return;
  multiplayer.startRound({ ...chooseConditions(lobbyMap.value), startsAt: Date.now() + 2500 });
}, options);

start.addEventListener('click', () => {
  if (mode === 'ready' || mode === 'paused') setMode('playing', true);
}, options);
pauseButton.addEventListener('click', () => setMode('paused', true), options);
recover.addEventListener('click', () => game?.recover(), options);
document.addEventListener('keydown', (event) => {
  if (screen !== 'ride' || !game || !contextReady || event.altKey || event.ctrlKey || event.metaKey || event.repeat || event.isComposing) return;
  if (event.code === 'KeyR' && mode === 'playing') game.recover();
  if (event.code !== 'Space' || event.target.closest?.('button, input, select, textarea, [contenteditable]')) return;
  if ((mode === 'ready' && !start.disabled) || mode === 'paused' || mode === 'playing') {
    event.preventDefault();
    setMode(mode === 'playing' ? 'paused' : 'playing', true);
  }
}, options);
function pauseOnExit() {
  if (screen === 'ride' && mode === 'playing') setMode('paused');
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseOnExit();
}, options);
window.addEventListener('pagehide', pauseOnExit, options);

byId('relay-url').value = import.meta.env.VITE_MULTIPLAYER_RELAY_URL ?? '';
byId('solo').disabled = false;
byId('show-online').disabled = false;
syncConnectionFields();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    listeners.abort();
    input.dispose();
    multiplayer?.leave();
    clearRide();
  });
}
