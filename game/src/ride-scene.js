import * as THREE from 'three';
import { createBicycle } from './bicycle.js';
import { createCar } from './car.js';
import { createPelican } from './pelican.js';
import { createIsland } from './island.js';
import { createRidePhysics } from './ride-physics.js';
import { createTraffic } from './traffic.js';
import { createWeatherEffects, getConditionsVisuals } from './weather.js';

const step = 1 / 120;
const tau = Math.PI * 2;

function createContactShadow() {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const radius = Math.hypot(x / (size - 1) * 2 - 1, y / (size - 1) * 2 - 1);
      const index = (y * size + x) * 4;
      pixels[index] = 33;
      pixels[index + 1] = 42;
      pixels[index + 2] = 34;
      pixels[index + 3] = Math.round(85 * Math.max(0, 1 - radius) ** 1.8);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 2.05),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  return shadow;
}

export function createRideScene(viewport, {
  getInput, onState, onContextStatus, onSnapshot,
  mapId = 'coast', weather = 'clear', timeOfDay = 'day', slot = 0,
}) {
  const scene = new THREE.Scene();
  const conditions = getConditionsVisuals(weather, timeOfDay);
  scene.fog = new THREE.FogExp2(conditions.fogColor, conditions.fogDensity);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.2, 420);
  const appleTouch = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !appleTouch, powerPreference: 'default' });
  const mobilePixelBudget = appleTouch ? 640_000 : 830_000;
  const pixelRatioLimit = appleTouch ? 1.35 : coarsePointer ? 1.4 : 1.7;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.17;
  viewport.append(renderer.domElement);

  const ambient = new THREE.HemisphereLight(conditions.ambientColor, conditions.groundColor, conditions.ambientIntensity);
  const key = new THREE.DirectionalLight(conditions.keyColor, conditions.keyIntensity);
  key.position.set(...conditions.keyPosition);
  const rim = new THREE.DirectionalLight(conditions.rimColor, conditions.rimIntensity);
  rim.position.set(2.2, 3, -3);
  const weatherEffects = createWeatherEffects();
  scene.add(ambient, key, rim, weatherEffects.group);

  const waterCondition = timeOfDay === 'night' ? 'night' : timeOfDay === 'dusk' ? 'sunset' : weather;
  const island = createIsland(mapId);
  const traffic = createTraffic(island.curve, island.roadWidth);
  const physics = createRidePhysics(island.curve, island.roadWidth, traffic);
  const trafficModels = traffic.cars.map((car) => {
    const model = createCar(car.style);
    scene.add(model.group);
    return model;
  });
  const bicycle = createBicycle();
  const pelican = createPelican();
  const lean = new THREE.Group();
  lean.add(bicycle.group, pelican.group);
  const rider = new THREE.Group();
  rider.add(lean);

  const shadow = createContactShadow();
  const wheels = new THREE.Group();
  wheels.add(shadow);
  scene.add(island.group, rider, wheels);

  const cameraGoal = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  const targetGoal = new THREE.Vector3();
  if (slot > 0) {
    const offset = [0, -1.05, 1.05, 2.1][Math.min(slot, 3)];
    const { position, heading } = physics.state;
    position.x -= Math.sin(heading) * offset;
    position.z += Math.cos(heading) * offset;
  }
  const viewOrigin = physics.state.position.clone();
  const remoteRiders = new Map();
  const retiredRiders = new Map();
  let mode = 'ready';
  let frame = 0;
  let steppedTime = 0;
  let previousFrame = 0;
  let accumulator = 0;
  let nextReport = 0;
  let wheelAngle = 0;
  let crankAngle = 0.5;
  let visible = true;
  let contextLost = false;
  let snapCamera = true;
  let previousRespawns = physics.state.respawns;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let canvasRatio = 0;
  const trafficDrawDistance = coarsePointer ? 94 : 136;

  function requestFrame() {
    if (frame || !visible || document.hidden || contextLost) return;
    frame = requestAnimationFrame(render);
  }

  function updateCamera(delta) {
    const { position, heading, speed } = physics.state;
    const forwardX = Math.cos(heading);
    const forwardZ = Math.sin(heading);
    const rightX = -forwardZ;
    const rightZ = forwardX;
    const narrow = camera.aspect < 1;
    if (mode === 'ready') {
      const side = narrow ? -4.65 : -4.55;
      const advance = narrow ? 3.6 : 2.45;
      cameraGoal.set(
        viewOrigin.x + forwardX * advance + rightX * side,
        2.8,
        viewOrigin.z + forwardZ * advance + rightZ * side,
      );
      const subjectOffset = narrow ? 0 : 0.55;
      targetGoal.set(viewOrigin.x + rightX * subjectOffset, narrow ? 1.27 : 1.30, viewOrigin.z + rightZ * subjectOffset);
    } else {
      const setback = (narrow ? 6.1 : 5.75) + Math.min(speed, 14) * 0.047;
      const side = narrow ? 0.9 : 1.35;
      cameraGoal.set(
        position.x - forwardX * setback + rightX * side,
        position.y + (narrow ? 3.6 : 3.25),
        position.z - forwardZ * setback + rightZ * side,
      );
      const lookAhead = narrow ? 6 : 7.4;
      targetGoal.set(
        position.x + forwardX * lookAhead + rightX * side * .43,
        position.y + 1.45,
        position.z + forwardZ * lookAhead + rightZ * side * .43,
      );
    }

    if (snapCamera) {
      camera.position.copy(cameraGoal);
      cameraTarget.copy(targetGoal);
      snapCamera = false;
    } else {
      const easing = 1 - Math.exp(-delta * (reduceMotion ? 12 : 6.6));
      camera.position.lerp(cameraGoal, easing);
      cameraTarget.lerp(targetGoal, easing);
    }
    camera.lookAt(cameraTarget);
  }

  function setPlayers(players, selfId) {
    const others = new Set(players.filter(({ id }) => id !== selfId).map(({ id }) => id));
    for (const [id, remote] of remoteRiders) {
      if (others.has(id)) continue;
      remote.group.visible = false;
      remoteRiders.delete(id);
      retiredRiders.set(id, remote);
    }
    for (const player of players) {
      if (player.id === selfId || remoteRiders.has(player.id)) continue;
      const previous = retiredRiders.get(player.id);
      if (previous) {
        retiredRiders.delete(player.id);
        remoteRiders.set(player.id, previous);
        continue;
      }
      const bike = createBicycle();
      const bird = createPelican();
      const group = new THREE.Group();
      const body = new THREE.Group();
      body.add(bike.group, bird.group);
      group.add(body);
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(.14),
        new THREE.MeshBasicMaterial({ color: [0xe6fc90, 0x8ad7ff, 0xf3a2ac, 0xffcd7c][player.slot] ?? 0xe6fc90 }),
      );
      marker.position.y = 3.15;
      group.add(marker);
      group.visible = false;
      scene.add(group);
      remoteRiders.set(player.id, { group, body, bird, bike, snapshot: null, heading: 0, received: 0 });
    }
    requestFrame();
  }

  function receiveSnapshot(id, snapshot) {
    const remote = remoteRiders.get(id);
    if (!remote) return;
    if (!remote.snapshot || remote.group.position.distanceToSquared(new THREE.Vector3(snapshot.x, snapshot.y, snapshot.z)) > 18 ** 2) {
      remote.group.position.set(snapshot.x, snapshot.y, snapshot.z);
      remote.heading = snapshot.heading;
    }
    remote.snapshot = snapshot;
    remote.received = performance.now();
    requestFrame();
  }

  const remoteTarget = new THREE.Vector3();
  function renderRemoteRiders(now, delta) {
    const blend = 1 - Math.exp(-11 * Math.max(delta, .001));
    for (const remote of remoteRiders.values()) {
      const snapshot = remote.snapshot;
      const age = (now - remote.received) * .001;
      remote.group.visible = Boolean(snapshot && age < 4
        && remote.group.position.distanceToSquared(camera.position) < trafficDrawDistance ** 2);
      if (!remote.group.visible) continue;
      const prediction = Math.min(.09, Math.max(0, age)) * snapshot.speed;
      remoteTarget.set(snapshot.x + Math.cos(snapshot.heading) * prediction, snapshot.y, snapshot.z + Math.sin(snapshot.heading) * prediction);
      remote.group.position.lerp(remoteTarget, blend);
      const angle = snapshot.heading - remote.heading;
      remote.heading += Math.atan2(Math.sin(angle), Math.cos(angle)) * blend;
      remote.group.rotation.y = -remote.heading;
      remote.body.rotation.x = .20 * snapshot.steer * Math.min(1, snapshot.speed / 8);
      remote.bike.update(snapshot.wheelAngle, snapshot.crankAngle);
      remote.bird.update(steppedTime, snapshot.crankAngle, snapshot.speed / 12);
    }
  }

  function render(now) {
    frame = 0;
    const delta = previousFrame ? Math.min((now - previousFrame) * .001, .1) : 0;
    previousFrame = now;
    const state = physics.state;

    if (mode === 'playing') {
      accumulator += delta;
      const input = getInput();
      while (accumulator >= step) {
        physics.update(step, input);
        traffic.update(step, state);
        steppedTime += step;
        accumulator -= step;
        wheelAngle = (wheelAngle - state.speed * step / .47) % tau;
        crankAngle = (crankAngle - state.speed * (input.throttle ? .57 : .14) * step) % tau;
      }
      if (state.respawns !== previousRespawns) {
        previousRespawns = state.respawns;
        snapCamera = true;
      }
    }

    if (now >= nextReport) {
      onState(state, traffic.cars);
      if (mode === 'playing' && onSnapshot) {
        const { x, y, z } = state.position;
        onSnapshot({ x, y, z, heading: state.heading, speed: state.speed, steer: state.steer,
          elapsed: state.elapsed, laps: state.laps, progress: state.progress, bestLap: state.bestLap,
          distance: state.distance, wheelAngle, crankAngle, offroad: state.offroad, yielding: state.yielding });
      }
      nextReport = now + 85;
    }
    rider.position.copy(state.position);
    rider.rotation.y = -state.heading;
    lean.rotation.x = state.steer * THREE.MathUtils.smoothstep(state.speed, .3, 8) * (reduceMotion ? .14 : .26);
    wheels.position.set(state.position.x, state.position.y + .006, state.position.z);
    wheels.rotation.y = -state.heading;
    bicycle.update(wheelAngle, crankAngle);
    pelican.update(steppedTime, crankAngle, state.speed / 12);
    island.update(steppedTime, waterCondition);
    updateCamera(delta);
    weatherEffects.update(mode === 'playing' ? delta : 0, camera, weather, timeOfDay, reduceMotion || appleTouch);
    renderRemoteRiders(now, delta);
    for (let index = 0; index < traffic.cars.length; index += 1) {
      const car = traffic.cars[index];
      const model = trafficModels[index];
      model.group.visible = car.position.distanceToSquared(camera.position) < trafficDrawDistance ** 2;
      if (!model.group.visible) continue;
      model.group.position.copy(car.position);
      model.group.rotation.y = -car.heading;
      model.update(car.distance, car.braking);
    }
    renderer.render(scene, camera);
    if (viewport.dataset.ready !== 'true') viewport.dataset.ready = 'true';
    if (mode === 'playing') requestFrame();
    else previousFrame = 0;
  }

  function stopFrame() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousFrame = 0;
    accumulator = 0;
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    const budgetRatio = appleTouch || coarsePointer ? Math.sqrt(mobilePixelBudget / (width * height)) : Infinity;
    const ratio = Math.min(window.devicePixelRatio || 1, pixelRatioLimit, budgetRatio);
    if (width === canvasWidth && height === canvasHeight && ratio === canvasRatio) return;
    const narrow = width < height;
    if (!canvasWidth || narrow !== (canvasWidth < canvasHeight)) snapCamera = true;
    canvasWidth = width;
    canvasHeight = height;
    canvasRatio = ratio;
    camera.aspect = width / height;
    camera.fov = narrow ? 58 : 48;
    camera.updateProjectionMatrix();
    renderer.setDrawingBufferSize(width, height, ratio);
    requestFrame();
  }

  function onVisibilityChange() {
    if (document.hidden) stopFrame();
    else requestFrame();
  }

  function handleContextLoss(event) {
    event.preventDefault();
    contextLost = true;
    stopFrame();
    viewport.dataset.ready = 'false';
    onContextStatus(false);
  }

  function handleContextRestore() {
    contextLost = false;
    onContextStatus(true);
    requestFrame();
  }

  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(viewport);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestFrame();
    else stopFrame();
  });
  visibilityObserver.observe(viewport);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pageshow', resize);
  renderer.domElement.addEventListener('webglcontextlost', handleContextLoss);
  renderer.domElement.addEventListener('webglcontextrestored', handleContextRestore);
  resize();

  return {
    length: island.curve.getLength(),
    route: island.curve.getSpacedPoints(240),
    setMode(nextMode) {
      if (mode === 'ready' && nextMode !== 'ready') snapCamera = true;
      mode = nextMode;
      previousFrame = 0;
      requestFrame();
    },
    recover() {
      physics.reset();
      snapCamera = true;
      nextReport = 0;
      requestFrame();
    },
    setPlayers,
    receiveSnapshot,
    dispose() {
      stopFrame();
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', resize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLoss);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestore);
      renderer.domElement.remove();
      const geometries = new Set();
      const materials = new Set();
      const textures = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        for (const material of [object.material].flat()) {
          if (!material) continue;
          materials.add(material);
          for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
          for (const uniform of Object.values(material.uniforms ?? {})) {
            if (uniform.value?.isTexture) textures.add(uniform.value);
          }
        }
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      for (const texture of textures) texture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
