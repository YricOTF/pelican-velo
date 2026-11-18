import * as THREE from 'three';

const profileRange = 240;

function coastTexture(outline) {
  const size = 1024;
  const count = outline.length - 1;
  const evenlySpaced = outline.slice(0, count).map((point) => {
    const theta = THREE.MathUtils.euclideanModulo(Math.atan2(point.z, point.x), Math.PI * 2);
    return { theta, radius: Math.hypot(point.x, point.z) };
  }).sort((first, second) => first.theta - second.theta);
  evenlySpaced.unshift({
    theta: evenlySpaced[count - 1].theta - Math.PI * 2,
    radius: evenlySpaced[count - 1].radius,
  });
  evenlySpaced.push({ theta: evenlySpaced[1].theta + Math.PI * 2, radius: evenlySpaced[1].radius });

  const data = new Uint8Array(size * 4);
  let upper = 1;
  for (let i = 0; i < size; i += 1) {
    const theta = (i + 0.5) / size * Math.PI * 2;
    while (evenlySpaced[upper].theta < theta) upper += 1;
    const low = evenlySpaced[upper - 1];
    const high = evenlySpaced[upper];
    const fraction = (theta - low.theta) / (high.theta - low.theta);
    const radius = THREE.MathUtils.lerp(low.radius, high.radius, fraction);
    const encoded = Math.round(radius / profileRange * 65535);
    data.set([encoded >> 8, encoded & 255, 0, 255], i * 4);
  }

  const texture = new THREE.DataTexture(data, size, 1);
  texture.wrapS = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const vertexShader = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>

  varying vec2 vSeaPoint;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec4 mvPosition = viewMatrix * worldPosition;
    vSeaPoint = worldPosition.xz;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>

  varying vec2 vSeaPoint;
  uniform sampler2D coast;
  uniform float time;
  uniform float profileRange;
  uniform vec3 shallows;
  uniform vec3 lagoon;
  uniform vec3 offshore;
  uniform vec3 glints;
  uniform vec3 foam;

  void main() {
    vec2 p = vSeaPoint;
    float angle = atan(p.y, p.x);
    vec2 profile = texture2D(coast, vec2(fract(angle / PI2 + 1.0), 0.5)).rg;
    float radius = dot(profile, vec2(65280.0, 255.0)) * profileRange / 65535.0;
    float depth = max(0.0, length(p) - radius);
    float shoalBlend = smoothstep(1.5, 15.0, depth);
    vec3 water = mix(shallows, lagoon, shoalBlend);
    water = mix(water, offshore, smoothstep(15.0, 62.0, depth));

    vec2 current = vec2(dot(p, vec2(0.91, 0.42)), dot(p, vec2(-0.42, 0.91)));
    float breeze = sin(current.x * 0.44 + current.y * 0.33 + time * 0.62);
    float ripple = sin(current.y * 1.25 + breeze * 0.82 - time * 1.64);
    float swell = sin(current.y * 0.54 - current.x * 0.23 - time * 0.72);
    float breakup = sin(current.x * 1.03 + current.y * 0.30 + time * 0.48);
    float viewFade = 1.0 - smoothstep(45.0, 135.0, distance(p, cameraPosition.xz));
    water *= 1.0 + (0.08 * swell + 0.042 * ripple) * viewFade;
    float shimmer = smoothstep(0.83, 1.0, ripple) * smoothstep(0.05, 0.83, breakup);
    float sparks = smoothstep(0.86, 1.0, ripple * swell) * smoothstep(0.36, 0.95, breeze);
    water = mix(water, glints, (shimmer * 0.20 + sparks * 0.42) * viewFade);

    float foamShape = sin(angle * 169.0 + time * 0.6) * 0.19 + sin(angle * 373.0 - time) * 0.13;
    float beachWash = 1.0 - smoothstep(0.05, 0.58 + foamShape, depth);
    float run = mod(time * 0.72, 3.6);
    float front = abs(depth - (3.8 - run + foamShape));
    float pulse = smoothstep(0.0, 0.74, run) * (1.0 - smoothstep(2.9, 3.6, run));
    float crest = (1.0 - smoothstep(0.07, 0.48, front));
    float seams = 0.58 + 0.42 * smoothstep(-0.4, 0.7, breeze);
    water = mix(water, foam, (beachWash * 0.71 + crest * pulse * seams * 0.69) * viewFade);

    gl_FragColor = vec4(water, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

const palettes = {
  day: ['#76d3b1', '#2fa9ad', '#357da6', '#caf9e1', '#f1ffdf'],
  sunset: ['#75baad', '#4b91a6', '#496c99', '#ffe0ad', '#f6ecd1'],
};

export function createWater(outline, level) {
  const paletteKeys = ['shallows', 'lagoon', 'offshore', 'glints', 'foam'];
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      coast: { value: null },
      time: { value: 0 },
      profileRange: { value: profileRange },
      ...Object.fromEntries(paletteKeys.map((key) => [key, { value: new THREE.Color() }])),
    },
  ]);
  uniforms.coast.value = coastTexture(outline);

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    fog: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000).rotateX(-Math.PI / 2), material);
  water.position.y = level;
  water.name = 'Animated coastal water';

  let previousWeather;
  function update(time, weather) {
    uniforms.time.value = time;
    if (weather === previousWeather) return;
    const palette = weather === 'sunset' ? palettes.sunset : palettes.day;
    for (let i = 0; i < paletteKeys.length; i += 1) uniforms[paletteKeys[i]].value.set(palette[i]);
    previousWeather = weather;
  }

  update(0, 'day');
  return { mesh: water, update };
}
