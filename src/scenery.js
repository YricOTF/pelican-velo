import * as THREE from 'three';

const radius = 1.82;
const groundLevel = -0.008;
const coastRipple = (x) => Math.sin(x * 3.2 + 0.45);

const shoreBands = [
  { edge: (x) => -1.28 + coastRipple(x) * 0.1, start: '#489e9f', finish: '#64beb2' },
  { edge: (x) => -1.06 + coastRipple(x) * 0.07, start: '#66c0b3', finish: '#9dd6b6' },
  { edge: (x) => -0.92 + coastRipple(x) * 0.06, start: '#c8e0bf', finish: '#c2b787' },
  { edge: () => -0.45, start: '#d7bb84', finish: '#e7c793' },
  { edge: () => 0.45, start: '#d8ac77', finish: '#dcb17c' },
  { edge: () => Infinity, start: '#e4c48f', finish: '#f0d19a' },
];

function ground() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const normals = [];
  const indices = [];
  const tint = new THREE.Color();
  const segments = 96;
  const subdivisions = 5;

  for (let band = 0; band < shoreBands.length; band += 1) {
    const { edge, start, finish } = shoreBands[band];
    const previousEdge = shoreBands[band - 1]?.edge ?? (() => -Infinity);
    const fromColor = new THREE.Color(start);
    const toColor = new THREE.Color(finish);
    const offset = positions.length / 3;

    for (let row = 0; row <= segments; row += 1) {
      const angle = (row / segments) * Math.PI;
      const x = -Math.cos(angle) * radius;
      const extent = Math.sin(angle) * radius;
      const first = THREE.MathUtils.clamp(previousEdge(x), -extent, extent);
      const last = THREE.MathUtils.clamp(edge(x), -extent, extent);

      for (let column = 0; column <= subdivisions; column += 1) {
        const fraction = column / subdivisions;
        const z = THREE.MathUtils.lerp(first, last, fraction);
        const texture = Math.sin(x * 53 + column * 9.8) * Math.sin(z * 57 - x * 9);
        tint.copy(fromColor).lerp(toColor, fraction).multiplyScalar(1 + texture * 0.028);
        positions.push(x, groundLevel, z);
        colors.push(tint.r, tint.g, tint.b);
        normals.push(0, 1, 0);
      }

      if (row === segments) continue;
      for (let column = 0; column < subdivisions; column += 1) {
        const a = offset + row * (subdivisions + 1) + column;
        const b = a + subdivisions + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

function plinth() {
  const outline = [
    [0, -0.26, '#986f58'],
    [1.58, -0.26, '#986f58'],
    [1.66, -0.25, '#ad805f'],
    [1.74, -0.22, '#c09366'],
    [1.79, -0.185, '#d0a371'],
    [1.832, -0.125, '#c79867'],
    [1.85, -0.073, '#ebcb95'],
    [1.85, -0.042, '#f0dca7'],
    [radius, groundLevel, '#dcbd86'],
  ];
  const geometry = new THREE.LatheGeometry(
    outline.map(([x, y]) => new THREE.Vector2(x, y)),
    96,
  );
  const colors = [];
  const tint = new THREE.Color();
  for (let i = 0; i < geometry.attributes.position.count; i += 1) {
    tint.set(outline[i % outline.length][2]);
    const grain = Math.sin(Math.floor(i / outline.length) * 2.2) * 0.025;
    tint.multiplyScalar(1 + grain);
    colors.push(tint.r, tint.g, tint.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    roughness: 0.86,
    vertexColors: true,
  }));
}

function meshAt(geometry, material, parent, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function sign(group) {
  const assembly = new THREE.Group();
  assembly.position.set(1.27, groundLevel, 0.88);
  assembly.rotation.y = -0.06;
  group.add(assembly);

  const dark = new THREE.MeshStandardMaterial({ color: '#345b54', roughness: 0.72 });
  const enamel = new THREE.MeshStandardMaterial({ color: '#509080', roughness: 0.42 });
  const ivory = new THREE.MeshStandardMaterial({ color: '#fff0bf', roughness: 0.64 });
  const outline = new THREE.Shape();
  const w = 0.152;
  const h = 0.077;
  outline.moveTo(-w + 0.02, -h);
  outline.lineTo(w - 0.02, -h);
  outline.quadraticCurveTo(w, -h, w, -h + 0.02);
  outline.lineTo(w, h - 0.02);
  outline.quadraticCurveTo(w, h, w - 0.02, h);
  outline.lineTo(-w + 0.02, h);
  outline.quadraticCurveTo(-w, h, -w, h - 0.02);
  outline.lineTo(-w, -h + 0.02);
  outline.quadraticCurveTo(-w, -h, -w + 0.02, -h);

  meshAt(new THREE.CylinderGeometry(0.019, 0.024, 0.32, 8), dark, assembly, 0, 0.16, 0);
  meshAt(new THREE.CylinderGeometry(0.037, 0.052, 0.035, 10), ivory, assembly, 0, 0.016, 0);
  meshAt(new THREE.ExtrudeGeometry(outline, {
    bevelEnabled: true,
    bevelSize: 0.006,
    bevelThickness: 0.006,
    bevelSegments: 2,
    curveSegments: 4,
    depth: 0.017,
  }), ivory, assembly, 0, 0.3, -0.007).castShadow = true;
  const plate = meshAt(new THREE.ShapeGeometry(outline), enamel, assembly, 0, 0.3, 0.017);
  plate.scale.set(0.91, 0.84, 1);

  for (const y of [0.275, 0.306]) {
    const wave = new THREE.CatmullRomCurve3(
      [-5, -4, -3, -2, -1, 0, 1].map((step) => new THREE.Vector3(
        step * 0.023 + 0.02,
        y + Math.cos(step * 1.35) * 0.009,
        0.019,
      )),
    );
    meshAt(new THREE.TubeGeometry(wave, 12, 0.005, 5, false), ivory, assembly, 0, 0, 0);
  }

  const arrow = new THREE.Shape();
  arrow.moveTo(0.064, 0.271);
  arrow.lineTo(0.111, 0.3);
  arrow.lineTo(0.064, 0.331);
  arrow.lineTo(0.064, 0.271);
  meshAt(new THREE.ShapeGeometry(arrow), ivory, assembly, 0, 0, 0.019);
}

function dunePlants(group, transform) {
  let seed = 94;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const beds = [
    [-1.36, 0.72, 0.72],
    [-1.06, 1.07, 1.0],
    [-0.61, 1.33, 0.93],
    [0.11, 1.41, 0.88],
    [0.72, 1.14, 0.74],
    [1.04, 0.83, 0.65],
    [1.43, 0.68, 0.68],
    [-1.28, -0.61, 0.67],
    [-0.61, -0.72, 0.67],
    [0.95, -0.68, 0.70],
  ];

  const bladeGeometry = new THREE.BufferGeometry();
  const bladePositions = [
    -0.021, 0, 0, 0.021, 0, 0, 0, 0.006, 0.007,
    0.018, 0.16, 0.007, 0.063, 0.145, 0.007, 0.039, 0.16, 0.016,
    0.109, 0.255, 0.028,
  ];
  bladeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bladePositions, 3));
  bladeGeometry.setIndex([0, 2, 3, 2, 5, 3, 2, 1, 5, 1, 4, 5, 3, 5, 6, 5, 4, 6]);
  bladeGeometry.computeVertexNormals();

  const bladeCount = 9;
  const blades = new THREE.InstancedMesh(bladeGeometry, new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    roughness: 0.88,
  }), beds.length * bladeCount);
  const rocks = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ roughness: 0.92, flatShading: true }),
    beds.length * 3,
  );
  const flowerColors = ['#e197b2', '#f7c37b', '#a891b7'];
  const blooms = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ roughness: 0.68 }),
    beds.length * 4,
  );
  const stems = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.0035, 0.0045, 1, 5),
    new THREE.MeshStandardMaterial({ color: '#778953', roughness: 0.84 }),
    blooms.count,
  );
  const plantColors = ['#727f49', '#949947', '#adb25a', '#577a5c'];
  const stoneColors = ['#c4a681', '#d4b28e', '#e4c399'];
  const tint = new THREE.Color();

  for (let bed = 0; bed < beds.length; bed += 1) {
    const [x, z, scale] = beds[bed];
    for (let blade = 0; blade < bladeCount; blade += 1) {
      const size = (0.54 + random() * 0.61) * scale;
      transform.position.set(x + (random() - 0.5) * 0.15, groundLevel, z + (random() - 0.5) * 0.11);
      transform.rotation.set((random() - 0.5) * 0.18, blade * 2.4, (random() - 0.5) * 0.24);
      transform.scale.set(size * 0.72, size, size);
      transform.updateMatrix();
      const index = bed * bladeCount + blade;
      blades.setMatrixAt(index, transform.matrix);
      blades.setColorAt(index, tint.set(plantColors[blade % plantColors.length]));
    }

    for (let stone = 0; stone < 3; stone += 1) {
      const size = (0.025 + random() * 0.044) * scale;
      transform.position.set(x + (random() - 0.5) * 0.33, groundLevel + size * 0.17, z + (random() - 0.5) * 0.19);
      transform.rotation.set(0, random() * 6, random() * 0.35);
      transform.scale.set(size * 1.34, size * 0.74, size * 0.92);
      transform.updateMatrix();
      const index = bed * 3 + stone;
      rocks.setMatrixAt(index, transform.matrix);
      rocks.setColorAt(index, tint.set(stoneColors[stone % stoneColors.length]));
    }

    for (let flower = 0; flower < 4; flower += 1) {
      const height = (0.073 + random() * 0.09) * scale;
      const offsetX = (random() - 0.5) * 0.24;
      const offsetZ = (random() - 0.5) * 0.10;
      const index = bed * 4 + flower;
      const size = 0.013 + random() * 0.011;
      transform.position.set(x + offsetX, groundLevel + height * 0.5, z + offsetZ);
      transform.rotation.set(0, 0, 0);
      transform.scale.set(1, height, 1);
      transform.updateMatrix();
      stems.setMatrixAt(index, transform.matrix);
      transform.position.y = groundLevel + height;
      transform.scale.set(size, size * 0.81, size);
      transform.updateMatrix();
      blooms.setMatrixAt(index, transform.matrix);
      blooms.setColorAt(index, tint.set(flowerColors[bed % flowerColors.length]));
    }
  }

  rocks.receiveShadow = true;
  group.add(blades, rocks, stems, blooms);
}

