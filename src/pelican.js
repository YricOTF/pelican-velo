import * as THREE from 'three';

const sphere = new THREE.SphereGeometry(1, 26, 18);
const up = new THREE.Vector3(0, 1, 0);
const vector = (x, y, z) => new THREE.Vector3(x, y, z);

function material(color, roughness = 0.74, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function mesh(parent, geometry, surface) {
  const object = new THREE.Mesh(geometry, surface);
  object.castShadow = true;
  parent.add(object);
  return object;
}

function ellipsoid(parent, surface, position, scale) {
  const object = mesh(parent, sphere, surface);
  object.position.set(...position);
  object.scale.set(...scale);
  return object;
}

function curve(parent, points, radius, surface) {
  const path = new THREE.CatmullRomCurve3(points.map((point) => vector(...point)));
  return mesh(parent, new THREE.TubeGeometry(path, 24, radius, 8, false), surface);
}

function align(object, start, end) {
  object.position.copy(start).lerp(end, 0.5);
  const direction = end.clone().sub(start);
  object.quaternion.setFromUnitVectors(up, direction.normalize());
}

function feather(parent, surface, start, tip, width, depth) {
  const origin = vector(...start);
  const end = vector(...tip);
  const geometry = sphere.clone();
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index++) {
    const taper = 1 - positions.getY(index) * 0.44;
    positions.setX(index, positions.getX(index) * taper);
    positions.setZ(index, positions.getZ(index) * taper);
  }
  geometry.computeVertexNormals();
  const object = mesh(parent, geometry, surface);
  align(object, origin, end);
  object.scale.set(width, origin.distanceTo(end) / 2, depth);
  return object;
}

function interpolate(rows, progress) {
  const index = Math.min(rows.length - 2, Math.floor(progress));
  const blend = progress - index;
  return rows[index].map((value, dimension) => cubic(
    rows[Math.max(0, index - 1)][dimension], value, rows[index + 1][dimension],
    rows[Math.min(rows.length - 1, index + 2)][dimension], blend,
  ));
}

function cubic(before, start, end, after, t) {
  const startSlope = (end - before) / 2;
  const endSlope = (after - start) / 2;
  const squared = t * t;
  const cubed = squared * t;
  return (2 * cubed - 3 * squared + 1) * start + (cubed - 2 * squared + t) * startSlope
    + (-2 * cubed + 3 * squared) * end + (cubed - squared) * endSlope;
}

