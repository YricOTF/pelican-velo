import '@fontsource-variable/space-grotesk';
import './style.css';

import bird from 'lucide-static/icons/bird.svg?raw';
import sun from 'lucide-static/icons/sun.svg?raw';
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
import { createDrivingInput } from './driving-input.js';

const icons = {
  bird, sun, sunset, route, flag, pause, play, octagon, keyboard,
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
const weatherButton = byId('weather');
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
const toast = byId('toast');
const minimap = byId('minimap');
const controls = [...document.querySelectorAll('[data-drive]')];
const input = createDrivingInput(document.querySelector('.ride-panel'));
const listeners = new AbortController();
const options = { signal: listeners.signal };
let mode = 'loading';
let weather = 'day';
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
    else if (!start.disabled) start.focus({ preventScroll: true });
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
  return ({ position, heading }) => {
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

function showState(state) {
  setText(speedReadout, String(Math.round(state.speed * 3.6)));
  setText(lapReadout, `${state.laps} 圈`);
  setText(timeReadout, formatTime(state.lapTime));
  setText(bestReadout, state.bestLap === null ? '—' : formatTime(state.bestLap, true));
  setText(progressReadout, `${Math.floor(state.progress * 100)}%`);
  offroad.hidden = !state.offroad;
  map?.(state);

  if (state.laps > laps) showToast(`完成第 ${state.laps} 圈 · ${formatTime(state.lastLap, true)}`);
  if (state.respawns > respawns) showToast('已回到公路');
  laps = state.laps;
  respawns = state.respawns;
}

start.addEventListener('click', () => {
  if (mode === 'ready' || mode === 'paused') setMode('playing', true);
}, options);
pauseButton.addEventListener('click', () => setMode('paused', true), options);
recover.addEventListener('click', () => game?.recover(), options);
weatherButton.addEventListener('click', () => {
  weather = weather === 'day' ? 'sunset' : 'day';
  document.documentElement.dataset.weather = weather;
  byId('weather-label').textContent = weather === 'day' ? '晴天' : '日落';
  weatherButton.setAttribute('aria-label', weather === 'day' ? '切换为日落' : '切换为晴天');
  game?.setWeather(weather);
}, options);
document.addEventListener('keydown', (event) => {
  if (!game || !contextReady || event.altKey || event.ctrlKey || event.metaKey || event.repeat || event.isComposing) return;
  if (event.code === 'KeyR' && mode === 'playing') game.recover();
  if (event.code !== 'Space' || event.target.closest?.('button, input, select, textarea, [contenteditable]')) return;
  if (mode === 'ready' || mode === 'paused' || mode === 'playing') {
    event.preventDefault();
    setMode(mode === 'playing' ? 'paused' : 'playing', true);
  }
}, options);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && mode === 'playing') setMode('paused');
}, options);

try {
  const { createRideScene } = await import('./ride-scene.js');
  game = createRideScene(viewport, {
    getInput: input.read,
    onState: showState,
    onContextStatus(ready) {
      contextReady = ready;
      if (!ready && mode === 'playing') setMode('paused');
      else setMode(mode);
      if (!ready) startLabel.textContent = '正在恢复 3D 场景';
      else startLabel.textContent = mode === 'ready' ? '开始骑行' : '继续骑行';
    },
  });
  map = createMinimap(game.route);
  byId('route-length').textContent = `${Math.round(game.length)} m`;
  game.setWeather(weather);
  setMode('ready');
} catch (error) {
  console.error(error);
  setMode('unavailable');
  briefTitle.textContent = '3D 场景无法启动';
  briefCopy.textContent = '请使用支持 WebGL 2 的浏览器。';
  start.hidden = true;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearTimeout(toastTimer);
    listeners.abort();
    input.dispose();
    game?.dispose();
  });
}
