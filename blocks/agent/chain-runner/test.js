import { describe, it, expect } from '../../../test/test-harness.js';
import { ChainRunner } from './index.js';

describe('ChainRunner - basic execution', () => {
  it('runs steps sequentially and threads context', async () => {
    const runner = new ChainRunner();
    runner.addStep('step1', async (ctx) => ({ ...ctx, a: 1 }));
    runner.addStep('step2', async (ctx) => ({ ...ctx, b: 2 }));
    const { ctx, trace } = await runner.run({});
    expect(ctx.a).toBe(1);
    expect(ctx.b).toBe(2);
    expect(trace.length).toBe(2);
  });

  it('returns correct trace statuses', async () => {
    const runner = new ChainRunner();
    runner.addStep('ok', async (ctx) => ctx);
    const { trace } = await runner.run({});
    expect(trace[0].status).toBe('success');
    expect(trace[0].name).toBe('ok');
  });

  it('getSteps returns step names in order', () => {
    const runner = new ChainRunner();
    runner.addStep('a', async (ctx) => ctx);
    runner.addStep('b', async (ctx) => ctx);
    expect(runner.getSteps()).toEqual(['a', 'b']);
  });
});

describe('ChainRunner - condition skipping', () => {
  it('skips step when condition returns false', async () => {
    const runner = new ChainRunner();
    runner.addStep('always', async (ctx) => ({ ...ctx, ran: true }));
    runner.addStep('skipped', async (ctx) => ({ ...ctx, skippedRan: true }), {
      condition: () => false,
    });
    const { ctx, trace } = await runner.run({});
    expect(ctx.ran).toBe(true);
    expect(ctx.skippedRan).toBe(undefined);
    expect(trace[1].status).toBe('skipped');
  });

  it('runs step when condition returns true', async () => {
    const runner = new ChainRunner();
    runner.addStep('conditional', async (ctx) => ({ ...ctx, ran: true }), {
      condition: (ctx) => ctx.flag === true,
    });
    const { ctx } = await runner.run({ flag: true });
    expect(ctx.ran).toBe(true);
  });
});

describe('ChainRunner - retry', () => {
  it('retries and succeeds on second attempt', async () => {
    let calls = 0;
    const runner = new ChainRunner();
    runner.addStep('flaky', async (ctx) => {
      calls++;
      if (calls < 2) throw new Error('fail');
      return { ...ctx, done: true };
    }, { retries: 1 });
    const { ctx } = await runner.run({});
    expect(ctx.done).toBe(true);
    expect(calls).toBe(2);
  });

  it('throws after exhausting retries when skipOnError is false', async () => {
    const runner = new ChainRunner();
    runner.addStep('always-fails', async () => { throw new Error('boom'); }, { retries: 0 });
    let threw = false;
    try { await runner.run({}); } catch { threw = true; }
    expect(threw).toBe(true);
  });

  it('continues when skipOnError is true', async () => {
    const runner = new ChainRunner();
    runner.addStep('fail', async () => { throw new Error('x'); }, { skipOnError: true });
    runner.addStep('after', async (ctx) => ({ ...ctx, after: true }));
    const { ctx, trace } = await runner.run({});
    expect(ctx.after).toBe(true);
    expect(trace[0].status).toBe('error');
    expect(trace[1].status).toBe('success');
  });
});

describe('ChainRunner - callbacks', () => {
  it('calls onStep after each step', async () => {
    const steps = [];
    const runner = new ChainRunner({ onStep: (s) => steps.push(s.name) });
    runner.addStep('x', async (ctx) => ctx);
    runner.addStep('y', async (ctx) => ctx);
    await runner.run({});
    expect(steps).toEqual(['x', 'y']);
  });

  it('calls onError on failure', async () => {
    const errs = [];
    const runner = new ChainRunner({ onError: (e) => errs.push(e.name) });
    runner.addStep('bad', async () => { throw new Error('!'); }, { skipOnError: true });
    await runner.run({});
    expect(errs.length).toBe(1);
    expect(errs[0]).toBe('bad');
  });
});
