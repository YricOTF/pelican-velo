import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const WHEEL_X = 0.72;
const WHEEL_Y = 0.47;
const CRANK_Y = 0.74;
const CRANK_RADIUS = 0.16;
const CRANK_CENTER = new THREE.Vector3(0, CRANK_Y, 0);
const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;

function surface(color, roughness = 0.5, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function mesh(parent, geometry, material, position) {
  const shape = new THREE.Mesh(geometry, material);
  if (position) shape.position.set(...position);
  shape.castShadow = true;
  shape.receiveShadow = true;
  parent.add(shape);
  return shape;
}

function tube(parent, from, to, radius, material, endRadius = radius) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const shape = mesh(parent, new THREE.CylinderGeometry(endRadius, radius, length, 12), material);
  shape.position.copy(start).addScaledVector(direction, 0.5);
  shape.quaternion.setFromUnitVectors(UP, direction.normalize());
  return shape;
}

function curve(parent, points, radius, material, segments = 24) {
  const path = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  return mesh(parent, new THREE.TubeGeometry(path, segments, radius, 8), material);
}

function oval(parent, position, size, material, segments = 20, rings = 12) {
  const shape = mesh(parent, new THREE.SphereGeometry(1, segments, rings), material, position);
  shape.scale.set(...size);
  return shape;
}

function box(parent, position, size, material) {
  return mesh(parent, new THREE.BoxGeometry(...size), material, position);
}

function ring(parent, position, radius, width, material, segments = 72) {
  return mesh(parent, new THREE.TorusGeometry(radius, width, 10, segments), material, position);
}

// Each rigid part can render once per material while retaining its own transform.
function combineParts(group) {
  const byMaterial = new Map();
  const oldParts = [...group.children];

  for (const part of oldParts) {
    part.updateMatrix();
    const geometry = part.geometry.applyMatrix4(part.matrix);
    if (!byMaterial.has(part.material)) byMaterial.set(part.material, []);
    byMaterial.get(part.material).push(geometry);
  }

  group.clear();
  for (const [material, pieces] of byMaterial) {
    mesh(group, mergeGeometries(pieces), material);
    for (const geometry of pieces) geometry.dispose();
  }
}

function buildWheel(materials) {
  const wheel = new THREE.Group();
  const { rubber, tread, cream, tealDark, spoke, brass } = materials;

  ring(wheel, [0, 0, 0], 0.43, 0.04, rubber);
  ring(wheel, [0, 0, 0], 0.386, 0.018, tealDark);
  for (const side of [-1, 1]) {
    ring(wheel, [0, 0, side * 0.027], 0.428, 0.012, cream);
    ring(wheel, [0, 0, side * 0.018], 0.398, 0.004, brass);

    for (let index = 0; index < 12; index++) {
      const angle = index * TAU / 12 + (side > 0 ? 0.13 : 0);
      const hubAngle = angle + (index % 2 === 0 ? 0.65 : -0.65);
      const mount = [0.035 * Math.cos(hubAngle), 0.035 * Math.sin(hubAngle), side * 0.046];
      const tip = [0.383 * Math.cos(angle), 0.383 * Math.sin(angle), side * 0.008];
      tube(wheel, mount, tip, 0.0037, spoke);
    }
  }

  for (let index = 0; index < 42; index++) {
    const angle = index * TAU / 42;
    const skew = index % 2 === 0 ? 0.025 : -0.025;
    const start = [0.463 * Math.cos(angle - skew), 0.463 * Math.sin(angle - skew), -0.019];
    const end = [0.463 * Math.cos(angle + skew), 0.463 * Math.sin(angle + skew), 0.019];
    tube(wheel, start, end, 0.004, tread);
  }

  tube(wheel, [0, 0, -0.072], [0, 0, 0.072], 0.025, brass);
  tube(wheel, [0, 0, -0.057], [0, 0, 0.057], 0.039, tealDark);
  tube(wheel, [0, -0.356, 0.009], [0, -0.383, 0.009], 0.006, brass);
  addSpokeReflector(wheel, materials, 0.82);
  combineParts(wheel);
  return wheel;
}

function addSpokeReflector(wheel, { brass, cream }, angle) {
  const position = [0.309 * Math.cos(angle), 0.309 * Math.sin(angle), 0.015];
  box(wheel, position, [0.108, 0.033, 0.027], brass).rotation.z = angle + Math.PI / 2;
  box(wheel, [position[0], position[1], position[2] + 0.014], [0.082, 0.021, 0.004], cream)
    .rotation.z = angle + Math.PI / 2;
}

