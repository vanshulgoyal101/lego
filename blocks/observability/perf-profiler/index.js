/**
 * observability/perf-profiler
 *
 * High-resolution hierarchical performance profiler. Measures execution
 * durations of nested segments and exports flamegraph collapsed formats.
 */

function now() {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  if (typeof process !== 'undefined' && process.hrtime) {
    const hr = process.hrtime();
    return hr[0] * 1000 + hr[1] / 1000000;
  }
  return Date.now();
}

export class ProfileNode {
  constructor(name, parent = null) {
    this.name = name;
    this.parent = parent;
    this.startTime = now();
    this.endTime = null;
    this.durationMs = null;
    this.children = [];
  }

  end() {
    this.endTime = now();
    this.durationMs = this.endTime - this.startTime;
  }

  /**
   * Compute self time (total duration minus sum of children durations)
   * @returns {number}
   */
  getSelfTime() {
    if (this.durationMs === null) return 0;
    const childrenDuration = this.children.reduce((sum, child) => sum + (child.durationMs || 0), 0);
    return Math.max(0, this.durationMs - childrenDuration);
  }

  toJSON() {
    return {
      name: this.name,
      durationMs: this.durationMs,
      selfTimeMs: this.getSelfTime(),
      children: this.children.map(c => c.toJSON())
    };
  }
}

export class PerfProfiler {
  constructor() {
    this.roots = [];
    this.activeNode = null;
  }

  /**
   * Start a new profiling segment
   * @param {string} name - Name of the segment
   */
  start(name) {
    if (!name || typeof name !== 'string') {
      throw new TypeError('Segment name must be a non-empty string');
    }
    const node = new ProfileNode(name, this.activeNode);
    if (this.activeNode) {
      this.activeNode.children.push(node);
    } else {
      this.roots.push(node);
    }
    this.activeNode = node;
  }

  /**
   * End the current active profiling segment
   * @param {string} [name] - Optional segment name to verify accuracy.
   */
  end(name) {
    if (!this.activeNode) {
      throw new Error('No active profiling segment to end');
    }
    if (name && this.activeNode.name !== name) {
      throw new Error(`Profiler segment mismatch: expected to end "${this.activeNode.name}" but got "${name}"`);
    }
    
    this.activeNode.end();
    this.activeNode = this.activeNode.parent;
  }

  /**
   * Run a function and profile its execution
   * @param {string} name
   * @param {Function} fn
   * @returns {any} Result of fn
   */
  profile(name, fn) {
    this.start(name);
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res.then(
          val => { this.end(name); return val; },
          err => { this.end(name); throw err; }
        );
      }
      this.end(name);
      return res;
    } catch (err) {
      this.end(name);
      throw err;
    }
  }

  /**
   * Export the profile tree as JSON-serializable structure
   * @returns {object[]}
   */
  getProfile() {
    return this.roots.map(r => r.toJSON());
  }

  /**
   * Export in collapsed stack format (useful for Flamegraphs)
   * Format: frame1;frame2;frame3 duration_in_ms
   * @returns {string}
   */
  toFlamegraph() {
    const lines = [];

    const traverse = (node, path) => {
      const currentPath = path ? `${path};${node.name}` : node.name;
      const selfTime = node.getSelfTime();
      if (selfTime > 0) {
        lines.push(`${currentPath} ${selfTime.toFixed(3)}`);
      }
      for (const child of node.children) {
        traverse(child, currentPath);
      }
    };

    for (const root of this.roots) {
      traverse(root, '');
    }

    return lines.join('\n');
  }

  /**
   * Clear the collected profile trees
   */
  clear() {
    this.roots = [];
    this.activeNode = null;
  }
}
