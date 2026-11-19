import * as THREE from 'three';

import { defaultMapId, getMap } from './maps.js';
import { createWater } from './water.js';

const roadWidth = 8.5;
const roadEdge = roadWidth / 2;
const roadLevel = -0.028;
const seaLevel = -2.15;
const slices = 720;
const tau = Math.PI * 2;

function cove(angle, center, spread) {
  const delta = Math.atan2(Math.sin(angle - center), Math.cos(angle - center));
  return Math.exp(-((delta / spread) ** 2));
}

const routes = {
  coast: {
    start: Math.PI * 0.62, width: 126, depth: 104, points: 36,
    radius: (a) => 1 + 0.14 * Math.cos(3 * a - 0.8)
      + 0.08 * Math.sin(5 * a + 0.45) + 0.02 * Math.cos(7 * a + 0.75),
    asphalt: '#8e8e82', paint: '#fff1ca', sand: '#efd4a0', hills: 1, seed: 844,
    outer: ['#dbc78f', '#e3d09a', '#d9c487', '#e1c38c', '#d8a975', '#d4a178', '#bc815f', '#d2ab7f', '#dfc28d', '#e3cb99'],
    inner: ['#a6af79', '#a8b37d', '#a8b981', '#bcc487', '#b8c286', '#b4be84', '#c7ca89', '#c9ce91', '#ced098', '#d8ce98', '#dfcb92', '#e6cd96', '#dbc78f'],
    rocks: ['#d7af81', '#e1be93', '#c3906a', '#ead0a3', '#ceab85'],
    plants: ['#899c64', '#8c9b53', '#a3a965', '#7a9259'],
    flowers: ['#e78c95', '#ffe0a6', '#f6af61', '#db9cbd'],
    palms: ['#5b8d66', '#728f55', '#849b60', '#9ba867'],
    stackColors: ['#bd936f', '#d3b58c'],
  },
  harbor: {
    start: 2.35, width: 111, depth: 84, points: 40,
    radius: (a) => 1 + 0.08 * Math.cos(3 * a + 0.8) + 0.04 * Math.sin(5 * a + 0.9) - 0.27 * cove(a, 1.52, 0.62),
    asphalt: '#9e877a', paint: '#fff0d4', sand: '#efbdac', hills: 0.87, seed: 539,
    outer: ['#dbad8e', '#e8b9a3', '#e2ac91', '#dfab94', '#dba288', '#d28c73', '#ac735e', '#cc9585', '#e9b5a5', '#edc1ad'],
    inner: ['#879b76', '#9da677', '#a6a97a', '#adad7c', '#b3b181', '#bbb081', '#ccbb90', '#cfb38b', '#d8b68e', '#deaf8e', '#e5b59a', '#e6b39a', '#dbad8e'],
    rocks: ['#d7967d', '#dcaa92', '#b47764', '#eac6ad', '#d09981'],
    plants: ['#79976d', '#90a16f', '#a9a978', '#698a70'],
    flowers: ['#d9829e', '#ffcba2', '#ebaf96', '#b891c4'],
    palms: ['#558c74', '#65946c', '#75a070', '#8ca978'],
    stackColors: ['#b98270', '#d3a38d'],
  },
  basalt: {
    start: 1.95, width: 152, depth: 107, points: 40,
    radius: (a) => 1 + 0.088 * Math.sin(4 * a - 0.24) - 0.049 * Math.cos(3 * a + 0.62) + 0.016 * Math.sin(6 * a - 0.7),
    asphalt: '#5c5861', paint: '#f3d6a1', sand: '#636078', hills: 1.63, seed: 1697,
    outer: ['#625764', '#645865', '#5c5462', '#595360', '#4c4656', '#413e4e', '#373545', '#595366', '#4b475c', '#5c5770'],
    inner: ['#524f67', '#58566c', '#625973', '#665c74', '#65596b', '#6b5f6a', '#786777', '#7c6b78', '#806b70', '#77626e', '#705c68', '#665766', '#625764'],
    rocks: ['#5c5369', '#776274', '#846679', '#645c72', '#514d5e'],
    plants: ['#9d895d', '#a58e60', '#b39c69', '#847954'],
    flowers: ['#cc826c', '#dcaa72', '#c57661', '#ac8e8c'],
    palms: ['#686d54', '#7b7d58', '#918452', '#a09061'],
    stackColors: ['#464453', '#6d5f77'],
  },
};

