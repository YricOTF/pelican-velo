import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createBicycle } from './bicycle.js';
import { createPelican } from './pelican.js';
import { createScenery } from './scenery.js';

const viewDirection = new THREE.Vector3(0.39, 0.26, 1).normalize();
const center = new THREE.Vector3(0, 0.90, 0);
const tau = 2 * Math.PI;

export function createRideScene(viewport, { onDistance }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.15, 45);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  viewport.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.085;
  controls.rotateSpeed = 0.58;
  controls.zoomSpeed = 0.75;
  controls.minPolarAngle = 0.55;
  controls.maxPolarAngle = 1.56;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

  const ambient = new THREE.HemisphereLight(0xfff4dc, 0x94b2a6, 2.05);
  const key = new THREE.DirectionalLight(0xffead1, 3.05);
  key.position.set(-3.8, 6, 4.1);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -2.6;
  key.shadow.camera.right = 2.6;
  key.shadow.camera.top = 2.6;
  key.shadow.camera.bottom = -2.6;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 16;
  key.shadow.bias = -0.00012;
  key.shadow.normalBias = 0.014;

  const rim = new THREE.DirectionalLight(0xb1e6db, 1.3);
  rim.position.set(2.2, 3.0, -3);
  scene.add(ambient, key, rim);

  const bicycle = createBicycle();
  const pelican = createPelican();
  const scenery = createScenery();
  const rider = new THREE.Group();
  rider.add(bicycle.group, pelican.group);
  scene.add(rider, scenery.group);

  let playing = false;
  let speed = 16;
  let weather = 'day';
  let elapsed = 0;
  let wheelAngle = 0;
  let crankAngle = 0.5;
  let roadDistance = 0;
  let kilometers = 0;
  let frame = 0;
  let previousFrame = 0;
  let visible = true;
  let contextLost = false;
  let dirty = true;
  let fitDistance = 0;
  const offset = new THREE.Vector3();

  function requestFrame() {
    if (frame || !visible || document.hidden || contextLost) return;
    frame = requestAnimationFrame(render);
  }

  function render(now) {
    frame = 0;
    const delta = previousFrame ? Math.min((now - previousFrame) / 1000, 0.05) : 0;
    previousFrame = now;
    if (playing) {
      elapsed += delta;
      const motion = speed / 16;
      roadDistance += (speed / 12) * delta;
      kilometers += speed * delta / 3600;
      wheelAngle = (wheelAngle - (speed / 12) * delta / 0.47) % tau;
      crankAngle = (crankAngle - (2.8 + 2.25 * motion) * delta) % tau;
      onDistance(kilometers);
    }

    const changed = controls.update();
    if (playing || dirty || changed) {
      const motion = Math.min(speed / 16, 2);
      rider.rotation.x = 0.016 * motion * Math.sin(crankAngle + 0.8);
      bicycle.update(wheelAngle, crankAngle, elapsed);
      pelican.update(elapsed, crankAngle, motion);
      scenery.update(elapsed, roadDistance, weather);
      renderer.render(scene, camera);
      if (viewport.dataset.ready !== 'true') viewport.dataset.ready = 'true';
      dirty = false;
    }

    if (playing || changed) requestFrame();
    else previousFrame = 0;
  }

  function invalidate() {
    dirty = true;
    requestFrame();
  }

  function resetCamera() {
    controls.enableDamping = false;
    if (fitDistance && camera.position.distanceTo(controls.target) > 0) controls.update();
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(viewDirection, fitDistance);
    controls.update();
    controls.enableDamping = true;
    invalidate();
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);

    const nextFit = Math.max(7.05, 6.4 / camera.aspect);
    const previousFit = fitDistance;
    fitDistance = nextFit;
    controls.minDistance = fitDistance * 0.65;
    controls.maxDistance = fitDistance * 1.65;
    if (previousFit) {
      offset.copy(camera.position).sub(controls.target).multiplyScalar(fitDistance / previousFit);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      invalidate();
    } else {
      resetCamera();
    }
  }

  function stopFrame() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousFrame = 0;
  }

  function onVisibilityChange() {
    if (document.hidden) stopFrame();
    else invalidate();
  }

  function handleContextLoss(event) {
    event.preventDefault();
    contextLost = true;
    stopFrame();
    viewport.dataset.ready = 'false';
  }

  function handleContextRestore() {
    contextLost = false;
    invalidate();
  }

  function setWeather(nextWeather) {
    weather = nextWeather;
    const sunset = weather === 'sunset';
    ambient.color.set(sunset ? 0xffd0af : 0xfff4dc);
    ambient.groundColor.set(sunset ? 0xab88a1 : 0x94b2a6);
    ambient.intensity = sunset ? 1.75 : 2.05;
    key.color.set(sunset ? 0xffb084 : 0xffead1);
    key.intensity = sunset ? 2.55 : 3.05;
    key.position.set(sunset ? -4.7 : -3.8, sunset ? 4.2 : 6, 4.1);
    rim.color.set(sunset ? 0xf5a8ae : 0xb1e6db);
    invalidate();
  }

  resize();
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(viewport);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) invalidate();
    else stopFrame();
  });
  visibilityObserver.observe(viewport);
  document.addEventListener('visibilitychange', onVisibilityChange);
  renderer.domElement.addEventListener('webglcontextlost', handleContextLoss);
  renderer.domElement.addEventListener('webglcontextrestored', handleContextRestore);
  controls.addEventListener('change', invalidate);

  return {
    resetCamera,
    setWeather,
    setPlaying(value) {
      playing = value;
      invalidate();
    },
    setSpeed(value) {
      speed = value;
      invalidate();
    },
    dispose() {
      stopFrame();
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      controls.dispose();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLoss);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestore);
      renderer.domElement.remove();
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        const entries = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of entries) if (material) materials.add(material);
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      key.shadow.dispose();
      renderer.dispose();
    },
  };
}
