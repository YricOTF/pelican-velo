import { Vector3 } from 'three';

const SECTOR_COUNT = 10;
const TOP_SPEED = 14.2;
const ROAD_SAMPLE_STEP = 0.36;
const STEER_RESPONSE = 10;
const TAU = Math.PI * 2;

const clamp = (value, low, high) => Math.max(low, Math.min(value, high));
const wrap = (value) => ((value % 1) + 1) % 1;
const angleDifference = (target, heading) => (target - heading + Math.PI + TAU) % TAU - Math.PI;

function readInput(value, low = 0) {
  return Number.isFinite(value) ? clamp(value, low, 1) : 0;
}

function sampleRoad(curve, length) {
  const pointCount = Math.max(128, Math.ceil(length / ROAD_SAMPLE_STEP));
  const points = Array.from({ length: pointCount }, (_, index) => curve.getPointAt(index / pointCount));
  return points.map((start, index) => {
    const end = points[(index + 1) % pointCount];
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const lengthSquared = dx * dx + dz * dz;
    return {
      start, end, dx, dz, lengthSquared,
      heading: Math.atan2(dz, dx),
      length: Math.sqrt(lengthSquared),
    };
  });
}

function projectOntoRoad(position, segments, projection) {
  let nearestDistanceSquared = Infinity;
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (segment.lengthSquared === 0) continue;
    const offsetX = position.x - segment.start.x;
    const offsetZ = position.z - segment.start.z;
    const along = clamp((offsetX * segment.dx + offsetZ * segment.dz) / segment.lengthSquared, 0, 1);
    const x = segment.start.x + along * segment.dx;
    const z = segment.start.z + along * segment.dz;
    const xDifference = position.x - x;
    const zDifference = position.z - z;
    const distanceSquared = xDifference * xDifference + zDifference * zDifference;
    if (distanceSquared >= nearestDistanceSquared) continue;
    nearestDistanceSquared = distanceSquared;
    projection.progress = wrap((index + along) / segments.length);
    projection.offset = (segment.dx * zDifference - segment.dz * xDifference) / segment.length;
    projection.heading = segment.heading;
    projection.y = segment.start.y + along * (segment.end.y - segment.start.y);
  }
  projection.distance = Math.sqrt(nearestDistanceSquared);
}