function track(route) {
  const winding = Array.from({ length: route.points }, (_, i) => {
    const angle = route.start - i / route.points * tau;
    const radius = route.radius(angle);
    return new THREE.Vector3(route.width * Math.cos(angle) * radius, 0, route.depth * Math.sin(angle) * radius);
  });
  const curve = new THREE.CatmullRomCurve3(winding, true, 'centripetal');
  curve.arcLengthDivisions = 3200;
  return curve;
}

function frameAt(curve, u) {
  const progress = THREE.MathUtils.euclideanModulo(u, 1);
  const point = curve.getPointAt(progress);
  const tangent = curve.getTangentAt(progress);
  const outer = new THREE.Vector3(-tangent.z, 0, tangent.x);
  return { point, tangent, outer, progress };
}

function beachiness(u) {
  return 0.5 + 0.5 * Math.cos(u * tau * 4 - 0.4);
}

function shorelineOffset(u) {
  return 12.9 + beachiness(u) * 3.6 + Math.sin(u * tau * 15) * 0.57;
}

function innerElevation(x, z) {
  const westHill = 12 * Math.exp(-((x + 42) ** 2 / 2600 + (z - 20) ** 2 / 1500));
  const eastHill = 16 * Math.exp(-((x - 37) ** 2 / 2300 + (z + 9) ** 2 / 2200));
  const ridge = 3.5 + Math.sin(x * 0.074 + z * 0.032) * 1.25;
  return westHill + eastHill + ridge;
}

function vergeHeight(offset, u) {
  const roll = Math.sin(u * tau * 4) * 0.17 + Math.sin(u * tau * 9) * 0.12;
  if (offset < 0) return roadLevel + THREE.MathUtils.smoothstep(-offset, roadEdge, 13) * (0.46 + roll);

  const beach = beachiness(u);
  const reach = shorelineOffset(u);
  const cliffStart = reach - 2.1 - beach * 5.4;
  const bump = THREE.MathUtils.smoothstep(offset, roadEdge, 7);
  const shelf = roadLevel + bump * (0.68 - beach * 0.51 + roll);
  const fall = THREE.MathUtils.smoothstep(offset, cliffStart, reach);
  return THREE.MathUtils.lerp(shelf, seaLevel, fall) - Math.max(0, offset - reach) * 0.42;
}

function positionAt(frame, offset) {
  const point = frame.point.clone().addScaledVector(frame.outer, offset);
  point.y = vergeHeight(offset, frame.progress);
  return point;
}

