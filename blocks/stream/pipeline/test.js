import { describe, it, expect } from '../../../test/test-harness.js';
import { Pipeline } from './index.js';

await describe('stream/pipeline', async () => {
  await it('should run a simple pipeline with map and filter', async () => {
    const source = [1, 2, 3, 4, 5];
    const pipeline = new Pipeline(source)
      .map(x => x * 2)
      .filter(x => x > 5);

    const result = await pipeline.run();

    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
    expect(result.errorCount).toBe(0);
    expect(result.results).toEqual([6, 8, 10]);
  });

  await it('should tap side effects without modifying data', async () => {
    const source = ['a', 'b'];
    const tapped = [];
    const pipeline = new Pipeline(source)
      .tap(x => tapped.push(x))
      .map(x => x.toUpperCase());

    const result = await pipeline.run();

    expect(result.results).toEqual(['A', 'B']);
    expect(tapped).toEqual(['a', 'b']);
  });

  await it('should handle errors using the catch handler', async () => {
    const source = [1, 2, 3];
    const errors = [];
    const pipeline = new Pipeline(source)
      .map(x => {
        if (x === 2) throw new Error('Failed on 2');
        return x;
      })
      .catch((err, item) => {
        errors.push(err.message);
        return 'recovered';
      });

    const result = await pipeline.run();

    expect(result.success).toBe(false); // error occurred but was handled
    expect(result.errorCount).toBe(1);
    expect(result.results).toEqual([1, 'recovered', 3]);
    expect(errors).toEqual(['Failed on 2']);
  });

  await it('should execute custom generators', async () => {
    const source = [1, 2];
    const pipeline = new Pipeline(source)
      .transform(async function*(iterable) {
        for await (const x of iterable) {
          yield x;
          yield x * 10;
        }
      });

    const result = await pipeline.run();
    expect(result.results).toEqual([1, 10, 2, 20]);
  });
});