function waterGlints(group) {
  const geometry = new THREE.CircleGeometry(1, 12).rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: '#d6f1d0',
    opacity: 0.67,
    transparent: true,
    depthWrite: false,
  });
  const positions = [
    [-0.82, -1.37, 0.14],
    [-0.42, -1.57, 0.10],
    [-0.26, -1.24, 0.18],
    [-0.16, -1.69, 0.14],
    [0.08, -1.48, 0.13],
    [0.21, -1.3, 0.075],
    [0.51, -1.59, 0.16],
    [0.64, -1.33, 0.11],
    [0.94, -1.28, 0.065],
  ];

  const glints = new THREE.InstancedMesh(geometry, material, positions.length);
  glints.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  glints.frustumCulled = false;
  group.add(glints);
  return { glints, positions };
}

export function createScenery() {
  const group = new THREE.Group();
  group.name = 'Coastal cycling diorama';
  const transform = new THREE.Object3D();
  group.add(plinth(), ground());
  dunePlants(group, transform);
  sign(group);

  const chalk = new THREE.MeshStandardMaterial({ color: '#fff0c6', roughness: 0.86 });
  const laneDashes = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.002, 0.028), chalk, 8);
  laneDashes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  laneDashes.frustumCulled = false;
  laneDashes.receiveShadow = true;
  group.add(laneDashes);

  const { glints, positions } = waterGlints(group);
  const shallowWhite = new THREE.Color('#d6f1d0');
  const sunsetGold = new THREE.Color('#ffcc91');
  let previousWeather = '';

  function update(time, distance, weather) {
    const courseWidth = 3.44;
    for (let i = 0; i < laneDashes.count; i += 1) {
      const travel = THREE.MathUtils.euclideanModulo(i * courseWidth / laneDashes.count - distance, courseWidth);
      const x = travel - courseWidth * 0.5;
      const edge = Math.min(travel, courseWidth - travel);
      const length = 0.24 * THREE.MathUtils.smoothstep(edge, 0.02, 0.15);
      transform.position.set(x, groundLevel + 0.002, 0.3);
      transform.rotation.set(0, 0, 0);
      transform.scale.set(Math.max(length, 0.0001), 1, Math.max(length / 0.24, 0.0001));
      transform.updateMatrix();
      laneDashes.setMatrixAt(i, transform.matrix);
    }
    laneDashes.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < positions.length; i += 1) {
      const [x, z, width] = positions[i];
      const swell = 0.68 + Math.sin(time * 1.52 + i * 1.65) * 0.26;
      transform.position.set(x + Math.sin(time * 0.68 + i) * 0.03, groundLevel + 0.001, z + Math.sin(time * 0.86 + i) * 0.014);
      transform.scale.set(width * swell, 1, 0.006 * swell);
      transform.updateMatrix();
      glints.setMatrixAt(i, transform.matrix);
    }
    glints.instanceMatrix.needsUpdate = true;

    if (weather !== previousWeather) {
      glints.material.color.copy(weather === 'sunset' ? sunsetGold : shallowWhite);
      previousWeather = weather;
    }
  }

  update(0, 0, 'day');
  return { group, update };
}