function stripGeometry(sample, rows, columns) {
  const positions = [];
  const colors = [];
  const indices = [];
  for (let row = 0; row <= rows; row += 1) {
    for (let i = 0; i < columns.length; i += 1) {
      const { point, color } = sample(row, columns[i]);
      positions.push(point.x, point.y, point.z);
      colors.push(color.r, color.g, color.b);
    }
    if (row === rows) continue;
    for (let i = 0; i < columns.length - 1; i += 1) {
      const a = row * columns.length + i;
      const b = a + columns.length;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function terrain(group, frames, route) {
  const dryMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.94, side: THREE.DoubleSide,
  });
  const outside = [0, 0.06, 0.20, 0.38, 0.52, 0.65, 0.76, 0.90, 1, 1.20]
    .map((fraction, i) => ({ fraction, color: new THREE.Color(route.outer[i]) }));
  const sand = new THREE.Color(route.sand);
  const outsideStrip = new THREE.Mesh(stripGeometry((row, column) => {
    const frame = frames[row];
    const edge = shorelineOffset(frame.progress);
    const point = positionAt(frame, roadEdge + (edge - roadEdge) * column.fraction);
    const grain = 0.99 + 0.027 * Math.sin(row * 0.21 + column.fraction * 11);
    const beach = beachiness(frame.progress) ** 2 * 0.72;
    return { point, color: column.color.clone().lerp(sand, beach).multiplyScalar(grain) };
  }, slices, outside), dryMaterial);
  outsideStrip.receiveShadow = true;
  group.add(outsideStrip);

  const inner = [1, 0.9, 0.8, 0.69, 0.59, 0.48, 0.36, 0.26, 0.18, 0.12, 0.07, 0.035, 0]
    .map((amount, i) => ({ amount, color: new THREE.Color(route.inner[i]) }));
  const fill = new THREE.Mesh(stripGeometry((row, column) => {
    const frame = frames[row];
    const point = positionAt(frame, -roadEdge).multiplyScalar(1 - column.amount);
    const height = innerElevation(point.x, point.z) * route.hills;
    const hill = THREE.MathUtils.smoothstep(column.amount, 0.027, 0.64);
    point.y = roadLevel + hill * height;
    const patches = 1 + Math.sin(point.x * 0.13 + point.z * 0.24) * 0.045
      + Math.cos(point.z * 0.08 - point.x * 0.095) * 0.065;
    return { point, color: column.color.clone().multiplyScalar(patches) };
  }, slices, inner), dryMaterial);
  fill.receiveShadow = true;
  group.add(fill);
}

function road(group, curve, frames, route) {
  const baseColor = new THREE.Color(route.asphalt);
  const geometry = stripGeometry((row, offset) => {
    const frame = frames[row];
    const point = frame.point.clone().addScaledVector(frame.outer, offset);
    point.y = roadLevel;
    const grain = Math.sin(row * 1.85 + offset * 11) * 0.014 + Math.cos(row * 0.19 - offset * 1.2) * 0.021;
    return { point, color: baseColor.clone().multiplyScalar(1 + grain) };
  }, slices, [-roadEdge, -2.85, -1.42, 0, 1.42, 2.85, roadEdge]);
  const surface = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.93,
  }));
  surface.receiveShadow = true;
  group.add(surface);

  const positions = [];
  const indices = [];
  function stripe(start, finish, left, right, segments) {
    const index = positions.length / 3;
    for (let i = 0; i <= segments; i += 1) {
      const frame = frameAt(curve, THREE.MathUtils.lerp(start, finish, i / segments));
      for (const offset of [left, right]) {
        positions.push(
          frame.point.x + frame.outer.x * offset,
          roadLevel + 0.009,
          frame.point.z + frame.outer.z * offset,
        );
      }
      if (i < segments) {
        const a = index + i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
  }
  stripe(0, 1, -roadEdge + 0.27, -roadEdge + 0.38, slices);
  stripe(0, 1, roadEdge - 0.38, roadEdge - 0.27, slices);
  const count = Math.round(curve.getLength() / 5.2);
  for (let i = 1; i < count; i += 1) {
    stripe(i / count, (i + 0.54) / count, -0.062, 0.062, 4);
  }
  // The two checker rows mark the exact timing line at the curve seam.
  const cellMeters = 0.46;
  const cellProgress = cellMeters / curve.getLength();
  for (let row = 0; row < 2; row += 1) {
    for (let cell = row; cell < 16; cell += 2) {
      const start = (row - 1) * cellProgress;
      const offset = (cell - 8) * cellMeters;
      stripe(start, start + cellProgress, offset, offset + cellMeters, 1);
    }
  }

  const markingGeometry = new THREE.BufferGeometry();
  markingGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  markingGeometry.setIndex(indices);
  markingGeometry.computeVertexNormals();
  const markings = new THREE.Mesh(markingGeometry, new THREE.MeshStandardMaterial({
    color: route.paint, roughness: 0.95,
  }));
  markings.receiveShadow = true;
  group.add(markings);
}

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function scatter(group, curve, route) {
  const random = seededRandom(route.seed);
  const transform = new THREE.Object3D();
  const tint = new THREE.Color();
  function instances(geometry, count, options = {}) {
    const mesh = new THREE.InstancedMesh(
      geometry,
      new THREE.MeshStandardMaterial({ roughness: 0.88, ...options }),
      count,
    );
    group.add(mesh);
    return mesh;
  }

  function place(mesh, index, point, scale, rotation, color) {
    transform.position.copy(point);
    transform.rotation.set(...rotation);
    transform.scale.set(...scale);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
    if (color) mesh.setColorAt(index, tint.set(color));
  }

  const rocks = instances(new THREE.IcosahedronGeometry(1, 0), 670, { flatShading: true });
  const plantGeometry = new THREE.BufferGeometry();
  plantGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.1, 0, 0, 0.1, 0, 0, -0.07, 0.56, 0.05, 0.17, 0.55, 0.075,
    0.05, 0.56, 0.14, 0.32, 1, 0.22,
  ], 3));
  plantGeometry.setIndex([0, 2, 4, 0, 4, 1, 1, 4, 3, 2, 5, 4, 4, 5, 3]);
  plantGeometry.computeVertexNormals();
  const plants = instances(plantGeometry, 1536, { side: THREE.DoubleSide });
  const flowers = instances(new THREE.IcosahedronGeometry(1, 0), 420);
  const { rocks: rocksPalette, plants: plantsPalette, flowers: flowersPalette, palms: frondColors } = route;

  for (let i = 0; i < rocks.count; i += 1) {
    const frame = frameAt(curve, random());
    const side = i % 3 === 0 ? -1 : 1;
    const offset = side * (roadEdge + 0.64 + random() * (side === 1 ? 8 : 3));
    const point = positionAt(frame, offset);
    const size = 0.09 + Math.pow(random(), 3) * (offset > 8 ? 1.28 : 0.64);
    point.y += size * 0.18 + (side < 0 ? 0.15 : 0);
    place(rocks, i, point, [size * 1.31, size * 0.8, size],
      [random() * Math.PI, random() * 6.28, random() * Math.PI], rocksPalette[i % rocksPalette.length]);
  }
  for (let bed = 0; bed < plants.count / 8; bed += 1) {
    const frame = frameAt(curve, (bed + random() * 0.6) / (plants.count / 8));
    const side = bed % 3 === 0 ? -1 : 1;
    const offset = side * (roadEdge + 0.68 + random() * 3.35);
    const origin = positionAt(frame, offset);
    if (side < 0) origin.y += 0.18;
    for (let i = 0; i < 8; i += 1) {
      const position = origin.clone().add(new THREE.Vector3((random() - 0.5) * 0.7, 0, (random() - 0.5) * 0.7));
      const size = 0.2 + random() * 0.43;
      place(plants, bed * 8 + i, position, [size, size, size],
        [0, random() * 6.28, (random() - 0.5) * 0.28], plantsPalette[i % plantsPalette.length]);
    }
    if (bed >= flowers.count / 3) continue;
    for (let i = 0; i < 3; i += 1) {
      const position = origin.clone().add(new THREE.Vector3((random() - 0.5) * 0.6, 0.19, (random() - 0.5) * 0.6));
      const size = 0.038 + random() * 0.035;
      place(flowers, bed * 3 + i, position, [size, size, size], [0, 0, 0], flowersPalette[bed % flowersPalette.length]);
    }
  }

  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.16, 0.95, 0.03),
    new THREE.Vector3(0.17, 2, 0.08), new THREE.Vector3(-0.17, 3, 0.15),
  ]);
  const trunks = instances(new THREE.TubeGeometry(trunkCurve, 7, 0.095, 6, false), 59, { color: '#aa7c5d' });
  const frondGeometry = new THREE.BufferGeometry();
  frondGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, 0.42, 0.36, 0.22, 0.42, 0.48, 0, 0.42, 0.36, -0.22,
    1.04, 0.32, 0.32, 1.04, 0.46, 0, 1.04, 0.32, -0.32,
    1.62, 0.12, 0.12, 1.62, 0.2, 0, 1.62, 0.12, -0.12, 1.96, -0.17, 0,
  ], 3));
  frondGeometry.setIndex([
    0, 1, 2, 0, 2, 3, 1, 4, 5, 1, 5, 2, 2, 5, 6, 2, 6, 3,
    4, 7, 8, 4, 8, 5, 5, 8, 9, 5, 9, 6, 7, 10, 8, 8, 10, 9,
  ]);
  frondGeometry.computeVertexNormals();
  const fronds = instances(frondGeometry, trunks.count * 8, { side: THREE.DoubleSide });

  for (let i = 0; i < trunks.count; i += 1) {
    const frame = frameAt(curve, i < 3 ? 0.002 + i * 0.007 : (i + random() * 0.4) / trunks.count);
    const side = i === 0 || i % 5 === 0 ? 1 : -1;
    const point = positionAt(frame, side * (5.65 + random() * 1.25));
    const angle = random() * 6.28;
    const size = 0.56 + random() * 0.64;
    if (side === -1) point.y += 0.20;
    place(trunks, i, point, [size, size, size], [0, angle, 0]);
    const crown = point.clone().add(new THREE.Vector3(-0.17, 3, 0.15)
      .multiplyScalar(size).applyAxisAngle(THREE.Object3D.DEFAULT_UP, angle));
    for (let frond = 0; frond < 8; frond += 1) {
      const spread = size * (0.75 + random() * 0.28);
      place(fronds, i * 8 + frond, crown, [spread, spread, spread],
        [0, angle + frond * Math.PI / 4, (random() - 0.44) * 0.68], frondColors[frond % frondColors.length]);
    }
  }

  const posts = instances(new THREE.BoxGeometry(0.12, 0.54, 0.18), 148, { color: '#e9e2ba' });
  const reflectors = instances(new THREE.BoxGeometry(0.127, 0.10, 0.187), posts.count, { color: '#d88c66' });
  for (let i = 0; i < posts.count; i += 1) {
    const frame = frameAt(curve, i / posts.count + 0.004);
    const point = positionAt(frame, i % 2 === 0 ? roadEdge + 0.24 : -roadEdge - 0.24);
    point.y += 0.27;
    const angle = Math.atan2(-frame.tangent.x, -frame.tangent.z);
    place(posts, i, point, [1, 1, 1], [0, angle, 0]);
    point.y += 0.13;
    place(reflectors, i, point, [1, 1, 1], [0, angle, 0]);
  }
}

