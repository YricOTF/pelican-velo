import * as THREE from 'three';

export const WEATHER_TYPES = Object.freeze(['clear', 'cloudy', 'rain', 'mist']);
export const TIMES_OF_DAY = Object.freeze(['day', 'dusk', 'night']);
export const WEATHER_LABELS = Object.freeze({ clear: '晴天', cloudy: '多云', rain: '下雨', mist: '薄雾' });
export const TIME_OF_DAY_LABELS = Object.freeze({ day: '白天', dusk: '黄昏', night: '夜晚' });

const daylight = {
  day: {
    fogColor: 0xade4cf, fogDensity: .009,
    ambientColor: 0xfff4df, groundColor: 0x8abfaf, ambientIntensity: 1.82,
    keyColor: 0xffe1b5, keyIntensity: 2.65, keyPosition: [-4, 6, 3],
    rimColor: 0xaddfdb, rimIntensity: 1.18,
    skyTop: 0x78c6b5, skyBottom: 0xd8eac2,
  },
  dusk: {
    fogColor: 0xe5a7a2, fogDensity: .010,
    ambientColor: 0xffcdaf, groundColor: 0xab899f, ambientIntensity: 1.63,
    keyColor: 0xffaa7a, keyIntensity: 2.35, keyPosition: [-5.5, 3.4, 3.1],
    rimColor: 0xf3a2b3, rimIntensity: 1.12,
    skyTop: 0x9676a5, skyBottom: 0xf2c392,
  },
  night: {
    fogColor: 0x2b4260, fogDensity: .010,
    ambientColor: 0xa9c6f0, groundColor: 0x6984a2, ambientIntensity: 1.02,
    keyColor: 0x9fc9f6, keyIntensity: 1.05, keyPosition: [-3, 5, 4],
    rimColor: 0x86abd8, rimIntensity: .75,
    skyTop: 0x132b47, skyBottom: 0x4a627e,
  },
};

const conditions = {
  cloudy: { tint: 0xa9bec6, nightTint: 0x607088, mix: .47, fogDensity: .014, ambient: .94, key: .62, rim: .74 },
  rain: { tint: 0x7893a5, nightTint: 0x455c74, mix: .63, fogDensity: .026, ambient: .83, key: .44, rim: .69 },
  mist: { tint: 0xc3d2cc, nightTint: 0x6b8397, mix: .69, fogDensity: .040, ambient: .97, key: .51, rim: .70 },
};

export function getConditionsVisuals(weather = 'clear', timeOfDay = 'day') {
  const palette = TIMES_OF_DAY.includes(timeOfDay) ? daylight[timeOfDay] : daylight.day;
  const condition = WEATHER_TYPES.includes(weather) ? conditions[weather] : null;
  if (!condition) return { ...palette, keyPosition: [...palette.keyPosition] };

  const tint = new THREE.Color(timeOfDay === 'night' ? condition.nightTint : condition.tint);
  const mix = condition.mix * (timeOfDay === 'dusk' ? .76 : 1);
  const blend = (hex, weight) => new THREE.Color(hex).lerp(tint, mix * weight).getHex();
  return {
    fogColor: blend(palette.fogColor, 1),
    fogDensity: condition.fogDensity,
    ambientColor: blend(palette.ambientColor, .80),
    groundColor: blend(palette.groundColor, .65),
    ambientIntensity: palette.ambientIntensity * condition.ambient,
    keyColor: blend(palette.keyColor, .96),
    keyIntensity: palette.keyIntensity * condition.key,
    keyPosition: [...palette.keyPosition],
    rimColor: blend(palette.rimColor, .74),
    rimIntensity: palette.rimIntensity * condition.rim,
    skyTop: blend(palette.skyTop, .95),
    skyBottom: blend(palette.skyBottom, 1),
  };
}

const dropCount = 680;
const lightDropCount = 225;
const fieldWidth = 42;
const fieldHeight = 30;
const windX = 3.5;
const windZ = 1.7;
const rainColors = { day: 0xd8eff7, dusk: 0xd9dfef, night: 0xb7d7f4 };

function wrap(value, width) {
  return value - Math.floor(value / width) * width;
}

export function createWeatherEffects() {
  const group = new THREE.Group();
  group.name = 'Weather effects';
  group.visible = false;

  const drops = Array.from({ length: dropCount }, () => ({
    x: Math.random() * fieldWidth,
    y: Math.random() * fieldHeight,
    z: Math.random() * fieldWidth,
    speed: 13 + Math.random() * 7,
    length: .36 + Math.random() * .52,
    opacity: .38 + Math.random() * .41,
  }));
  const positions = new THREE.BufferAttribute(new Float32Array(dropCount * 6), 3).setUsage(THREE.DynamicDrawUsage);
  const colors = new THREE.BufferAttribute(new Float32Array(dropCount * 8).fill(1), 4).setUsage(THREE.DynamicDrawUsage);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', positions);
  geometry.setAttribute('color', colors);
  const material = new THREE.LineBasicMaterial({
    color: rainColors.day,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.frustumCulled = false;
  lines.renderOrder = 3;
  group.add(lines);

  let elapsed = 0;
  let previousTimeOfDay;
  function update(dt, camera, weather, timeOfDay, reducedMotion = false) {
    group.visible = weather === 'rain';
    if (!group.visible) return;
    if (timeOfDay !== previousTimeOfDay) {
      material.color.setHex(TIMES_OF_DAY.includes(timeOfDay) ? rainColors[timeOfDay] : rainColors.day);
      previousTimeOfDay = timeOfDay;
    }

    elapsed += Math.min(Math.max(dt, 0), .10) * (reducedMotion ? .18 : 1);
    camera.getWorldPosition(group.position);
    const { x, y, z } = group.position;
    const count = reducedMotion ? lightDropCount : dropCount;
    geometry.setDrawRange(0, count * 2);
    for (let index = 0; index < count; index++) {
      const drop = drops[index];
      const px = wrap(drop.x + windX * elapsed - x, fieldWidth) - fieldWidth / 2;
      const py = wrap(drop.y - drop.speed * elapsed - y, fieldHeight) - fieldHeight / 2;
      const pz = wrap(drop.z + windZ * elapsed - z, fieldWidth) - fieldWidth / 2;
      const distanceSquared = px * px + py * py + pz * pz;
      const distanceFade = THREE.MathUtils.smoothstep(distanceSquared, 5, 23)
        * (1 - THREE.MathUtils.smoothstep(distanceSquared, 156, 395));
      const alpha = drop.opacity * distanceFade;
      const tail = drop.length / drop.speed;
      const vertex = index * 2;
      positions.setXYZ(vertex, px, py, pz);
      positions.setXYZ(vertex + 1, px - windX * tail, py + drop.length, pz - windZ * tail);
      colors.array[vertex * 4 + 3] = alpha;
      colors.array[vertex * 4 + 7] = alpha * .10;
    }
    positions.needsUpdate = true;
    colors.needsUpdate = true;
  }

  return {
    group,
    update,
    dispose() {
      group.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}
