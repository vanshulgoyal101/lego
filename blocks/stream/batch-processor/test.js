import { describe, it, expect } from '../../../test/test-harness.js';
import { BatchProcessor } from './index.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

await describe('stream/batch-processor', async () => {
  await it('should batch by count in push-mode', async () => {
    const batches = [];
    const processor = new BatchProcessor({
      maxBatchSize: 3,
      onBatch: (b) => batches.push(b)
    });

    await processor.push(1);
    await processor.push(2);
    expect(batches.length).toBe(0);

    await processor.push(3);
    expect(batches.length).toBe(1);
    expect(batches[0]).toEqual([1, 2, 3]);

    await processor.push(4);
    await processor.flush();
    expect(batches.length).toBe(2);
    expect(batches[1]).toEqual([4]);
  });

  await it('should batch by byte size in push-mode', async () => {
    const batches = [];
    const processor = new BatchProcessor({
      maxByteSize: 10,
      sizeFn: (x) => x.length,
      onBatch: (b) => batches.push(b)
    });

    await processor.push('abc'); // 3
    await processor.push('defgh'); // 5 -> total 8
    expect(batches.length).toBe(0);

    await processor.push('ij'); // 2 -> total 10 (exceeded/met limit)
    expect(batches.length).toBe(1);
    expect(batches[0]).toEqual(['abc', 'defgh', 'ij']);
  });

  await it('should batch by time duration', async () => {
    const batches = [];
    const processor = new BatchProcessor({
      maxTimeMs: 50,
      onBatch: (b) => batches.push(b)
    });

    await processor.push(1);
    expect(batches.length).toBe(0);

    await sleep(80);
    expect(batches.length).toBe(1);
    expect(batches[0]).toEqual([1]);
  });

  await it('should transform an async iterable into batches', async () => {
    const input = [1, 2, 3, 4, 5];
    const processor = new BatchProcessor({ maxBatchSize: 2 });
    
    const output = [];
    for await (const batch of processor.transform(input)) {
      output.push(batch);
    }

    expect(output).toEqual([[1, 2], [3, 4], [5]]);
  });
});