function fender(parent, centerX, startAngle, endAngle, { teal, brass }) {
  const positions = [];
  const uvs = [];
  const indices = [];
  const segments = 32;
  const widthSegments = 10;
  const halfWidth = 0.055;

  for (let step = 0; step <= segments; step++) {
    const fraction = step / segments;
    const angle = THREE.MathUtils.lerp(startAngle, endAngle, fraction);
    for (let side = 0; side <= widthSegments; side++) {
      const width = side / widthSegments * 2 - 1;
      const radius = 0.498 - 0.017 * width ** 2;
      positions.push(centerX + radius * Math.cos(angle), WHEEL_Y + radius * Math.sin(angle), width * halfWidth);
      uvs.push(fraction, (width + 1) / 2);
      if (step < segments && side < widthSegments) {
        const a = step * (widthSegments + 1) + side;
        const b = a + widthSegments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }

  const shell = new THREE.BufferGeometry();
  shell.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  shell.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  shell.setIndex(indices);
  shell.computeVertexNormals();
  mesh(parent, shell, teal);

  for (const side of [-1, 1]) {
    const pinstripe = Array.from({ length: 30 }, (_, index) => {
      const angle = THREE.MathUtils.lerp(startAngle, endAngle, index / 29);
      return [centerX + 0.483 * Math.cos(angle), WHEEL_Y + 0.483 * Math.sin(angle), side * halfWidth];
    });
    curve(parent, pinstripe, 0.0033, brass, 36);
  }
}

function buildFrame(materials) {
  const frame = new THREE.Group();
  const { teal, tealDark, cream, brass, leather, seam, steel, rubber } = materials;
  const head = [0.48, 1.24, 0];
  const forkCrown = [0.56, 1.03, 0];
  const seatJoint = [-0.19, 1.20, 0];
  const bottomBracket = [0, CRANK_Y, 0];

  tube(frame, bottomBracket, seatJoint, 0.031, teal);
  tube(frame, bottomBracket, forkCrown, 0.035, teal, 0.036);
  curve(frame, [seatJoint, [0.005, 1.195, 0], [0.30, 1.21, 0], head], 0.028, teal);
  tube(frame, forkCrown, head, 0.043, tealDark, 0.042);
  oval(frame, [0.521, 1.146, 0.039], [0.022, 0.039, 0.009], brass).rotation.z = 0.34;
  oval(frame, [0.522, 1.15, 0.047], [0.010, 0.017, 0.003], cream).rotation.z = 0.34;
  tube(frame, [0, CRANK_Y, -0.076], [0, CRANK_Y, 0.076], 0.055, tealDark);
  tube(frame, seatJoint, [-0.22, 1.315, 0], 0.019, steel);
  tube(frame, [-0.197, 1.196, 0], [-0.204, 1.221, 0], 0.037, tealDark);

  for (const side of [-1, 1]) {
    const rearAxle = [-WHEEL_X, WHEEL_Y, side * 0.077];
    const frontAxle = [WHEEL_X, WHEEL_Y, side * 0.077];
    curve(frame, [rearAxle, [-0.42, 0.56, side * 0.073], [0, CRANK_Y, side * 0.056]], 0.018, teal);
    curve(frame, [rearAxle, [-0.56, 0.72, side * 0.073], [-0.35, 1.03, side * 0.051], seatJoint], 0.016, teal);
    curve(frame, [[0.56, 1.033, side * 0.052], [0.60, 0.81, side * 0.064], [0.65, 0.57, side * 0.074], frontAxle], 0.023, teal);
    tube(frame, [WHEEL_X, WHEEL_Y, side * 0.061], [WHEEL_X, WHEEL_Y, side * 0.088], 0.026, brass);
    tube(frame, [-WHEEL_X, WHEEL_Y, side * 0.061], [-WHEEL_X, WHEEL_Y, side * 0.088], 0.024, brass);
    tube(frame, rearAxle, [-1.03, 0.845, side * 0.049], 0.006, steel);
    tube(frame, frontAxle, [0.99, 0.866, side * 0.049], 0.006, steel);
  }

  fender(frame, WHEEL_X, 0.66, 2.46, materials);
  fender(frame, -WHEEL_X, 0.49, 2.98, materials);

  tube(frame, [-0.54, 0.95, 0], [-0.605, 1.006, 0], 0.011, brass);
  for (const side of [-1, 1]) {
    curve(frame, [[-1.067, 0.954, side * 0.08], [-1.047, 0.984, side * 0.083], [-0.81, 1.001, side * 0.083], [-0.478, 0.99, side * 0.046]], 0.01, brass);
    tube(frame, [-WHEEL_X, WHEEL_Y, side * 0.081], [-0.979, 0.985, side * 0.083], 0.008, brass);
  }
  for (let index = 0; index < 4; index++) {
    const x = -0.98 + index * 0.11;
    tube(frame, [x, 0.991, -0.081], [x, 0.991, 0.081], 0.009, brass);
  }
  oval(frame, [-1.08, 0.954, 0], [0.036, 0.046, 0.054], tealDark);
  oval(frame, [-1.105, 0.95, 0], [0.019, 0.033, 0.039], materials.tailLight);

  oval(frame, [-0.252, 1.302, 0], [0.163, 0.025, 0.092], tealDark);
  oval(frame, [-0.285, 1.325, 0], [0.132, 0.037, 0.102], leather);
  oval(frame, [-0.177, 1.33, 0], [0.084, 0.030, 0.054], leather);
  for (const side of [-1, 1]) {
    curve(frame, [[-0.397, 1.321, side * 0.051], [-0.314, 1.319, side * 0.099], [-0.238, 1.319, side * 0.090], [-0.151, 1.325, side * 0.051]], 0.003, seam);
  }

  tube(frame, head, [0.432, 1.50, 0], 0.022, steel);
  tube(frame, [0.432, 1.50, 0], [0.517, 1.531, 0], 0.025, tealDark);
  for (const side of [-1, 1]) {
    curve(frame, [[0.517, 1.53, 0], [0.566, 1.557, side * 0.102], [0.564, 1.55, side * 0.20], [0.476, 1.55, side * 0.20]], 0.013, steel);
    tube(frame, [0.463, 1.55, side * 0.20], [0.548, 1.55, side * 0.20], 0.024, leather);
    for (const x of [0.465, 0.489, 0.513, 0.545]) {
      ring(frame, [x, 1.55, side * 0.20], 0.021, 0.0027, seam, 20).rotation.y = Math.PI / 2;
    }
    curve(frame, [[0.542, 1.549, side * 0.173], [0.60, 1.539, side * 0.172], [0.603, 1.496, side * 0.228], [0.557, 1.481, side * 0.237]], 0.008, steel);
    curve(frame, [[0.602, 1.489, side * 0.214], [0.674, 1.414, side * 0.143], [0.626, 1.25, side * 0.095], [0.573, 1.116, side * 0.061]], 0.005, rubber);
  }
  oval(frame, [0.53, 1.589, 0.135], [0.039, 0.025, 0.039], brass);
  tube(frame, [0.53, 1.568, 0.135], [0.53, 1.541, 0.135], 0.019, steel);

  curve(frame, [[0.544, 1.123, 0], [0.605, 1.234, 0], [0.680, 1.248, 0]], 0.011, steel);
  oval(frame, [0.695, 1.286, 0], [0.092, 0.064, 0.063], tealDark);
  ring(frame, [0.761, 1.289, 0], 0.053, 0.009, brass).rotation.y = Math.PI / 2;
  oval(frame, [0.768, 1.289, 0], [0.017, 0.050, 0.050], materials.headLight);
  combineParts(frame);
  return frame;
}

function buildChain(parent, { tealDark, brass }) {
  const rear = new THREE.Vector2(-WHEEL_X, WHEEL_Y);
  const front = new THREE.Vector2(0, CRANK_Y);
  const rearRadius = 0.045;
  const frontRadius = 0.105;
  const chainZ = 0.093;
  const span = front.clone().sub(rear);
  const axis = Math.atan2(span.y, span.x);
  const normalAngle = Math.acos((rearRadius - frontRadius) / span.length());
  const top = axis + normalAngle;
  const bottom = axis - normalAngle;
  const at = (center, radius, angle) => [center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle), chainZ];
  const links = new THREE.Group();

  ring(links, [rear.x, rear.y, chainZ], rearRadius - 0.008, 0.009, brass, 28);
  tube(links, at(rear, rearRadius, top), at(front, frontRadius, top), 0.009, tealDark);
  tube(links, at(rear, rearRadius, bottom), at(front, frontRadius, bottom), 0.009, tealDark);
  const rearLinks = Array.from({ length: 12 }, (_, index) => at(rear, rearRadius, THREE.MathUtils.lerp(top, bottom + TAU, index / 11)));
  const frontLinks = Array.from({ length: 17 }, (_, index) => at(front, frontRadius, THREE.MathUtils.lerp(bottom, top, index / 16)));
  curve(links, rearLinks, 0.009, tealDark, 20);
  curve(links, frontLinks, 0.009, tealDark, 24);

  const [rearX, rearY] = at(rear, rearRadius, top);
  const [frontX, frontY] = at(front, frontRadius, top);
  for (let index = 1; index < 21; index++) {
    const fraction = index / 21;
    const position = [THREE.MathUtils.lerp(rearX, frontX, fraction), THREE.MathUtils.lerp(rearY, frontY, fraction), chainZ + 0.008];
    oval(links, position, [0.004, 0.004, 0.002], brass, 8, 6);
  }
  combineParts(links);
  parent.add(links);
}

function buildCrank(materials) {
  const { brass, steel, rubber, cream } = materials;
  const crank = new THREE.Group();
  crank.position.copy(CRANK_CENTER);
  ring(crank, [0, 0, 0.093], 0.092, 0.010, brass, 44);

  for (let index = 0; index < 5; index++) {
    const angle = index * TAU / 5;
    tube(crank, [0, 0, 0.094], [Math.cos(angle) * 0.087, Math.sin(angle) * 0.087, 0.094], 0.007, steel);
  }
  for (const side of [-1, 1]) {
    tube(crank, [0, 0, side * 0.12], [side * CRANK_RADIUS, 0, side * 0.13], 0.014, steel, 0.011);
    tube(crank, [side * CRANK_RADIUS, 0, side * 0.124], [side * CRANK_RADIUS, 0, side * 0.19], 0.008, brass);
  }
  tube(crank, [0, 0, -0.126], [0, 0, 0.126], 0.024, brass);
  combineParts(crank);

  const pedal = new THREE.Group();
  box(pedal, [0, 0, 0], [0.092, 0.021, 0.068], steel);
  for (const x of [-0.033, -0.011, 0.011, 0.033]) {
    box(pedal, [x, 0.012, 0], [0.012, 0.008, 0.070], rubber);
  }
  for (const side of [-1, 1]) {
    box(pedal, [0, 0, side * 0.035], [0.061, 0.013, 0.005], cream);
  }
  combineParts(pedal);
  return { crank, pedals: [pedal, pedal.clone()] };
}

export function createBicycle() {
  const materials = {
    teal: surface(0x439486, 0.32, 0.21),
    tealDark: surface(0x234f47, 0.35, 0.25),
    rubber: surface(0x252e2d, 0.83),
    tread: surface(0x384341, 0.8),
    steel: surface(0xc4c7a9, 0.4, 0.62),
    spoke: surface(0xede2c7, 0.43, 0.39),
    brass: surface(0xcb9347, 0.35, 0.49),
    cream: surface(0xffe4b4, 0.65),
    leather: surface(0x963d27, 0.68),
    seam: surface(0xefb573, 0.71),
    tailLight: surface(0xd74d32, 0.33),
    headLight: new THREE.MeshStandardMaterial({ color: 0xffe7ab, emissive: 0xffbf58, emissiveIntensity: 0.27, roughness: 0.25 }),
  };
  const group = new THREE.Group();
  group.name = 'Coastal roadster';

  const back = buildWheel(materials);
  const front = back.clone();
  back.position.set(-WHEEL_X, WHEEL_Y, 0);
  front.position.set(WHEEL_X, WHEEL_Y, 0);
  group.add(back, front, buildFrame(materials));
  buildChain(group, materials);
  const { crank, pedals } = buildCrank(materials);
  group.add(crank, ...pedals);

  function update(wheelAngle, crankAngle) {
    back.rotation.z = wheelAngle;
    front.rotation.z = wheelAngle - 1.05;
    crank.rotation.z = crankAngle;
    const x = CRANK_RADIUS * Math.cos(crankAngle);
    const y = CRANK_RADIUS * Math.sin(crankAngle);
    pedals[0].position.set(x, CRANK_Y + y, 0.16);
    pedals[1].position.set(-x, CRANK_Y - y, -0.16);
  }

  update(0, 0);
  return { group, update };
}