function ringGeometry(rows, getPoint, getColor) {
  const segments = (rows.length - 1) * 7;
  const sides = 36;
  const positions = [];
  const colors = [];
  const indices = [];

  for (let row = 0; row <= segments; row++) {
    const progress = row / segments;
    const section = interpolate(rows, progress * (rows.length - 1));
    for (let side = 0; side < sides; side++) {
      const angle = side / sides * Math.PI * 2;
      positions.push(...getPoint(section, angle));
      if (getColor) {
        const color = getColor(progress, angle);
        colors.push(color.r, color.g, color.b);
      }
      if (row < segments) {
        const current = row * sides + side;
        const nextSide = row * sides + (side + 1) % sides;
        indices.push(current, current + sides, nextSide + sides, current, nextSide + sides, nextSide);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (getColor) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const billRows = [
  [0.22, 2.298, 0.148, 0.075, 0.116],
  [0.36, 2.254, 0.153, 0.082, 0.178],
  [0.53, 2.230, 0.135, 0.071, 0.206],
  [0.72, 2.209, 0.101, 0.054, 0.164],
  [0.89, 2.192, 0.064, 0.038, 0.088],
  [1.02, 2.176, 0.032, 0.029, 0.027],
  [1.058, 2.154, 0.001, 0.002, 0.002],
];

function createBill(head) {
  const enamel = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.66 });
  const seamMaterial = material('#ae6032');
  const crown = new THREE.Color('#ffd27b');
  const edge = new THREE.Color('#ed943a');
  const pouchEdge = new THREE.Color('#faaf54');
  const pouchBase = new THREE.Color('#f0966c');
  const rosyTip = new THREE.Color('#ffbd62');

  mesh(head, ringGeometry(billRows, ([x, y, width, rise], angle) => {
    const vertical = Math.sin(angle);
    return [x, y + vertical * (vertical > 0 ? rise : 0.013), width * Math.cos(angle)];
  }, (progress, angle) => edge.clone().lerp(crown, Math.max(0, Math.sin(angle)))
    .lerp(rosyTip, progress ** 5 * 0.65)), enamel);

  mesh(head, ringGeometry(billRows, ([x, y, width, , depth], angle) => {
    const vertical = Math.sin(angle);
    return [x, y - 0.014 + vertical * (vertical > 0 ? 0.014 : depth), width * 0.97 * Math.cos(angle)];
  }, (progress, angle) => pouchEdge.clone().lerp(pouchBase, Math.max(0, -Math.sin(angle)))
    .lerp(rosyTip, progress ** 4 * 0.5)), enamel);

  for (const side of [-1, 1]) {
    const tipEdge = [];
    for (let index = 0; index <= 16; index++) {
      const [x, y, width] = interpolate(billRows, 1 + index / 4);
      tipEdge.push([x, y - 0.008, side * (width + 0.0015)]);
    }
    curve(head, tipEdge, 0.003, seamMaterial);
    const nostril = ellipsoid(head, material('#ad622c'), [0.423, 2.311, side * 0.118], [0.022, 0.007, 0.004]);
    nostril.rotation.x = -side * 0.47;
    nostril.rotation.z = -0.19;
  }
}

function goggles(head, palette) {
  const eyes = [];
  const lensFrame = new THREE.TorusGeometry(1, 0.119, 10, 40);
  const lensTrim = new THREE.TorusGeometry(1, 0.047, 8, 40);
  for (const side of [-1, 1]) {
    const assembly = new THREE.Group();
    assembly.position.set(0.212, 2.385, 0.190 * side);
    assembly.rotation.y = side * 0.26;
    assembly.rotation.z = -0.075;
    assembly.scale.z = side;
    head.add(assembly);

    ellipsoid(assembly, palette.leather, [0, 0, 0.004], [0.128, 0.117, 0.043]);
    ellipsoid(assembly, palette.eyeSurround, [0, 0, 0.031], [0.111, 0.102, 0.031]);
    const moving = new THREE.Group();
    moving.position.z = 0.047;
    assembly.add(moving);
    eyes.push(moving);
    ellipsoid(moving, palette.eyeWhite, [0, 0, 0.002], [0.098, 0.092, 0.021]);
    ellipsoid(moving, palette.iris, [0.027, 0.005, 0.018], [0.047, 0.057, 0.021]);
    ellipsoid(moving, palette.pupil, [0.034, 0.006, 0.035], [0.029, 0.041, 0.012]);
    ellipsoid(moving, palette.catchlight, [0.023, 0.027, 0.046], [0.014, 0.014, 0.004]);
    ellipsoid(moving, palette.catchlight, [0.05, -0.01, 0.045], [0.005, 0.006, 0.003]);

    const frame = mesh(assembly, lensFrame, palette.brass);
    frame.position.z = 0.054;
    frame.scale.set(0.111, 0.102, 0.115);
    const trim = mesh(assembly, lensTrim, palette.brassLight);
    trim.position.z = 0.068;
    trim.scale.set(0.112, 0.103, 0.113);
    ellipsoid(assembly, palette.brassLight, [-0.111, -0.008, 0.038], [0.025, 0.016, 0.017]);
  }

  const strap = new THREE.CatmullRomCurve3([
    vector(0.135, 2.375, 0.200), vector(0.007, 2.371, 0.214),
    vector(-0.117, 2.374, 0.138), vector(-0.143, 2.380, 0),
    vector(-0.117, 2.374, -0.138), vector(0.007, 2.371, -0.214), vector(0.135, 2.375, -0.200),
  ]);
  mesh(head, new THREE.TubeGeometry(strap, 30, 0.025, 8, false), palette.leather);
  curve(head, [[0.322, 2.402, -0.167], [0.379, 2.418, 0], [0.322, 2.402, 0.167]], 0.013, palette.brass);
  return eyes;
}

function createScarf(torso, palette) {
  for (const [height, radius, surface] of [
    [2.013, 0.040, palette.scarf], [1.975, 0.041, palette.scarfDark], [2.036, 0.012, palette.scarfLight],
  ]) {
    const collar = mesh(torso, new THREE.TorusGeometry(0.164, radius, 10, 38), surface);
    collar.position.set(-0.025, height, 0);
    collar.scale.set(1.1, 0.96, 1);
    collar.rotation.set(Math.PI / 2, 0.15, -0.09);
  }
  ellipsoid(torso, palette.scarf, [-0.173, 1.99, 0.142], [0.077, 0.06, 0.069]);
  ellipsoid(torso, palette.scarfLight, [-0.181, 2.014, 0.174], [0.048, 0.033, 0.042]);

  const fabric = [palette.scarf.clone(), palette.scarfDark.clone()];
  const stitch = palette.scarfLight.clone();
  for (const surface of [...fabric, stitch]) surface.side = THREE.DoubleSide;
  const segments = 22;
  const streamers = fabric.map((surface, ribbon) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new THREE.BufferAttribute(new Float32Array((segments + 1) * 4 * 3), 3);
    const indices = [];
    const stitches = [];
    for (let row = 0; row < segments; row++) {
      for (let column = 0; column < 3; column++) {
        const corner = row * 4 + column;
        const triangles = [corner, corner + 4, corner + 1, corner + 1, corner + 4, corner + 5];
        (column === 0 ? stitches : indices).push(...triangles);
      }
    }
    geometry.setAttribute('position', positions);
    geometry.setIndex(indices.concat(stitches));
    geometry.addGroup(0, indices.length, 0);
    geometry.addGroup(indices.length, stitches.length, 1);
    const ribbonMesh = mesh(torso, geometry, [surface, stitch]);
    ribbonMesh.frustumCulled = false;
    return { geometry, positions, ribbon };
  });

  return (time, energy) => {
    for (const { geometry, positions, ribbon } of streamers) {
      for (let row = 0; row <= segments; row++) {
        const distance = row / segments;
        const phase = time * (4.2 + energy * 0.75) - distance * 6 + ribbon * 1.6;
        const wave = Math.sin(phase) * distance;
        const height = (ribbon ? 0.065 : 0.093) * (1 + distance * 0.35);
        for (let column = 0; column < 4; column++) {
          const across = [0, 0.16, 0.64, 1][column] - 0.5;
          const notch = column === 2 ? Math.max(0, distance - 0.90) * 0.36 : 0;
          positions.setXYZ(row * 4 + column,
            -0.17 - distance * (ribbon ? 0.58 : 0.76) + notch,
            1.985 - ribbon * 0.029 + distance * (0.073 - ribbon * 0.175) + wave * 0.058 + across * height,
            0.165 + distance * (0.07 + ribbon * 0.032) + Math.cos(phase) * 0.085 * distance + across * wave * 0.098);
        }
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  };
}

function createWing(torso, group, palette, side) {
  const window = ellipsoid(torso, palette.wing, [-0.294, 1.615, 0.262 * side], [0.316, 0.207, 0.10]);
  window.rotation.z = 0.19;

  const flightFeathers = [
    [[-0.23, 1.678, 0.337], [-0.650, 1.592, 0.284], 0.060, palette.featherBlue],
    [[-0.20, 1.635, 0.344], [-0.625, 1.534, 0.295], 0.057, palette.featherInk],
    [[-0.18, 1.593, 0.340], [-0.573, 1.478, 0.288], 0.054, palette.featherBlue],
    [[-0.17, 1.553, 0.328], [-0.497, 1.438, 0.269], 0.050, palette.featherInk],
  ];
  for (const [root, tip, width, surface] of flightFeathers) {
    feather(torso, surface, [root[0], root[1], root[2] * side], [tip[0], tip[1], tip[2] * side], width, 0.027);
  }

  const coverts = [
    [[-0.06, 1.723, 0.297], [-0.535, 1.641, 0.337], 0.079],
    [[-0.08, 1.667, 0.314], [-0.500, 1.572, 0.346], 0.066],
    [[-0.10, 1.614, 0.306], [-0.440, 1.512, 0.334], 0.062],
  ];
  for (const [root, tip, width] of coverts) {
    feather(torso, palette.wingLight, [root[0], root[1], root[2] * side], [tip[0], tip[1], tip[2] * side], width, 0.035);
  }

  const upper = ellipsoid(group, palette.wingLight, [0, 0, 0], [0.117, 0.198, 0.087]);
  const lower = ellipsoid(group, palette.cream, [0, 0, 0], [0.072, 0.176, 0.062]);
  const cuff = ellipsoid(group, palette.wingLight, [0.485, 1.55, side * 0.219], [0.085, 0.057, 0.062]);
  cuff.rotation.z = -0.15;
  for (let index = 0; index < 3; index++) {
    feather(group, index === 2 ? palette.wing : palette.cream,
      [0.459, 1.562 + index * 0.009, side * (0.243 - index * 0.024)],
      [0.550 + index * 0.007, 1.518 + index * 0.003, side * (0.247 - index * 0.024)], 0.027, 0.024);
  }

  return (time, bob) => {
    const shoulder = vector(-0.126, 1.694 + bob, side * 0.288);
    const elbow = vector(0.206, 1.555 + bob * 0.63 + Math.sin(time * 2.1) * 0.005, side * 0.338);
    const hand = vector(0.492, 1.552, side * 0.218);
    align(upper, shoulder, elbow);
    align(lower, elbow, hand);
  };
}

function createFoot(group, palette, side) {
  const upper = ellipsoid(group, palette.thigh, [0, 0, 0], [0.064, 0.132, 0.060]);
  const shin = ellipsoid(group, palette.foot, [0, 0, 0], [0.036, 0.152, 0.037]);
  const ankle = ellipsoid(group, palette.foot, [0, 0, 0], [0.055, 0.046, 0.052]);
  const web = new THREE.Group();
  group.add(web);
  ellipsoid(web, palette.foot, [0.036, 0.018, 0], [0.113, 0.029, 0.066]);
  for (let index = -1; index <= 1; index++) {
    const toe = ellipsoid(web, palette.footLight, [0.100 - Math.abs(index) * 0.018, 0.015, index * 0.035],
      [0.064, 0.022, 0.021]);
    toe.rotation.y = -index * 0.30;
  }
  return (angle, bob) => {
    const phase = angle + (side < 0 ? Math.PI : 0);
    const hip = vector(-0.193, 1.435 + bob, side * 0.163);
    const foot = vector(0.16 * Math.cos(phase), 0.774 + 0.16 * Math.sin(phase), side * 0.164);
    const knee = vector(foot.x * 0.58 + 0.024, (foot.y + hip.y) / 2 + 0.032, side * 0.190);
    const hinge = vector(foot.x - 0.017, foot.y + 0.045, foot.z);
    align(upper, hip, knee);
    align(shin, knee, hinge);
    upper.scale.y = hip.distanceTo(knee) / 2 + 0.035;
    shin.scale.y = knee.distanceTo(hinge) / 2 + 0.024;
    ankle.position.copy(hinge);
    web.position.copy(foot);
    web.rotation.z = Math.cos(phase) * 0.12;
  };
}

export function createPelican() {
  const palette = {
    cream: material('#fff1cd'), breast: material('#fff8e1'), wing: material('#decdb0'),
    wingLight: material('#f5e5c7'), featherBlue: material('#455b68'), featherInk: material('#233a49'),
    brass: material('#b97036', 0.36, 0.54), brassLight: material('#f6c27b', 0.33, 0.50),
    leather: material('#54382f', 0.82), eyeSurround: material('#f9cb8b'), eyeWhite: material('#fffaeb'),
    iris: material('#477578', 0.48), pupil: material('#132b33', 0.44),
    catchlight: new THREE.MeshBasicMaterial({ color: '#fffdf7' }),
    scarf: material('#e95442'), scarfLight: material('#ff8666'), scarfDark: material('#b73c36'),
    foot: material('#d68a49'), footLight: material('#e8a85d'), thigh: material('#d1a87e'),
  };
  const group = new THREE.Group();
  group.name = 'Pelican';
  const torso = new THREE.Group();
  group.add(torso);

  const body = ellipsoid(torso, palette.cream, [-0.253, 1.613, 0], [0.447, 0.314, 0.309]);
  body.rotation.z = 0.21;
  const breast = ellipsoid(torso, palette.breast, [-0.024, 1.687, 0], [0.265, 0.252, 0.236]);
  breast.rotation.z = 0.15;
  const neckRows = [
    [-0.17, 1.55, 0.032, 0.025], [-0.12, 1.73, 0.213, 0.205],
    [-0.026, 1.88, 0.185, 0.165], [-0.027, 2.01, 0.155, 0.150],
    [0.009, 2.13, 0.173, 0.154], [0.083, 2.26, 0.203, 0.186], [0.128, 2.35, 0.025, 0.028],
  ];
  mesh(torso, ringGeometry(neckRows, ([x, y, depth, width], angle) =>
    [x + Math.cos(angle) * depth, y, Math.sin(angle) * width]), palette.cream);

  for (let index = -2; index <= 2; index++) {
    const spread = Math.abs(index);
    feather(torso, spread % 2 ? palette.featherBlue : palette.featherInk,
      [-0.55, 1.595, index * 0.037], [-0.91 + spread * 0.045, 1.640 + spread * 0.014, index * 0.079],
      0.041, 0.035);
    feather(torso, palette.wingLight,
      [-0.52, 1.637, index * 0.045], [-0.79 + spread * 0.046, 1.665 + spread * 0.01, index * 0.075],
      0.047, 0.037);
  }

  const headPivot = new THREE.Group();
  headPivot.position.set(0.122, 2.255, 0);
  torso.add(headPivot);
  const head = new THREE.Group();
  head.position.copy(headPivot.position).negate();
  headPivot.add(head);
  ellipsoid(head, palette.cream, [0.127, 2.322, 0], [0.267, 0.244, 0.223]);
  ellipsoid(head, palette.breast, [0.224, 2.291, 0], [0.194, 0.181, 0.201]);
  for (let index = -1; index <= 1; index++) {
    feather(head, index === 0 ? palette.breast : palette.cream,
      [0.108 + index * 0.01, 2.515, index * 0.055],
      [-0.124 - index * 0.020, 2.608 - Math.abs(index) * 0.035, index * 0.069], 0.052, 0.034);
  }
  createBill(head);
  const eyes = goggles(head, palette);
  const scarf = createScarf(torso, palette);
  const wings = [-1, 1].map((side) => createWing(torso, group, palette, side));
  const feet = [-1, 1].map((side) => createFoot(group, palette, side));

  function update(time, crankAngle, motion = 0) {
    const energy = typeof motion === 'number' ? motion : (motion?.speed ?? 0);
    const bob = Math.sin(crankAngle * 2) * 0.019 + Math.sin(time * 2.4) * 0.007;
    torso.position.y = bob;
    headPivot.rotation.z = Math.sin(time * 2.0) * 0.026 - Math.sin(crankAngle * 2) * 0.014;
    headPivot.rotation.y = -0.045 + Math.sin(time * 0.88) * 0.043;
    const blink = Math.max(0, 1 - Math.abs((time + 0.80) % 4.9 - 4.63) / 0.105);
    for (const eye of eyes) eye.scale.y = 1 - blink * 0.94;
    for (const wing of wings) wing(time, bob);
    for (const foot of feet) foot(crankAngle, bob);
    scarf(time, Math.min(2, Math.max(0, energy)));
  }

  update(0, 0);
  return { group, update };
}