function object(parent, geometry, color, x, y, z) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.83 }));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function box(parent, color, x, y, z, width, height, depth) {
  return object(parent, new THREE.BoxGeometry(width, height, depth), color, x, y, z);
}

function landmark(group, curve, u, offset) {
  const frame = frameAt(curve, u);
  const assembly = new THREE.Group();
  assembly.position.copy(positionAt(frame, offset));
  assembly.rotation.y = Math.atan2(-frame.tangent.x, -frame.tangent.z);
  group.add(assembly);
  return assembly;
}

function entryGate(group, curve, map) {
  const gate = landmark(group, curve, 11 / curve.getLength(), 0);
  const frameColor = map.id === 'harbor' ? '#b87b66' : map.id === 'basalt' ? '#796b80' : '#53877c';
  const headerColor = map.id === 'coast' ? '#4f7e73' : frameColor;
  for (const x of [-4.79, 4.79]) {
    box(gate, '#dcb88a', x, 0.28, 0, 0.66, 0.56, 0.66);
    box(gate, frameColor, x, 2.28, 0, 0.31, 4.1, 0.39);
    box(gate, '#df9e79', x, 1.04, 0, 0.324, 0.27, 0.404);
    box(gate, '#75a696', x * 0.88, 3.85, 0, 0.16, 0.96, 0.22).rotation.z = Math.sign(x) * -0.91;
  }
  const header = box(gate, headerColor, 0, 4.39, 0, 9.94, 0.42, 0.37);
  header.castShadow = true;
  const plaque = box(gate, '#f9dfac', 0, 4.43, 0.18, 5.35, 0.82, 0.12);
  plaque.castShadow = true;
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 80;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#385c54';
    context.font = 'bold 49px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(map.label, 256, 43, 474);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(5.18, 0.81),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
    );
    banner.position.set(0, 4.43, 0.242);
    gate.add(banner);
  }
}

