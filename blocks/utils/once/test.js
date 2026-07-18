import { describe, it, expect } from '../../../test/test-harness.js';
import { once } from './index.js';

await describe('utils/once', async () => {
  await it('should execute sync function only once', () => {
    let count = 0;
    const run = once(() => {
      count++;
      return count * 10;
    });

    expect(run()).toBe(10);
    expect(run()).toBe(10);
    expect(count).toBe(1);
    expect(run.called).toBe(true);
  });

  await it('should preserve this binding from call site', () => {
    const obj = {
      value: 7,
      fn: once(function (x) {
        return this.value + x;
      })
    };

    expect(obj.fn(3)).toBe(10);
    expect(obj.fn(100)).toBe(10);
  });

  await it('should allow manual reset', () => {
    let count = 0;
    const run = once(() => ++count);

    expect(run()).toBe(1);
    run.reset();
    expect(run.called).toBe(false);
    expect(run()).toBe(2);
  });

  await it('should not cache sync throw and should allow retry', () => {
    let count = 0;
    const run = once(() => {
      count++;
      if (count === 1) throw new Error('fail-first');
      return 'ok';
    });

    expect(() => run()).toThrow('fail-first');
    expect(run.called).toBe(false);
    expect(run()).toBe('ok');
    expect(count).toBe(2);
  });

  await it('should not cache rejected promise and should allow retry', async () => {
    let count = 0;
    const run = once(async () => {
      count++;
      if (count === 1) throw new Error('reject-first');
      return 'ready';
    });

    await expect(() => run()).toThrowAsync('reject-first');
    expect(run.called).toBe(false);
    expect(await run()).toBe('ready');
    expect(count).toBe(2);
  });

  await it('should throw for non-function input', () => {
    expect(() => once(null)).toThrow('function');
  });
});
