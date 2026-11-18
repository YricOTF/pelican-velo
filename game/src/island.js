import * as THREE from 'three';

import { createWater } from './water.js';

const roadWidth = 8.5;
const roadEdge = roadWidth / 2;
const roadLevel = -0.028;
const seaLevel = -2.15;
const slices = 720;
const tau = Math.PI * 2;

function track() {
  const winding = Array.from({ length: 36 }, (_, i) => {
    const angle = Math.PI * 0.62 - (i / 36) * tau;
    const radius = 1 + 0.14 * Math.cos(3 * angle - 0.8)
      + 0.08 * Math.sin(5 * angle + 0.45) + 0.02 * Math.cos(7 * angle + 0.75);
    return new THREE.Vector3(126 * Math.cos(angle) * radius, 0, 104 * Math.sin(angle) * radius);
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

function terrain(group, frames) {
  const dryMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.94, side: THREE.DoubleSide,
  });
  const outside = [
    [0, '#dbc78f'], [0.06, '#e3d09a'], [0.20, '#d9c487'], [0.38, '#e1c38c'],
    [0.52, '#d8a975'], [0.65, '#d4a178'], [0.76, '#bc815f'], [0.90, '#d2ab7f'],
    [1, '#dfc28d'], [1.20, '#e3cb99'],
  ].map(([fraction, color]) => ({ fraction, color: new THREE.Color(color) }));
  const sand = new THREE.Color('#efd4a0');
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

  const inner = [
    [1, '#a6af79'], [0.9, '#a8b37d'], [0.8, '#a8b981'], [0.69, '#bcc487'],
    [0.59, '#b8c286'], [0.48, '#b4be84'], [0.36, '#c7ca89'], [0.26, '#c9ce91'],
    [0.18, '#ced098'], [0.12, '#d8ce98'], [0.07, '#dfcb92'], [0.035, '#e6cd96'],
    [0, '#dbc78f'],
  ].map(([amount, color]) => ({ amount, color: new THREE.Color(color) }));
  const fill = new THREE.Mesh(stripGeometry((row, column) => {
    const frame = frames[row];
    const point = positionAt(frame, -roadEdge).multiplyScalar(1 - column.amount);
    const height = innerElevation(point.x, point.z);
    const hill = THREE.MathUtils.smoothstep(column.amount, 0.027, 0.64);
    point.y = roadLevel + hill * height;
    const patches = 1 + Math.sin(point.x * 0.13 + point.z * 0.24) * 0.045
      + Math.cos(point.z * 0.08 - point.x * 0.095) * 0.065;
    return { point, color: column.color.clone().multiplyScalar(patches) };
  }, slices, inner), dryMaterial);
  fill.receiveShadow = true;
  group.add(fill);
}

function road(group, curve, frames) {
  const baseColor = new THREE.Color('#8e8e82');
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
    color: '#fff1ca', roughness: 0.95,
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

function scatter(group, curve) {
  const random = seededRandom(844);
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
  const rocksPalette = ['#d7af81', '#e1be93', '#c3906a', '#ead0a3', '#ceab85'];
  const plantsPalette = ['#899c64', '#8c9b53', '#a3a965', '#7a9259'];
  const flowersPalette = ['#e78c95', '#ffe0a6', '#f6af61', '#db9cbd'];

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
  const frondColors = ['#5b8d66', '#728f55', '#849b60', '#9ba867'];

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

function entryGate(group, curve) {
  const gate = landmark(group, curve, 11 / curve.getLength(), 0);
  for (const x of [-4.79, 4.79]) {
    box(gate, '#dcb88a', x, 0.28, 0, 0.66, 0.56, 0.66);
    box(gate, '#53877c', x, 2.28, 0, 0.31, 4.1, 0.39);
    box(gate, '#df9e79', x, 1.04, 0, 0.324, 0.27, 0.404);
    box(gate, '#75a696', x * 0.88, 3.85, 0, 0.16, 0.96, 0.22).rotation.z = Math.sign(x) * -0.91;
  }
  const header = box(gate, '#4f7e73', 0, 4.39, 0, 9.94, 0.42, 0.37);
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
    context.fillText('PELICAN LOOP', 256, 43);
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

function lighthouse(group, curve) {
  const tower = landmark(group, curve, 0.245, 8.6);
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

function harborPier(group, curve) {
  const dock = landmark(group, curve, 0.635, 12.8);
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

function seaStacks(group, curve) {
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
    mesh.setColorAt(2 * i, color.set('#bd936f'));
    transform.position.y += height * 0.39;
    transform.scale.set(radius * 0.73, height * 0.28, radius * 0.62);
    transform.rotation.y += 1.67;
    transform.updateMatrix();
    mesh.setMatrixAt(2 * i + 1, transform.matrix);
    mesh.setColorAt(2 * i + 1, color.set('#d3b58c'));
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

export function createIsland() {
  const group = new THREE.Group();
  group.name = 'Pelican Loop island';
  const curve = track();
  const frames = Array.from({ length: slices + 1 }, (_, i) => frameAt(curve, i / slices));
  const shore = frames.map((frame) => positionAt(frame, shorelineOffset(frame.progress)));
  const water = createWater(shore, seaLevel);
  group.add(water.mesh);
  terrain(group, frames);
  road(group, curve, frames);
  scatter(group, curve);
  entryGate(group, curve);
  const beacon = lighthouse(group, curve);
  beachHuts(group, curve);
  const rotor = windmill(group, curve);
  harborPier(group, curve);
  seaStacks(group, curve);
  const boats = sailboats(group, curve);
  let previousWeather;

  function update(time, weather) {
    water.update(time, weather);
    rotor.rotation.z = time * 0.36 + 0.42;
    for (let i = 0; i < boats.length; i += 1) {
      boats[i].position.y = seaLevel + Math.sin(time * 1.6 + i * 2) * 0.07 + 0.05;
      boats[i].rotation.z = Math.sin(time * 1.3 + i * 1.1) * 0.038;
    }
    if (weather !== previousWeather) {
      beacon.material.emissiveIntensity = weather === 'sunset' ? 0.98 : 0.19;
      previousWeather = weather;
    }
  }

  update(0, 'day');
  return { group, curve, roadWidth, update };
}