function lighthouse(group, curve, mapId) {
  const position = mapId === 'harbor' ? 0.13 : mapId === 'basalt' ? 0.397 : 0.245;
  const tower = landmark(group, curve, position, 8.6);
  tower.scale.setScalar(1.26);
  const foundation = '#b58661';
  object(tower, new THREE.CylinderGeometry(1.8, 2.2, 0.5, 12), foundation, 0, 0.08, 0);
  object(tower, new THREE.CylinderGeometry(0.75, 1.12, 4.85, 14), '#f6e4c2', 0, 2.71, 0);
  for (const [y, radius] of [[1.71, 1.015], [3.5, 0.88]]) {
    object(tower, new THREE.CylinderGeometry(radius - 0.052, radius + 0.046, 0.65, 14), '#d78769', 0, y, 0);
  }
  object(tower, new THREE.CylinderGeometry(1.09, 0.80, 0.23, 14), '#577c73', 0, 5.17, 0);
  const glass = object(tower, new THREE.CylinderGeometry(0.65, 0.65, 0.82, 12), '#e4c491', 0, 5.65, 0);
  glass.material.emissive.set('#ffc06e');
  glass.material.emissiveIntensity = 0.19;
  object(tower, new THREE.ConeGeometry(0.91, 0.83, 12), '#b57560', 0, 6.44, 0);
  object(tower, new THREE.SphereGeometry(0.135, 9, 6), '#b57560', 0, 6.88, 0);
  box(tower, '#59766a', 0, 0.93, 1.035, 0.35, 0.91, 0.14);
  box(tower, '#698273', 0, 4.32, 0.82, 0.19, 0.36, 0.06);
  return glass;
}

