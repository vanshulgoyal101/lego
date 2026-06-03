import { describe, it, expect } from '../../../test/test-harness.js';
import { springStep } from './index.js';

await describe('ui/spring-physics', async () => {
  it('should step scalar spring values correctly towards target', () => {
    let state = { current: 0, velocity: 0 };
    const target = 100;
    
    // Perform 10 ticks
    for (let i = 0; i < 10; i++) {
      state = springStep({
        current: state.current,
        target,
        velocity: state.velocity,
        stiffness: 100,
        damping: 10,
        mass: 1,
        dt: 0.016
      });
    }

    // It should have moved closer to the target (100) from 0
    expect(state.current > 0).toBe(true);
    expect(state.current < 100).toBe(true);
    expect(state.velocity > 0).toBe(true);
  });

  it('should support array/vector inputs', () => {
    const start = [0, 10];
    const target = [100, 200];
    const velocity = [0, 0];

    const result = springStep({
      current: start,
      target,
      velocity,
      stiffness: 100,
      damping: 10,
      mass: 1,
      dt: 0.016
    });

    expect(result.current.length).toBe(2);
    expect(result.current[0] > 0).toBe(true);
    expect(result.current[1] > 10).toBe(true);
    expect(result.velocity[0] > 0).toBe(true);
  });
});
