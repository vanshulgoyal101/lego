import { describe, it, expect } from '../../../test/test-harness.js';
import { PerfProfiler } from './index.js';

describe('observability/perf-profiler – PerfProfiler', () => {
  it('should profile nested segments and compute self/total times', async () => {
    const profiler = new PerfProfiler();
    
    profiler.start('main');
    await new Promise(r => setTimeout(r, 10));
    
    profiler.start('sub');
    await new Promise(r => setTimeout(r, 20));
    profiler.end('sub');
    
    await new Promise(r => setTimeout(r, 5));
    profiler.end('main');

    const tree = profiler.getProfile();
    expect(tree.length).toBe(1);
    expect(tree[0].name).toBe('main');
    expect(tree[0].durationMs >= 15).toBe(true);
    expect(tree[0].children.length).toBe(1);
    
    const subNode = tree[0].children[0];
    expect(subNode.name).toBe('sub');
    expect(subNode.durationMs >= 10).toBe(true);
    
    // Self-time should be total duration minus child duration
    expect(tree[0].selfTimeMs < tree[0].durationMs).toBe(true);
  });

  it('should support declarative profiling function wrapper', () => {
    const profiler = new PerfProfiler();
    const result = profiler.profile('calc', () => {
      let x = 0;
      for (let i = 0; i < 1000; i++) x += i;
      return x;
    });

    expect(result).toBe(499500);
    const tree = profiler.getProfile();
    expect(tree.length).toBe(1);
    expect(tree[0].name).toBe('calc');
    expect(tree[0].durationMs >= 0).toBe(true);
  });

  it('should support async profile mapping', async () => {
    const profiler = new PerfProfiler();
    const promise = profiler.profile('async-task', async () => {
      return new Promise(resolve => setTimeout(() => resolve('done'), 10));
    });

    const result = await promise;
    expect(result).toBe('done');
    const tree = profiler.getProfile();
    expect(tree[0].name).toBe('async-task');
    expect(tree[0].durationMs >= 5).toBe(true);
  });

  it('should export flamegraph formatted text', () => {
    const profiler = new PerfProfiler();
    profiler.start('root');
    profiler.start('child1');
    profiler.end('child1');
    profiler.start('child2');
    profiler.end('child2');
    profiler.end('root');

    const flame = profiler.toFlamegraph();
    expect(flame).toContain('root');
    expect(flame).toContain('root;child1');
    expect(flame).toContain('root;child2');
  });

  it('should throw on segment mismatch or when ending without starting', () => {
    const profiler = new PerfProfiler();
    let threwEmpty = false;
    try {
      profiler.end('none');
    } catch {
      threwEmpty = true;
    }
    expect(threwEmpty).toBe(true);

    profiler.start('first');
    let threwMismatch = false;
    try {
      profiler.end('wrong-name');
    } catch {
      threwMismatch = true;
    }
    expect(threwMismatch).toBe(true);
  });
});
