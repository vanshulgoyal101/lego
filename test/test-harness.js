// Shared Test Harness for Modular Lego Tests

export const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m'
};

export const stats = {
  passed: 0,
  failed: 0,
  suites: 0
};

export async function describe(suiteName, suiteFn) {
  console.log(`\n${Colors.bright}${Colors.cyan}● ${suiteName}${Colors.reset}`);
  stats.suites++;
  try {
    await suiteFn();
  } catch (err) {
    console.error(`${Colors.red}Suite level failure:${Colors.reset}`, err);
    stats.failed++;
  }
}

export async function it(testName, testFn) {
  try {
    await testFn();
    console.log(`  ${Colors.green}✓${Colors.reset} ${Colors.gray}${testName}${Colors.reset}`);
    stats.passed++;
  } catch (err) {
    console.error(`  ${Colors.red}✗ ${testName}${Colors.reset}`);
    console.error(`    ${Colors.red}Error: ${err.message}${Colors.reset}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(0, 3).map(l => '    ' + l).join('\n'));
    }
    stats.failed++;
  }
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual(expected) {
      function safeStringify(obj) {
        if (obj === null) return 'null';
        if (Array.isArray(obj)) {
          return '[' + obj.map(safeStringify).join(',') + ']';
        }
        if (typeof obj === 'object') {
          const keys = Object.keys(obj).sort();
          return '{' + keys.map(k => `${JSON.stringify(k)}:${safeStringify(obj[k])}`).join(',') + '}';
        }
        return JSON.stringify(obj);
      }
      const a = safeStringify(actual);
      const b = safeStringify(expected);
      if (a !== b) {
        throw new Error(`Expected ${b}, got ${a}`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be > ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be < ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be <= ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
      }
    },
    toBeCloseTo(expected, precision = 5) {
      const delta = Math.pow(10, -precision) / 2;
      if (Math.abs(actual - expected) >= delta) {
        throw new Error(`Expected ${actual} to be close to ${expected} (precision: ${precision})`);
      }
    },
    toContain(item) {
      if (!Array.isArray(actual) && typeof actual !== 'string') {
        throw new Error(`Expected array or string, got ${typeof actual}`);
      }
      if (!actual.includes(item)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
      }
    },
    toHaveLength(expectedLength) {
      if (actual == null || typeof actual.length !== 'number') {
        throw new Error(`Expected value with a length property, got ${typeof actual}`);
      }
      if (actual.length !== expectedLength) {
        throw new Error(`Expected length ${expectedLength}, got ${actual.length}`);
      }
    },
    toThrow(expectedErrorPattern = null) {
      let threw = false;
      let error = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        error = err;
      }
      if (!threw) {
        throw new Error('Expected function to throw, but it succeeded');
      }
      if (expectedErrorPattern && error && !error.message.includes(expectedErrorPattern)) {
        throw new Error(`Expected error to contain "${expectedErrorPattern}", but got "${error.message}"`);
      }
    },
    async toThrowAsync(expectedErrorPattern = null) {
      let threw = false;
      let error = null;
      try {
        await actual();
      } catch (err) {
        threw = true;
        error = err;
      }
      if (!threw) {
        throw new Error('Expected async function to throw, but it succeeded');
      }
      if (expectedErrorPattern && error && !error.message.includes(expectedErrorPattern)) {
        throw new Error(`Expected error to contain "${expectedErrorPattern}", but got "${error.message}"`);
      }
    }
  };
}
