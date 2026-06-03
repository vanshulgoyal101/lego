/**
 * Stream Windowed Aggregator
 * Computes metrics (sum, count, avg, min, max) over tumbling, sliding, or session windows.
 */

export class WindowedAggregator {
  /**
   * @param {Object} options
   * @param {string} [options.windowType] 'tumbling' | 'sliding' | 'session' (default: 'tumbling')
   * @param {number} [options.windowSizeMs] Window size for tumbling/sliding (default: 1000)
   * @param {number} [options.slideSizeMs] Slide step size for sliding (default: 500)
   * @param {number} [options.gapSizeMs] Inactivity gap for session windows (default: 2000)
   * @param {Function} [options.timeSelector] Extract timestamp (ms) from item
   * @param {Function} [options.valueSelector] Extract numeric value from item for aggregation
   * @param {Function} [options.aggregateFn] Custom aggregate reducer (acc, val) => newAcc
   */
  constructor(options = {}) {
    this.windowType = options.windowType || 'tumbling';
    this.windowSizeMs = options.windowSizeMs || 1000;
    this.slideSizeMs = options.slideSizeMs || 500;
    this.gapSizeMs = options.gapSizeMs || 2000;
    
    this.timeSelector = options.timeSelector || ((item) => {
      if (item && typeof item === 'object') {
        if (item.timestamp !== undefined) return new Date(item.timestamp).getTime();
        if (item.time !== undefined) return new Date(item.time).getTime();
      }
      return Date.now();
    });

    this.valueSelector = options.valueSelector || ((item) => {
      if (item && typeof item === 'object' && item.value !== undefined) {
        return Number(item.value);
      }
      return Number(item);
    });

    this.aggregateFn = options.aggregateFn || null;
  }

  /**
   * Aggregates an Iterable or AsyncIterable of elements into windows.
   * @param {Iterable|AsyncIterable} iterable
   * @returns {AsyncGenerator<Object>}
   */
  async *transform(iterable) {
    if (this.windowType === 'session') {
      yield* this._processSessionWindows(iterable);
    } else {
      yield* this._processFixedWindows(iterable);
    }
  }

  /**
   * Handles tumbling and sliding windows
   * @private
   */
  async *_processFixedWindows(iterable) {
    // Map of windowKey -> windowState: { start, end, values: [], items: [] }
    const activeWindows = new Map();
    let maxSeenTime = 0;

    for await (const item of iterable) {
      const timestamp = this.timeSelector(item);
      const val = this.valueSelector(item);
      maxSeenTime = Math.max(maxSeenTime, timestamp);

      const windowsForItem = this._getWindowsForItem(timestamp);

      for (const win of windowsForItem) {
        const key = `${win.start}-${win.end}`;
        if (!activeWindows.has(key)) {
          activeWindows.set(key, {
            start: win.start,
            end: win.end,
            values: [],
            items: []
          });
        }
        const state = activeWindows.get(key);
        state.values.push(val);
        state.items.push(item);
      }

      // Evict and yield windows that are fully in the past relative to maxSeenTime
      for (const [key, state] of activeWindows.entries()) {
        if (state.end <= maxSeenTime) {
          yield this._formatWindowResult(state);
          activeWindows.delete(key);
        }
      }
    }

    // Flush remaining windows sorted by start time
    const remaining = Array.from(activeWindows.values()).sort((a, b) => a.start - b.start);
    for (const state of remaining) {
      yield this._formatWindowResult(state);
    }
  }

  /**
   * Handles session windows (inactivity gap based)
   * @private
   */
  async *_processSessionWindows(iterable) {
    // Collect and sort items by time to ensure session windows group correctly
    const items = [];
    for await (const item of iterable) {
      items.push({
        time: this.timeSelector(item),
        val: this.valueSelector(item),
        raw: item
      });
    }

    if (items.length === 0) return;

    // Sort by timestamp
    items.sort((a, b) => a.time - b.time);

    let currentSession = {
      start: items[0].time,
      end: items[0].time,
      values: [items[0].val],
      items: [items[0].raw]
    };

    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      if (item.time - currentSession.end > this.gapSizeMs) {
        // Emit completed session window
        yield this._formatWindowResult(currentSession);
        // Start new session
        currentSession = {
          start: item.time,
          end: item.time,
          values: [item.val],
          items: [item.raw]
        };
      } else {
        // Extend session
        currentSession.end = Math.max(currentSession.end, item.time);
        currentSession.values.push(item.val);
        currentSession.items.push(item.raw);
      }
    }

    yield this._formatWindowResult(currentSession);
  }

  /**
   * @private
   */
  _getWindowsForItem(timestamp) {
    const list = [];
    if (this.windowType === 'tumbling') {
      const start = Math.floor(timestamp / this.windowSizeMs) * this.windowSizeMs;
      list.push({ start, end: start + this.windowSizeMs });
    } else if (this.windowType === 'sliding') {
      // Find all overlapping sliding windows
      const firstStart = Math.ceil((timestamp - this.windowSizeMs) / this.slideSizeMs) * this.slideSizeMs;
      const lastStart = Math.floor(timestamp / this.slideSizeMs) * this.slideSizeMs;

      for (let start = firstStart; start <= lastStart; start += this.slideSizeMs) {
        list.push({ start, end: start + this.windowSizeMs });
      }
    }
    return list;
  }

  /**
   * @private
   */
  _formatWindowResult(state) {
    const vals = state.values;
    const count = vals.length;
    let sum = 0;
    let min = count > 0 ? vals[0] : null;
    let max = count > 0 ? vals[0] : null;
    let custom = null;

    if (count > 0) {
      if (this.aggregateFn) {
        custom = vals.reduce((acc, curr) => this.aggregateFn(acc, curr));
      }
      for (const v of vals) {
        sum += v;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }

    return {
      window: {
        start: new Date(state.start).toISOString(),
        end: new Date(state.end).toISOString(),
        startMs: state.start,
        endMs: state.end
      },
      metrics: {
        count,
        sum,
        avg: count > 0 ? sum / count : 0,
        min,
        max,
        custom
      },
      items: state.items
    };
  }
}
