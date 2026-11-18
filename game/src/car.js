import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const styles = [
  { name: 'Coral hatchback', color: 0xcb574e, roof: 0xffedc8, length: 3.91, halfWidth: .85, axles: [-1.19, 1.20], tire: .38, belt: .99, cabin: [-1.65, .97, -1.39, .38, 1.59] },
  { name: 'Blue delivery van', color: 0x699ebf, roof: 0xf8eac8, length: 4.25, halfWidth: .89, axles: [-1.34, 1.30], tire: .40, belt: 1.06, cabin: [-1.94, 1.64, -1.82, 1.24, 1.96], van: true },
  { name: 'Yellow commuter', color: 0xe7a94d, roof: 0xffdf8b, length: 3.66, halfWidth: .83, axles: [-1.06, 1.13], tire: .36, belt: .95, cabin: [-1.41, .81, -1.07, .21, 1.49] },
  { name: 'Cream station wagon', color: 0x569988, roof: 0xffefcc, length: 4.12, halfWidth: .88, axles: [-1.25, 1.22], tire: .39, belt: 1.01, cabin: [-1.87, .87, -1.71, .42, 1.72], wagon: true },
];
const trim = 0x344744;
const chrome = 0xa9b8ae;
const glass = 0x396373;
const glassShade = 0x2f505e;
const glassTint = 0x628b93;
const cream = 0xf7eccc;
const axleAxis = new THREE.Vector3(0, 0, 1);
const carMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .57, metalness: .07 });
const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x182d28, vertexColors: true, transparent: true, depthWrite: false });
const models = new WeakMap();

function addPart(parts, geometry, color) {
  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry;
  const shade = new THREE.Color(color);
  const count = nonIndexed.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  for (let offset = 0; offset < colors.length; offset += 3) shade.toArray(colors, offset);
  nonIndexed.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  parts.push(nonIndexed);
  if (nonIndexed !== geometry) geometry.dispose();
}

function box(parts, position, dimensions, color) {
  addPart(parts, new THREE.BoxGeometry(...dimensions).translate(...position), color);
}

function cylinder(parts, position, radii, length, color, axis, segments = 14) {
  const geometry = new THREE.CylinderGeometry(radii[0], radii[1], length, segments);
  if (axis === 'x') geometry.rotateZ(-Math.PI / 2);
  if (axis === 'z') geometry.rotateX(Math.PI / 2);
  addPart(parts, geometry.translate(...position), color);
}

function torus(parts, position, radius, width, angle, color) {
  const geometry = new THREE.TorusGeometry(radius, width, 6, 18, angle);
  addPart(parts, geometry.translate(...position), color);
}

function combine(parts) {
  const result = mergeGeometries(parts);
  for (const part of parts) part.dispose();
  return result;
}

function buildBody(parts, style) {
  const { length, halfWidth, tire, axles, belt, color, roof } = style;
  const rear = -length / 2 + .08;
  const front = length / 2 - .08;
  const archRadius = tire + .06;
  const side = new THREE.Shape();
  side.moveTo(rear + .08, tire);
  for (const axle of axles) {
    side.lineTo(axle - archRadius, tire);
    side.absarc(axle, tire, archRadius, Math.PI, 0, true);
  }
  side.lineTo(front - .09, tire);
  side.quadraticCurveTo(front, tire + .025, front, tire + .12);
  side.lineTo(front, belt - .18);
  side.quadraticCurveTo(front, belt - .075, front - .20, belt - .04);
  side.lineTo(front - .63, belt);
  side.lineTo(rear + .26, belt);
  side.quadraticCurveTo(rear + .04, belt - .015, rear, belt - .145);
  side.lineTo(rear, tire + .10);
  side.quadraticCurveTo(rear, tire + .015, rear + .08, tire);
  const bevel = .039;
  const hull = new THREE.ExtrudeGeometry(side, {
    depth: 2 * (halfWidth - bevel), bevelEnabled: true, bevelThickness: bevel,
    bevelSize: .035, bevelSegments: 2, curveSegments: 12,
  });
  addPart(parts, hull.translate(0, 0, -halfWidth + bevel), color);

  for (const sign of [-1, 1]) {
    const edge = sign * (halfWidth + .004);
    for (const axle of axles) torus(parts, [axle, tire, edge], archRadius + .02, .018, Math.PI, trim);
    box(parts, [0, belt - .13, edge], [length - .52, .024, .025], roof);
    box(parts, [(axles[0] + axles[1]) / 2, tire + .067, edge], [1.3, .037, .028], trim);
    box(parts, [style.van ? .50 : -.24, belt - .085, edge * 1.022], [.153, .029, .028], chrome);
    if (style.van || style.wagon) box(parts, [-1.18, belt - .087, edge * 1.022], [.14, .026, .027], chrome);
    box(parts, [front - .28, tire + .20, edge], [.105, .05, .027], 0xf6a13c);
  }

  const bumperWidth = 2 * halfWidth - .13;
  box(parts, [front + .023, tire + .10, 0], [.137, .126, bumperWidth], trim);
  box(parts, [rear - .023, tire + .10, 0], [.137, .126, bumperWidth], trim);
  box(parts, [front + .088, tire + .145, 0], [.023, .041, bumperWidth - .07], chrome);
  box(parts, [rear - .088, tire + .145, 0], [.023, .041, bumperWidth - .07], chrome);
  box(parts, [front + .019, belt - .26, 0], [.047, .174, .70], trim);
  for (const height of [belt - .305, belt - .263, belt - .221]) {
    box(parts, [front + .045, height, 0], [.018, .013, .63], chrome);
  }
  box(parts, [front + .071, tire + .12, 0], [.045, .096, .255], cream);
  box(parts, [rear - .060, belt - .24, 0], [.055, .111, .275], cream);
  box(parts, [rear - .090, belt - .24, 0], [.008, .023, .155], trim);

  for (const sign of [-1, 1]) {
    const z = sign * (halfWidth - .21);
    if (style.van) {
      box(parts, [front + .005, belt - .205, z], [.065, .181, .243], chrome);
      box(parts, [front + .042, belt - .205, z], [.019, .132, .19], cream);
    } else {
      cylinder(parts, [front + .015, belt - .207, z], [.116, .116], .081, chrome, 'x');
      cylinder(parts, [front + .061, belt - .207, z], [.088, .091], .027, cream, 'x');
    }
    box(parts, [rear - .026, belt - .20, z], [.067, .207, .196], trim);
    box(parts, [rear - .064, belt - .262, z], [.026, .045, .151], 0xf1ad50);
  }
}