export function createRidePhysics(curve, roadWidth, traffic) {
  const length = curve.getLength();
  const halfWidth = roadWidth / 2;
  const segments = sampleRoad(curve, length);
  const state = {
    position: new Vector3(),
    heading: 0,
    speed: 0,
    steer: 0,
    offroad: false,
    yielding: false,
    progress: 0,
    trackHeading: 0,
    trackOffset: 0,
    laps: 0,
    elapsed: 0,
    lapTime: 0,
    lastLap: null,
    bestLap: null,
    distance: 0,
    respawns: 0,
    started: false,
  };
  const projection = { progress: 0, offset: 0, heading: 0, y: 0, distance: 0 };
  const lookAhead = new Vector3();
  const tangent = new Vector3();
  const spawn = new Vector3();
  const spawnOffsets = [0, -roadWidth * 0.065, roadWidth * 0.065, -roadWidth * 0.13, roadWidth * 0.13];
  let safeProgress = 0;
  let nextSector = 1;
  let lapStartedAt = 0;

  function placeOnRoad(progress) {
    state.speed = 0;
    state.steer = 0;
    state.yielding = false;

    for (let retreat = 0; retreat < length; retreat += 1.35) {
      const location = wrap(progress - retreat / length);
      curve.getPointAt(location, lookAhead);
      curve.getTangentAt(location, tangent);
      const heading = Math.atan2(tangent.z, tangent.x);
      for (const offset of spawnOffsets) {
        spawn.set(lookAhead.x - tangent.z * offset, lookAhead.y, lookAhead.z + tangent.x * offset);
        if (traffic && !traffic.isClear(spawn, heading)) continue;
        state.position.copy(spawn);
        state.heading = heading;
        state.trackHeading = heading;
        state.progress = location;
        state.trackOffset = offset;
        state.offroad = false;
        return;
      }
    }
  }

  function reset() {
    placeOnRoad(safeProgress);
    state.respawns += 1;
    return state;
  }

  function restart() {
    safeProgress = 0;
    nextSector = 1;
    lapStartedAt = 0;
    state.laps = 0;
    state.elapsed = 0;
    state.lapTime = 0;
    state.lastLap = null;
    state.bestLap = null;
    state.distance = 0;
    state.respawns = 0;
    state.started = false;
    placeOnRoad(0);
    return state;
  }

  function crossSectors(previous, travel, dt) {
    const progressChange = wrap(state.progress - previous + 0.5) - 0.5;
    const headingError = Math.abs(angleDifference(state.trackHeading, state.heading));
    // An abrupt projection jump can occur if the rider cuts across the island.
    if (progressChange <= 0 || progressChange * length > Math.max(0.8, travel * 3.4)
        || headingError >= Math.PI / 2 || projection.distance > halfWidth + 1.5) return;

    const distanceToSector = wrap(nextSector / SECTOR_COUNT - previous);
    if (distanceToSector > progressChange) return;
    if (nextSector < SECTOR_COUNT) {
      nextSector += 1;
      return;
    }

    const crossingTime = state.elapsed - (1 - distanceToSector / progressChange) * dt;
    const duration = crossingTime - lapStartedAt;
    state.laps += 1;
    state.lastLap = duration;
    state.bestLap = state.bestLap === null ? duration : Math.min(state.bestLap, duration);
    lapStartedAt = crossingTime;
    nextSector = 1;
  }

  function update(seconds, input = {}) {
    if (!Number.isFinite(seconds) || seconds <= 0) return state;
    const dt = Math.min(seconds, 0.1);
    const throttle = readInput(input.throttle);
    const brake = readInput(input.brake);
    const steering = readInput(input.steer, -1);
    const previousProgress = state.progress;
    state.steer += (steering - state.steer) * (1 - Math.exp(-STEER_RESPONSE * dt));

    if (throttle > 0.02) state.started = true;
    if (state.started) state.elapsed += dt;
    state.lapTime = state.elapsed - lapStartedAt;

    const pedalForce = throttle * (7.9 - state.speed * 0.39);
    const rollingResistance = 0.46 + state.speed * 0.11;
    const sandResistance = state.offroad ? 2.8 + state.speed * 0.36 : 0;
    const brakingForce = brake * (10.2 + state.speed * 0.25);
    const acceleration = pedalForce - rollingResistance - sandResistance - brakingForce;
    const speed = clamp(state.speed + acceleration * dt, 0, TOP_SPEED);
    const requestedTravel = speed * dt;
    const maneuvering = state.yielding && Math.abs(state.steer) > 0.05;
    if (requestedTravel === 0 && !maneuvering) {
      state.speed = 0;
      state.yielding = false;
      return state;
    }

    // Allow the rider to point the bike around a vehicle while yielding at a standstill.
    const steeringPower = Math.max(maneuvering ? 0.44 : 0, 1.82 * speed / (speed + 3.8));
    const lookAheadDistance = 2.8 + speed * 0.28;
    curve.getPointAt(wrap(state.progress + lookAheadDistance / length), lookAhead);
    const desiredHeading = Math.atan2(lookAhead.z - state.position.z, lookAhead.x - state.position.x);
    const roadError = angleDifference(desiredHeading, state.heading);
    const blending = clamp((speed - 2) / 7, 0, 1) * (1 - Math.min(1, Math.abs(state.steer) * 1.4));
    const ridingForward = Math.abs(angleDifference(state.trackHeading, state.heading)) < Math.PI * 0.55;
    const assist = ridingForward && !state.offroad ? clamp(roadError * 0.54, -0.29, 0.29) * blending : 0;
    const heading = angleDifference(state.heading + (steeringPower * state.steer + assist) * dt, 0);
    const movement = traffic?.limitTravel(state, heading, requestedTravel, dt);
    const travel = movement?.travel ?? requestedTravel;
    state.heading = movement?.heading ?? heading;
    state.yielding = movement?.yielding ?? false;
    state.speed = travel / dt;
    if (travel === 0) return state;
    state.position.x += Math.cos(state.heading) * travel;
    state.position.z += Math.sin(state.heading) * travel;
    state.distance += travel;

    projectOntoRoad(state.position, segments, projection);
    state.position.y = projection.y;
    state.trackHeading = projection.heading;
    state.trackOffset = projection.offset;
    state.progress = projection.progress;
    state.offroad = projection.distance > halfWidth;
    if (projection.distance < halfWidth * 0.66
        && Math.abs(angleDifference(state.trackHeading, state.heading)) < 1.1) {
      safeProgress = state.progress;
    }
    if (projection.distance > Math.max(11, halfWidth * 3.35)) return reset();
    crossSectors(previousProgress, travel, dt);
    state.lapTime = state.elapsed - lapStartedAt;
    return state;
  }

  restart();
  return { state, update, reset, restart };
}