function beachHuts(group, curve) {
  const village = landmark(group, curve, 0.67, -8.2);
  const colors = ['#df977e', '#759990', '#e4bb83'];
  village.position.y += 0.17;
  for (let i = 0; i < colors.length; i += 1) {
    const z = i * 3.3;
    const x = Math.sin(i * 1.2) * 0.6;
    box(village, '#af9573', x, 0.07, z, 2.95, 0.28, 2.85);
    box(village, colors[i], x, 1.07, z, 2.49, 1.88, 2.30);
    const roof = object(village, new THREE.CylinderGeometry(0, 1, 1, 4, 1), '#f0d4a1', x, 2.28, z);
    roof.rotation.y = Math.PI * 0.25;
    roof.scale.set(2.02, 0.78, 1.85);
    box(village, '#f3d8ad', x + 1.253, 0.97, z - 0.34, 0.043, 1.39, 0.68);
    box(village, '#55776d', x + 1.256, 1.33, z + 0.54, 0.058, 0.44, 0.56);
  }
}

function windmill(group, curve) {
  const mill = landmark(group, curve, 0.49, -8.9);
  const column = new THREE.CylinderGeometry(1.15, 1.68, 4.65, 12);
  object(mill, column, '#eee0ad', 0, 2.3, 0);
  object(mill, new THREE.ConeGeometry(1.38, 1.5, 12), '#c77f61', 0, 5.13, 0);
  box(mill, '#657e6e', 0, 0.88, 1.56, 0.66, 1.47, 0.18);
  const rotor = new THREE.Group();
  rotor.position.set(0, 4.10, 1.26);
  mill.add(rotor);
  object(rotor, new THREE.SphereGeometry(0.31, 11, 8), '#a57862', 0, 0, 0.06);
  for (let i = 0; i < 4; i += 1) {
    const blade = new THREE.Group();
    blade.rotation.z = i * Math.PI * 0.5;
    rotor.add(blade);
    box(blade, '#927b65', 0, 1.54, 0.05, 0.10, 3, 0.11);
    box(blade, '#f2d99f', 0.28, 2.04, 0.02, 0.50, 1.68, 0.085);
    box(blade, '#dbb783', 0.29, 2.57, 0.073, 0.52, 0.064, 0.035);
  }
  return rotor;
}

function harborPier(group, curve, progress = 0.635) {
  const dock = landmark(group, curve, progress, 12.8);
  dock.position.y = 0.18;
  const transform = new THREE.Object3D();
  const planks = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.39, 0.14, 2.46),
    new THREE.MeshStandardMaterial({ roughness: 0.89 }),
    34,
  );
  const woodHues = ['#b79a78', '#c7a681', '#a98869', '#cfb08a'];
  const tint = new THREE.Color();
  for (let i = 0; i < planks.count; i += 1) {
    transform.position.x = (i - 12) * 0.4;
    transform.updateMatrix();
    planks.setMatrixAt(i, transform.matrix);
    planks.setColorAt(i, tint.set(woodHues[i % woodHues.length]));
  }
  dock.add(planks);
  const posts = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.103, 0.13, 3.45, 7),
    new THREE.MeshStandardMaterial({ color: '#8e7763', roughness: 0.92 }),
    12,
  );
  for (let i = 0; i < posts.count; i += 1) {
    transform.position.set((Math.floor(i / 2) - 2) * 2.5, -1.28, i % 2 ? 1.06 : -1.06);
    transform.updateMatrix();
    posts.setMatrixAt(i, transform.matrix);
  }
  dock.add(posts);
  box(dock, '#7c876f', 8.18, 0.46, -0.63, 0.96, 0.38, 0.48);
  box(dock, '#ecba7c', 8.14, 0.68, -0.63, 0.90, 0.07, 0.54);
}