function makeQuad(parts, vertices, outward, color) {
  const [a, b, c, d] = vertices;
  const normal = b.clone().sub(a).cross(c.clone().sub(a));
  const order = normal.dot(outward) > 0 ? [a, b, c, a, c, d] : [a, c, b, a, d, c];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(order.flatMap((point) => point.toArray()), 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  geometry.computeVertexNormals();
  addPart(parts, geometry, color);
}

function buildCabin(parts, style) {
  const { belt, halfWidth, color, roof, van, wagon } = style;
  const [rear, front, topRear, topFront, peak] = style.cabin;
  const lower = halfWidth - .098;
  const upper = halfWidth - (van ? .143 : .20);
  const baseY = belt - .027;
  const roofY = peak - .048;
  const ring = (back, fore, y, width) => [
    new THREE.Vector3(back, y, -width), new THREE.Vector3(fore, y, -width),
    new THREE.Vector3(fore, y, width), new THREE.Vector3(back, y, width),
  ];
  const base = ring(rear, front, baseY, lower);
  const top = ring(topRear, topFront, roofY, upper);
  const cap = ring(topRear + .043, topFront - .043, peak, upper - .043);

  const face = (start, end, outward, windows) => {
    const vertices = [base[start], base[end], top[end], top[start]];
    makeQuad(parts, vertices, outward, color);
    const [a, b, c, d] = vertices;
    const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    if (normal.dot(outward) < 0) normal.negate();
    const point = (u, v, lift) => a.clone().lerp(b, u).lerp(d.clone().lerp(c, u), v).addScaledVector(normal, lift);

    for (const [begin, end, shade] of windows) {
      const inset = (end - begin) * .05;
      makeQuad(parts, [point(begin, .10, .008), point(end, .10, .008), point(end - inset, .90, .008), point(begin + inset, .90, .008)], outward, trim);
      makeQuad(parts, [point(begin + .013, .137, .012), point(end - .013, .137, .012), point(end - inset - .012, .861, .012), point(begin + inset + .012, .861, .012)], outward, shade);
      const width = end - begin;
      makeQuad(parts, [point(begin + width * .20, .16, .013), point(begin + width * .33, .16, .013), point(begin + width * .60, .84, .013), point(begin + width * .46, .84, .013)], outward, glassTint);
    }
    makeQuad(parts, [top[start], top[end], cap[end], cap[start]], outward, roof);
  };

  const sideWindows = van || wagon
    ? [[.045, .26, glassShade], [.281, .596, glass], [.623, .963, glass]]
    : [[.063, .433, glassShade], [.468, .947, glass]];
  face(0, 1, new THREE.Vector3(0, 0, -1), sideWindows);
  face(3, 2, new THREE.Vector3(0, 0, 1), sideWindows);
  face(1, 2, new THREE.Vector3(1, 0, 0), [[.059, .94, glass]]);
  face(0, 3, new THREE.Vector3(-1, 0, 0), [[.073, .927, glassShade]]);
  makeQuad(parts, cap, new THREE.Vector3(0, 1, 0), roof);

  for (const sign of [-1, 1]) {
    const mirrorX = front - .12;
    const mirrorY = belt + (van ? .24 : .15);
    const z = sign * (halfWidth + .014);
    box(parts, [mirrorX - .025, mirrorY - .026, z], [.11, .034, .061], trim);
    box(parts, [mirrorX, mirrorY, z], [.10, .081, .075], color);
    box(parts, [mirrorX - .056, mirrorY, z], [.014, .057, .058], chrome);
  }

  if (van || wagon) {
    for (const z of [-.44, .44]) {
      box(parts, [(topRear + topFront) / 2, peak + .026, z], [1.18, .035, .055], trim);
    }
  }
}

function buildWheel(tire) {
  const parts = [];
  cylinder(parts, [0, 0, 0], [tire * .99, tire * .99], .184, 0x252d2e, 'z', 20);
  for (const side of [-1, 1]) {
    const z = side * .094;
    torus(parts, [0, 0, z * .88], tire * .91, .016, 2 * Math.PI, trim);
    cylinder(parts, [0, 0, z], [tire * .65, tire * .65], .029, chrome, 'z', 16);
    cylinder(parts, [0, 0, z * 1.15], [tire * .54, tire * .54], .012, trim, 'z');
    for (let index = 0; index < 5; index++) {
      const angle = index * Math.PI * 2 / 5;
      const spoke = new THREE.BoxGeometry(tire * .46, .041, .013);
      spoke.translate(tire * .29, 0, z * 1.22).rotateZ(angle);
      addPart(parts, spoke, cream);
    }
    cylinder(parts, [0, 0, z * 1.255], [tire * .22, tire * .22], .021, chrome, 'z', 12);
  }
  return combine(parts);
}

function buildShadow(length, halfWidth) {
  const positions = [];
  const colors = [];
  const indices = [];
  const rings = [[0, .39], [.60, .34], [.83, .16], [1, 0]];
  const steps = 26;
  for (const [radius, opacity] of rings) {
    for (let index = 0; index <= steps; index++) {
      const angle = index * Math.PI * 2 / steps;
      positions.push(radius * length * .56 * Math.cos(angle), .014, radius * halfWidth * 1.31 * Math.sin(angle));
      colors.push(1, 1, 1, opacity);
    }
  }
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let segment = 0; segment < steps; segment++) {
      const a = ring * (steps + 1) + segment;
      const b = a + steps + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
  geometry.setIndex(indices);
  return geometry;
}

function buildModel(style) {
  const parts = [];
  buildBody(parts, style);
  buildCabin(parts, style);
  const lamps = [];
  for (const side of [-1, 1]) {
    box(lamps, [-style.length / 2 + .011, style.belt - .173, side * (style.halfWidth - .21)], [.028, .107, .15], 0xffeeee);
  }
  return {
    body: combine(parts),
    wheels: buildWheel(style.tire),
    lamps: combine(lamps),
    shadow: buildShadow(style.length, style.halfWidth),
  };
}

export function createCar(style = 0) {
  const design = styles[style] ?? styles[0];
  if (!models.has(design)) models.set(design, buildModel(design));
  const model = models.get(design);
  const group = new THREE.Group();
  group.name = design.name;
  const body = new THREE.Mesh(model.body, carMaterial);
  const wheels = new THREE.InstancedMesh(model.wheels, carMaterial, 4);
  wheels.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const lampMaterial = new THREE.MeshStandardMaterial({ color: 0xaf242d, emissive: 0xfe3028, emissiveIntensity: .16, roughness: .42 });
  const lamps = new THREE.Mesh(model.lamps, lampMaterial);
  const shadow = new THREE.Mesh(model.shadow, shadowMaterial);
  group.add(body, wheels, lamps, shadow);

  const fit = new THREE.Object3D();
  const wheelTrack = design.halfWidth - .09;
  function update(distance, braking = false) {
    fit.quaternion.setFromAxisAngle(axleAxis, -distance / design.tire);
    let index = 0;
    for (const axle of design.axles) {
      for (const side of [-1, 1]) {
        fit.position.set(axle, design.tire, side * wheelTrack);
        fit.updateMatrix();
        wheels.setMatrixAt(index++, fit.matrix);
      }
    }
    wheels.instanceMatrix.needsUpdate = true;
    lampMaterial.emissiveIntensity = .16 + 1.68 * THREE.MathUtils.clamp(Number(braking), 0, 1);
  }

  update(0);
  return { group, update };
}
