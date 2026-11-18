import '@fontsource-variable/space-grotesk';
import './style.css';

import birdIcon from 'lucide-static/icons/bird.svg?raw';
import sunIcon from 'lucide-static/icons/sun.svg?raw';
import sunsetIcon from 'lucide-static/icons/sunset.svg?raw';
import resetIcon from 'lucide-static/icons/rotate-ccw.svg?raw';
import pinIcon from 'lucide-static/icons/map-pin.svg?raw';
import moveIcon from 'lucide-static/icons/move.svg?raw';
import playIcon from 'lucide-static/icons/play.svg?raw';
import pauseIcon from 'lucide-static/icons/pause.svg?raw';
import routeIcon from 'lucide-static/icons/route.svg?raw';

const icons = {
  bird: birdIcon,
  sun: sunIcon,
  sunset: sunsetIcon,
  'rotate-ccw': resetIcon,
  'map-pin': pinIcon,
  move: moveIcon,
  play: playIcon,
  pause: pauseIcon,
  route: routeIcon,
};
for (const element of document.querySelectorAll('[data-icon]')) {
  element.innerHTML = icons[element.dataset.icon];
}

const viewport = document.querySelector('#viewport');
const stage = document.querySelector('#stage');
const playback = document.querySelector('#playback');
const speedInput = document.querySelector('#speed');
const speedValue = document.querySelector('#speed-value');
const distanceValue = document.querySelector('#distance-value');
const reset = document.querySelector('#reset');
const weatherButton = document.querySelector('#weather');
const weatherLabel = document.querySelector('#weather-label');
const playbackState = document.querySelector('#playback-state');
const playIconElement = document.querySelector('#play-icon');
const pauseIconElement = document.querySelector('#pause-icon');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let isPlaying = !prefersReducedMotion.matches;
let isAvailable = true;
let weather = 'day';
let scene;

function changePlayback(playing) {
  isPlaying = playing;
  const action = playing ? '暂停骑行' : '开始骑行';
  playback.title = action;
  playback.setAttribute('aria-label', action);
  playbackState.textContent = playing ? '骑行中' : '已暂停';
  playIconElement.hidden = playing;
  pauseIconElement.hidden = !playing;
  scene?.setPlaying(playing);
}

function updateSpeed() {
  const speed = speedInput.valueAsNumber;
  const min = Number(speedInput.min);
  const max = Number(speedInput.max);
  speedValue.value = String(speed);
  speedInput.style.setProperty('--progress', `${100 * (speed - min) / (max - min)}%`);
  speedInput.setAttribute('aria-valuetext', `${speed} 公里/小时`);
  scene?.setSpeed(speed);
}

function showUnavailable() {
  isAvailable = false;
  changePlayback(false);
  playback.disabled = true;
  reset.disabled = true;
  speedInput.disabled = true;
  document.querySelector('.stage-hint').hidden = true;
  const message = document.createElement('div');
  message.className = 'fallback-message';
  message.setAttribute('role', 'status');
  message.textContent = '当前浏览器无法显示 3D 场景。';
  stage.append(message);
}

const listeners = new AbortController();
playback.addEventListener('click', () => changePlayback(!isPlaying));
speedInput.addEventListener('input', updateSpeed);
weatherButton.addEventListener('click', () => {
  weather = weather === 'day' ? 'sunset' : 'day';
  document.documentElement.dataset.weather = weather;
  weatherLabel.textContent = weather === 'day' ? '晴天' : '日落';
  weatherButton.setAttribute('aria-label', weather === 'day' ? '切换为日落场景' : '切换为晴天场景');
  scene?.setWeather(weather);
});
reset.addEventListener('click', () => scene?.resetCamera());
document.addEventListener('keydown', (event) => {
  if (!scene || !isAvailable || event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('button, input, select, textarea, [contenteditable]')) return;
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault();
    changePlayback(!isPlaying);
  }
  if (event.key.toLowerCase() === 'r') scene.resetCamera();
}, { signal: listeners.signal });
prefersReducedMotion.addEventListener('change', (event) => {
  if (event.matches && isAvailable) changePlayback(false);
}, { signal: listeners.signal });

changePlayback(isPlaying);
updateSpeed();

try {
  const { createRideScene } = await import('./ride-scene.js');
  scene = createRideScene(viewport, {
    onDistance: (kilometers) => {
      const formatted = kilometers.toFixed(2);
      if (distanceValue.textContent !== formatted) distanceValue.textContent = formatted;
    },
  });
  scene.setPlaying(isPlaying);
  scene.setSpeed(speedInput.valueAsNumber);
  scene.setWeather(weather);
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      listeners.abort();
      scene.dispose();
    });
  }
} catch (error) {
  console.error(error);
  showUnavailable();
}