function seaStacks(group, curve, route) {
  const clusters = [
    [0.088, 28, 3.7, 5.7], [0.092, 33, 2.3, 3.6], [0.102, 30, 1.9, 2.1],
    [0.303, 33, 2.8, 4.7], [0.312, 35, 2, 2.1],
    [0.808, 24, 2.7, 5.0], [0.826, 29, 3.8, 2.6], [0.834, 29, 2.6, 1.2],
  ];
  const mesh = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ roughness: 0.94, flatShading: true }),
    clusters.length * 2,
  );
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  for (let i = 0; i < clusters.length; i += 1) {
    const [u, offset, radius, height] = clusters[i];
    const point = positionAt(frameAt(curve, u), offset);
    transform.position.set(point.x, seaLevel + height * 0.12, point.z);
    transform.scale.set(radius, height * 0.59, radius * 0.77);
    transform.rotation.set(0.18, i * 0.93, 0.07);
    transform.updateMatrix();
    mesh.setMatrixAt(2 * i, transform.matrix);
    mesh.setColorAt(2 * i, color.set(route.stackColors[0]));
    transform.position.y += height * 0.39;
    transform.scale.set(radius * 0.73, height * 0.28, radius * 0.62);
    transform.rotation.y += 1.67;
    transform.updateMatrix();
    mesh.setMatrixAt(2 * i + 1, transform.matrix);
    mesh.setColorAt(2 * i + 1, color.set(route.stackColors[1]));
  }
  group.add(mesh);
}

function sailboats(group, curve) {
  const boats = [];
  for (const [u, offset, rotation, scale, sailColor] of [
    [0.02, 30, 0.55, 1.4, '#fff0ce'],
    [0.21, 44, -1.2, 1.15, '#f9ccb1'],
    [0.38, 30, -0.2, 1.1, '#fff0ce'],
    [0.56, 43, 0.91, 1.4, '#f1d797'],
    [0.66, 27, -0.1, 1.0, '#f9ccb1'],
    [0.91, 39, 0.68, 1.1, '#fff0ce'],
  ]) {
    const assembly = new THREE.Group();
    assembly.position.copy(positionAt(frameAt(curve, u), offset));
    assembly.position.y = seaLevel + 0.05;
    assembly.rotation.y = rotation;
    assembly.scale.setScalar(scale);
    group.add(assembly);
    const hull = object(assembly, new THREE.SphereGeometry(1, 12, 7, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), '#aa7864', 0, 0.25, 0);
    hull.scale.set(1.75, 0.55, 0.61);
    object(assembly, new THREE.CylinderGeometry(0.035, 0.05, 2.65, 7), '#a38970', 0, 1.55, 0);
    const sail = new THREE.Shape();
    sail.moveTo(-0.10, 2.87);
    sail.quadraticCurveTo(-0.59, 1.47, -1.42, 0.49);
    sail.lineTo(-0.1, 0.49);
    sail.closePath();
    object(assembly, new THREE.ShapeGeometry(sail, 8), sailColor, 0, 0, 0).material.side = THREE.DoubleSide;
    boats.push(assembly);
  }
  return boats;
}

function harborVillage(group, curve) {
  const colors = ['#d68a76', '#f0c5a3', '#e0a481', '#b9919f', '#e7b996', '#d7836f', '#e7b28e'];
  const roofs = ['#a86459', '#b67562', '#b96e61', '#937180', '#b46d5b', '#a05c52', '#a76659'];
  const shutters = ['#587f74', '#667f6c', '#597d76', '#62677d'];
  const strides = [0.98, 0.991, 0.001, 0.031, 0.0375, 0.0439, 0.052];
  for (let i = 0; i < strides.length; i += 1) {
    const home = landmark(group, curve, strides[i], 7.3 + (i % 3) * 0.57);
    const height = 2.05 + (i % 3) * 0.57;
    box(home, '#c29887', 0, 0.09, 0, 3.05, 0.41, 3.36);
    box(home, colors[i], 0, height * 0.5, 0, 2.83, height, 3.13);
    const tiles = object(home, new THREE.CylinderGeometry(0.43, 1, 1, 4), roofs[i], 0, height + 0.23, 0);
    tiles.rotation.y = Math.PI * 0.25;
    tiles.scale.set(2.19, 0.69, 2.42);
    box(home, shutters[i % shutters.length], -1.43, 0.70, 0.57, 0.12, 1.37, 0.68);
    box(home, '#f3d8b1', -1.451, height * 0.67, -0.51, 0.14, 0.59, 0.85);
    box(home, shutters[(i + 2) % shutters.length], -1.53, height * 0.67, -0.51, 0.065, 0.44, 0.66);
  }
}

