import { Vector3 } from 'three';

const CAR_LENGTH = 2.34;
const CAR_WIDTH = 1.07;
const RIDER_LENGTH = 1.39;
const RIDER_WIDTH = 0.90;
const LOOK_AHEAD = 2.15;
const FOLLOWING_GAP = 1.15;
const BRAKING_DECELERATION = 5.8;

const fleet = [
  { fromStart: -12, direction: 1, speed: 8.5, style: 0 },
  { fromStart: 20, direction: -1, speed: 8.0, style: 1 },
  { fraction: 0.13, direction: 1, speed: 8.8, style: 2 },
  { fraction: 0.25, direction: -1, speed: 9.7, style: 3 },
  { fraction: 0.39, direction: 1, speed: 9.4, style: 1 },
  { fraction: 0.54, direction: -1, speed: 8.4, style: 2 },
  { fraction: 0.65, direction: 1, speed: 9.9, style: 3 },
  { fraction: 0.75, direction: -1, speed: 9.1, style: 0 },
  { fraction: 0.84, direction: 1, speed: 8.1, style: 1 },
];

const wrap = (value) => ((value % 1) + 1) % 1;

function body(halfLength, halfWidth) {
  return { position: new Vector3(), halfLength, halfWidth, forwardX: 1, forwardZ: 0, heading: 0 };
}

function setHeading(target, heading) {
  target.heading = heading;
  target.forwardX = Math.cos(heading);
  target.forwardZ = Math.sin(heading);
}

function projectedRadius(target, axisX, axisZ) {
  return target.halfLength * Math.abs(target.forwardX * axisX + target.forwardZ * axisZ)
    + target.halfWidth * Math.abs(target.forwardX * axisZ - target.forwardZ * axisX);
}

function impactTime(first, second, velocityX, velocityZ, horizon) {
  const offsetX = second.position.x - first.position.x;
  const offsetZ = second.position.z - first.position.z;
  let entry = 0;
  let exit = horizon;

  // The four face normals of the two rectangles bound the interval of overlap.
  for (let axis = 0; axis < 4; axis++) {
    const owner = axis < 2 ? first : second;
    const side = axis % 2;
    const axisX = side ? -owner.forwardZ : owner.forwardX;
    const axisZ = side ? owner.forwardX : owner.forwardZ;
    const separation = offsetX * axisX + offsetZ * axisZ;
    const radius = projectedRadius(first, axisX, axisZ) + projectedRadius(second, axisX, axisZ);
    const closing = velocityX * axisX + velocityZ * axisZ;
    if (closing === 0) {
      if (Math.abs(separation) >= radius) return Infinity;
      continue;
    }
    const boundaryA = (separation - radius) / closing;
    const boundaryB = (separation + radius) / closing;
    entry = Math.max(entry, Math.min(boundaryA, boundaryB));
    exit = Math.min(exit, Math.max(boundaryA, boundaryB));
    if (entry > exit) return Infinity;
  }
  return entry;
}

function overlaps(first, second) {
  return impactTime(first, second, 0, 0, 0) === 0;
}

function suggestedSpeed(first, second, speed, obstacleX, obstacleZ) {
  const obstacleSpeed = first.forwardX * obstacleX + first.forwardZ * obstacleZ;
  const closingSpeed = speed - obstacleSpeed;
  if (closingSpeed < 0.01) return speed;
  // Include the stopping gap at low speeds so neither road user creeps into it.
  const horizon = LOOK_AHEAD + FOLLOWING_GAP / closingSpeed;
  const predictedImpact = impactTime(first, second,
    first.forwardX * speed - obstacleX, first.forwardZ * speed - obstacleZ, horizon);
  if (predictedImpact === Infinity) return speed;

  const gap = Math.max(0, predictedImpact * closingSpeed - FOLLOWING_GAP);
  const safeClosing = Math.sqrt(2 * BRAKING_DECELERATION * gap);
  const preferred = obstacleSpeed < 0
    ? speed * Math.min(1, safeClosing / closingSpeed)
    : obstacleSpeed + safeClosing;
  return Math.min(speed, Math.max(0, preferred));
}

