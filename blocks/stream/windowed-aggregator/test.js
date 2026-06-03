import { describe, it, expect } from '../../../test/test-harness.js';
import { WindowedAggregator } from './index.js';

await describe('stream/windowed-aggregator', async () => {
  await it('should aggregate over tumbling windows correctly', async () => {
    const aggregator = new WindowedAggregator({
      windowType: 'tumbling',
      windowSizeMs: 1000,
      timeSelector: (item) => item.time,
      valueSelector: (item) => item.val
    });

    const data = [
      { time: 100, val: 5 },
      { time: 500, val: 15 },
      { time: 1200, val: 10 },
      { time: 1500, val: 20 },
      { time: 2100, val: 30 }
    ];

    const results = [];
    for await (const win of aggregator.transform(data)) {
      results.push(win);
    }

    expect(results.length).toBe(3);
    // Window 1: 0 to 1000
    expect(results[0].metrics.count).toBe(2);
    expect(results[0].metrics.sum).toBe(20);
    expect(results[0].metrics.avg).toBe(10);
    expect(results[0].metrics.min).toBe(5);
    expect(results[0].metrics.max).toBe(15);

    // Window 2: 1000 to 2000
    expect(results[1].metrics.sum).toBe(30);

    // Window 3: 2000 to 3000
    expect(results[2].metrics.sum).toBe(30);
  });

  await it('should aggregate over sliding windows correctly', async () => {
    const aggregator = new WindowedAggregator({
      windowType: 'sliding',
      windowSizeMs: 1000,
      slideSizeMs: 500,
      timeSelector: (item) => item.time,
      valueSelector: (item) => item.val
    });

    const data = [
      { time: 100, val: 10 },
      { time: 600, val: 20 }
    ];

    const results = [];
    for await (const win of aggregator.transform(data)) {
      results.push(win);
    }

    // Windows expected to cover these times:
    // Window starting -500 to 500: contains item at 100 (val: 10)
    // Window starting 0 to 1000: contains items at 100 and 600 (vals: 10, 20)
    // Window starting 500 to 1500: contains item at 600 (val: 20)
    expect(results.length).toBe(3);
    
    // Sort results by window startMs to inspect safely
    results.sort((a, b) => a.window.startMs - b.window.startMs);
    expect(results[0].metrics.sum).toBe(10); // [-500, 500)
    expect(results[1].metrics.sum).toBe(30); // [0, 1000)
    expect(results[2].metrics.sum).toBe(20); // [500, 1500)
  });

  await it('should aggregate over session windows correctly', async () => {
    const aggregator = new WindowedAggregator({
      windowType: 'session',
      gapSizeMs: 200,
      timeSelector: (item) => item.time,
      valueSelector: (item) => item.val
    });

    const data = [
      { time: 100, val: 1 },
      { time: 150, val: 2 },
      // Gap of 250ms (> 200ms)
      { time: 400, val: 3 },
      { time: 450, val: 4 }
    ];

    const results = [];
    for await (const win of aggregator.transform(data)) {
      results.push(win);
    }

    expect(results.length).toBe(2);
    expect(results[0].metrics.sum).toBe(3); // 1 + 2
    expect(results[1].metrics.sum).toBe(7); // 3 + 4
  });
});