function basaltCliffs(group, curve) {
  const sites = [
    [0.006, 10.1], [0.025, 9.1], [0.16, 10.4], [0.265, 8.8],
    [0.398, 10.8], [0.56, 8.7], [0.73, 10.8], [0.88, 10.3], [0.973, 9.2],
  ];
  const random = seededRandom(5581);
  const transform = new THREE.Object3D();
  const palette = ['#565364', '#625668', '#474653', '#73687a', '#645560', '#867087'];
  const columns = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.83, 1, 1, 6),
    new THREE.MeshStandardMaterial({ roughness: 0.96, flatShading: true }),
    sites.length * 8,
  );
  columns.name = 'Basalt cliffs';
  const tint = new THREE.Color();
  for (let site = 0; site < sites.length; site += 1) {
    const [u, offset] = sites[site];
    for (let i = 0; i < 8; i += 1) {
      const frame = frameAt(curve, u + (i - 3.5) / 650);
      const point = positionAt(frame, offset + random() * 2.9);
      const height = 1.2 + random() * 4.9;
      const width = 0.61 + random() * 1.28;
      transform.position.set(point.x, point.y + height * 0.39, point.z);
      transform.rotation.set(0.03, random() * tau, -0.05);
      transform.scale.set(width, height, width * 0.95);
      transform.updateMatrix();
      const index = site * 8 + i;
      columns.setMatrixAt(index, transform.matrix);
      columns.setColorAt(index, tint.set(palette[index % palette.length]));
    }
  }
  group.add(columns);

  const arch = landmark(group, curve, 0.155, 30.5);
  arch.position.y = seaLevel - 0.34;
  arch.rotation.y += 0.95;
  const rock = new THREE.DodecahedronGeometry(1, 0);
  for (let i = 0; i <= 10; i += 1) {
    const angle = i / 10 * Math.PI;
    const height = Math.sin(angle) * 6.9;
    const archRock = object(arch, rock, palette[(i + 1) % palette.length], Math.cos(angle) * 4.4, height, 0);
    archRock.scale.set(1.85, 1.77, 2.12);
    archRock.rotation.set(0.26 + i * 0.21, i * 0.62, -0.4 + i * 0.16);
  }
}

export function createIsland(mapId = defaultMapId) {
  const map = getMap(mapId);
  const route = routes[map.id];
  const group = new THREE.Group();
  group.name = map.label;
  const curve = track(route);
  const frames = Array.from({ length: slices + 1 }, (_, i) => frameAt(curve, i / slices));
  const shore = frames.map((frame) => positionAt(frame, shorelineOffset(frame.progress)));
  const water = createWater(shore, seaLevel, map.id);
  group.add(water.mesh);
  terrain(group, frames, route);
  road(group, curve, frames, route);
  scatter(group, curve, route);
  entryGate(group, curve, map);
  const beacon = lighthouse(group, curve, map.id);
  const rotor = map.id === 'basalt' ? null : windmill(group, curve);
  if (map.id === 'harbor') {
    harborVillage(group, curve);
    harborPier(group, curve, 0.025);
    harborPier(group, curve, 0.29);
  } else if (map.id === 'basalt') {
    basaltCliffs(group, curve);
  } else {
    beachHuts(group, curve);
    harborPier(group, curve);
  }
  seaStacks(group, curve, route);
  const boats = sailboats(group, curve);
  let previousWeather;

  function update(time, weather) {
    water.update(time, weather);
    if (rotor) rotor.rotation.z = time * 0.36 + 0.42;
    for (let i = 0; i < boats.length; i += 1) {
      boats[i].position.y = seaLevel + Math.sin(time * 1.6 + i * 2) * 0.07 + 0.05;
      boats[i].rotation.z = Math.sin(time * 1.3 + i * 1.1) * 0.038;
    }
    if (weather !== previousWeather) {
      beacon.material.emissiveIntensity = weather === 'night' ? 1.8 : weather === 'sunset' ? 0.98 : 0.19;
      previousWeather = weather;
    }
  }

  update(0, 'day');
  return { group, curve, roadWidth, update, map };
}
