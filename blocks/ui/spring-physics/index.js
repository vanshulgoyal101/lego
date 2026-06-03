/**
 * Simulates a single tick/step of a mass-spring-damper system.
 * Supporting target destination, stiffness, damping, mass, and velocity.
 * Can be called with either scalar numbers or arrays of numbers.
 *
 * @param {Object} params
 * @param {number|number[]} params.current - Current position(s).
 * @param {number|number[]} params.target - Target position(s).
 * @param {number|number[]} params.velocity - Current velocity/velocities.
 * @param {number} [params.stiffness=170] - Stiffness constant of the spring.
 * @param {number} [params.damping=26] - Damping/friction coefficient.
 * @param {number} [params.mass=1] - Mass of the moving object.
 * @param {number} [params.dt=0.016] - Time delta since last tick in seconds.
 * @returns {Object} { current, velocity } updated states.
 */
export function springStep({
  current,
  target,
  velocity,
  stiffness = 170,
  damping = 26,
  mass = 1,
  dt = 0.016
}) {
  if (Array.isArray(current)) {
    const targetArr = Array.isArray(target) ? target : [target];
    const velocityArr = Array.isArray(velocity) ? velocity : [velocity];
    
    const nextCurrent = [];
    const nextVelocity = [];

    for (let i = 0; i < current.length; i++) {
      const c = current[i];
      const t = targetArr[i] ?? 0;
      const v = velocityArr[i] ?? 0;

      const force = -stiffness * (c - t) - damping * v;
      const acceleration = force / mass;
      const nextV = v + acceleration * dt;
      const nextC = c + nextV * dt;

      nextCurrent.push(nextC);
      nextVelocity.push(nextV);
    }

    return { current: nextCurrent, velocity: nextVelocity };
  } else {
    const force = -stiffness * (current - target) - damping * velocity;
    const acceleration = force / mass;
    const nextVelocity = velocity + acceleration * dt;
    const nextCurrent = current + nextVelocity * dt;

    return { current: nextCurrent, velocity: nextVelocity };
  }
}
