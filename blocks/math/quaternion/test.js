import { describe, it, expect } from '../../../test/test-harness.js';
import { Quaternion } from './index.js';

await describe('math/quaternion', async () => {
  await it('should correctly compute quaternion multiplication', () => {
    const q1 = new Quaternion(1, 2, 3, 4);
    const q2 = new Quaternion(2, 3, 4, 5);

    const result = q1.multiply(q2);
    // Calculations:
    // w = 1*2 - 2*3 - 3*4 - 4*5 = 2 - 6 - 12 - 20 = -36
    // x = 1*3 + 2*2 + 3*5 - 4*4 = 3 + 4 + 15 - 16 = 6
    // y = 1*4 - 2*5 + 3*2 + 4*3 = 4 - 10 + 6 + 12 = 12
    // z = 1*5 + 2*4 - 3*3 + 4*2 = 5 + 8 - 9 + 8 = 12
    expect(result.w).toBe(-36);
    expect(result.x).toBe(6);
    expect(result.y).toBe(12);
    expect(result.z).toBe(12);
  });

  await it('should normalize a quaternion and find its norm', () => {
    const q = new Quaternion(0, 3, 4, 0);
    expect(q.norm()).toBe(5);

    const normQ = q.normalize();
    expect(normQ.w).toBe(0);
    expect(Math.abs(normQ.x - 0.6) < 1e-6).toBe(true);
    expect(Math.abs(normQ.y - 0.8) < 1e-6).toBe(true);
    expect(normQ.z).toBe(0);
    expect(Math.abs(normQ.norm() - 1.0) < 1e-6).toBe(true);
  });

  await it('should convert to and from Euler angles', () => {
    const yaw = 0.5; // Z
    const pitch = 0.2; // Y
    const roll = 0.1; // X

    const q = Quaternion.fromEuler(yaw, pitch, roll);
    const euler = q.toEuler();

    // Check round-trip within precision tolerance
    expect(Math.abs(euler.yaw - yaw) < 1e-6).toBe(true);
    expect(Math.abs(euler.pitch - pitch) < 1e-6).toBe(true);
    expect(Math.abs(euler.roll - roll) < 1e-6).toBe(true);
  });

  await it('should rotate vectors correctly', () => {
    // 90 degrees around Z axis
    const q = Quaternion.fromAxisAngle({ x: 0, y: 0, z: 1 }, Math.PI / 2);
    const v = { x: 1, y: 0, z: 0 };
    const rotated = q.rotateVector(v);

    // rotated vector should be { x: ~0, y: ~1, z: ~0 }
    expect(Math.abs(rotated.x) < 1e-6).toBe(true);
    expect(Math.abs(rotated.y - 1) < 1e-6).toBe(true);
    expect(Math.abs(rotated.z) < 1e-6).toBe(true);
  });

  await it('should slerp between two quaternions', () => {
    const q1 = new Quaternion(1, 0, 0, 0);
    const q2 = Quaternion.fromAxisAngle({ x: 0, y: 1, z: 0 }, Math.PI / 2); // 90 degrees around Y

    const mid = q1.slerp(q2, 0.5); // Should be 45 degrees around Y
    const expected = Quaternion.fromAxisAngle({ x: 0, y: 1, z: 0 }, Math.PI / 4);

    expect(Math.abs(mid.w - expected.w) < 1e-6).toBe(true);
    expect(Math.abs(mid.y - expected.y) < 1e-6).toBe(true);
  });
});