export function createTraffic(curve, roadWidth) {
  const length = curve.getLength();
  const laneOffset = roadWidth * 0.27;
  const tangent = new Vector3();
  const rider = body(RIDER_LENGTH, RIDER_WIDTH);
  const candidate = body(CAR_LENGTH, CAR_WIDTH);
  const result = { heading: 0, travel: 0, yielding: false };
  const cars = [];

  function putInLane(target, progress, direction) {
    curve.getPointAt(progress, target.position);
    curve.getTangentAt(progress, tangent);
    target.position.x -= tangent.z * direction * laneOffset;
    target.position.z += tangent.x * direction * laneOffset;
    setHeading(target, Math.atan2(tangent.z * direction, tangent.x * direction));
  }

  for (const specification of fleet) {
    const car = {
      ...body(CAR_LENGTH, CAR_WIDTH),
      style: specification.style,
      direction: specification.direction,
      progress: wrap(specification.fraction ?? specification.fromStart / length),
      cruiseSpeed: specification.speed,
      speed: specification.speed,
      velocityX: 0,
      velocityZ: 0,
      distance: 0,
      braking: false,
    };
    putInLane(car, car.progress, car.direction);
    let attempts = 0;
    while (cars.some((other) => overlaps(car, other)) && attempts < 20) {
      car.progress = wrap(car.progress + car.direction * 8 / length);
      putInLane(car, car.progress, car.direction);
      attempts += 1;
    }
    if (cars.some((other) => overlaps(car, other))) continue;
    car.velocityX = car.forwardX * car.speed;
    car.velocityZ = car.forwardZ * car.speed;
    cars.push(car);
  }

  function isClear(position, heading) {
    rider.position.copy(position);
    setHeading(rider, heading);
    return cars.every((car) => !overlaps(rider, car));
  }

  function limitTravel(state, heading, requestedTravel, dt) {
    result.heading = isClear(state.position, heading) ? heading : state.heading;
    setHeading(rider, result.heading);
    const requestedSpeed = requestedTravel / dt;
    let speed = requestedSpeed;
    for (const car of cars) {
      speed = Math.min(speed, suggestedSpeed(rider, car, requestedSpeed, car.velocityX, car.velocityZ));
    }

    let travel = speed * dt;
    let fraction = 1;
    for (const car of cars) {
      const entry = impactTime(rider, car, rider.forwardX * travel, rider.forwardZ * travel, 1);
      fraction = Math.min(fraction, Math.max(0, entry - 0.025));
    }
    travel *= fraction;
    // Check the rounded endpoint with the same coordinates the rider will use.
    rider.position.x += rider.forwardX * travel;
    rider.position.z += rider.forwardZ * travel;
    if (cars.some((car) => overlaps(rider, car))) travel = 0;
    result.travel = travel;
    result.yielding = travel < requestedTravel - dt * 0.02 || result.heading !== heading;
    return result;
  }

  function update(dt, riderState) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    const step = Math.min(dt, 0.1);
    if (riderState) {
      rider.position.copy(riderState.position);
      setHeading(rider, riderState.heading);
    }

    function canMove(car) {
      const x = candidate.position.x - car.position.x;
      const z = candidate.position.z - car.position.z;
      if (riderState && (overlaps(candidate, rider) || impactTime(car, rider, x, z, 1) !== Infinity)) {
        return false;
      }
      return cars.every((other) => other === car || (
        !overlaps(candidate, other) && impactTime(car, other, x, z, 1) === Infinity
      ));
    }

    for (const car of cars) {
      const requested = Math.min(car.cruiseSpeed, car.speed + 2.6 * step);
      let speed = requested;
      if (riderState) {
        speed = suggestedSpeed(car, rider, requested, rider.forwardX * riderState.speed, rider.forwardZ * riderState.speed);
      }
      for (const other of cars) {
        if (other === car) continue;
        speed = Math.min(speed, suggestedSpeed(car, other, requested, other.velocityX, other.velocityZ));
      }

      const progressChange = car.direction * speed * step / length;
      let progress = wrap(car.progress + progressChange);
      putInLane(candidate, progress, car.direction);
      if (!canMove(car)) {
        let lower = 0;
        let upper = 1;
        for (let search = 0; search < 10; search++) {
          const fraction = (lower + upper) / 2;
          progress = wrap(car.progress + progressChange * fraction);
          putInLane(candidate, progress, car.direction);
          if (canMove(car)) lower = fraction;
          else upper = fraction;
        }
        progress = wrap(car.progress + progressChange * lower);
        putInLane(candidate, progress, car.direction);
        speed *= lower;
      }
      const x = candidate.position.x - car.position.x;
      const z = candidate.position.z - car.position.z;
      car.distance += Math.hypot(x, z);
      car.velocityX = x / step;
      car.velocityZ = z / step;
      car.progress = progress;
      car.braking = speed < requested - 0.08 || speed < car.cruiseSpeed * 0.55;
      car.speed = speed;
      car.position.copy(candidate.position);
      setHeading(car, candidate.heading);
    }
  }

  return { cars, update, isClear, limitTravel };
}
