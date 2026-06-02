import fs from 'fs/promises';
import path from 'path';

// Define ANSI Colors
const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m'
};

const stats = {
  passed: 0,
  failed: 0,
  suites: 0
};

async function describe(suiteName, suiteFn) {
  console.log(`\n${Colors.bright}${Colors.cyan}● ${suiteName}${Colors.reset}`);
  stats.suites++;
  try {
    await suiteFn();
  } catch (err) {
    console.error(`${Colors.red}Suite level failure:${Colors.reset}`, err);
  }
}

async function it(testName, testFn) {
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

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) {
        throw new Error(`Expected ${b}, got ${a}`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be > ${expected}`);
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

async function runAllTests() {
  console.log(`\n${Colors.bright}${Colors.yellow}========================================`);
  console.log(`       RUNNING LEGO LIBRARY TESTS       `);
  console.log(`========================================${Colors.reset}`);

  // 1. Debounce Test
  const { debounce } = await import('../blocks/utils/debounce/index.js');
  await describe('utils/debounce', async () => {
    await it('should delay function execution', async () => {
      let counter = 0;
      const fn = debounce(() => { counter++; }, 20);
      fn();
      fn();
      expect(counter).toBe(0);
      await new Promise(resolve => setTimeout(resolve, 30));
      expect(counter).toBe(1);
    });

    await it('should fire immediately if configured', async () => {
      let counter = 0;
      const fn = debounce(() => { counter++; }, 20, { immediate: true });
      fn();
      expect(counter).toBe(1);
    });
  });

  // 2. Fetch Retry Test
  const { fetchRetry } = await import('../blocks/web/fetch-retry/index.js');
  await describe('web/fetch-retry', async () => {
    await it('should return mock response successfully', async () => {
      const mockFetch = async () => ({ ok: true, status: 200, text: async () => 'OK' });
      globalThis.fetch = mockFetch;
      const res = await fetchRetry('https://example.com');
      expect(res.status).toBe(200);
    });

    await it('should retry on server failure', async () => {
      let count = 0;
      const mockFetch = async () => {
        count++;
        if (count < 3) {
          return { ok: false, status: 500 };
        }
        return { ok: true, status: 200 };
      };
      globalThis.fetch = mockFetch;
      let retryTriggered = 0;
      await fetchRetry('https://example.com', {
        retries: 3,
        delay: 5,
        onRetry: () => { retryTriggered++; }
      });
      expect(retryTriggered).toBe(2);
    });
  });

  // 3. FSM Test
  const { StateMachine } = await import('../blocks/state/fsm/index.js');
  await describe('state/fsm', async () => {
    await it('should transition correctly', async () => {
      const fsm = new StateMachine({
        initial: 'off',
        states: {
          off: { on: { TOGGLE: 'on' } },
          on: { on: { TOGGLE: 'off' } }
        }
      });
      expect(fsm.getState()).toBe('off');
      fsm.transition('TOGGLE');
      expect(fsm.getState()).toBe('on');
    });

    await it('should block transitions with guards', async () => {
      const fsm = new StateMachine({
        initial: 'closed',
        context: { isLocked: true },
        states: {
          closed: {
            on: {
              OPEN: {
                target: 'open',
                guard: (ctx) => !ctx.isLocked
              }
            }
          },
          open: {}
        }
      });
      fsm.transition('OPEN');
      expect(fsm.getState()).toBe('closed');
    });
  });

  // 4. JSON DB Test
  const { JsonDatabase } = await import('../blocks/db/json-db/index.js');
  await describe('db/json-db', async () => {
    const dbFile = path.resolve('./temp-unit-db.json');
    
    await it('should insert and read data transactionally', async () => {
      await fs.unlink(dbFile).catch(() => {});
      const db = new JsonDatabase(dbFile);
      await db.insert('items', { val: 'A' });
      const items = await db.findMany('items');
      expect(items.length).toBe(1);
      expect(items[0].val).toBe('A');
    });

    await it('should handle JSON file corruption gracefully', async () => {
      await fs.writeFile(dbFile, '{invalid-json}', 'utf8');
      const db = new JsonDatabase(dbFile);
      const items = await db.findMany('items');
      expect(items).toEqual([]);
    });

    await it('cleanup DB file', async () => {
      await fs.unlink(dbFile).catch(() => {});
      const files = await fs.readdir('.');
      for (const file of files) {
        if (file.startsWith('temp-unit-db.json.')) {
          await fs.unlink(file).catch(() => {});
        }
      }
    });
  });

  // 5. JWT Helper Test
  const { sign, verify } = await import('../blocks/crypto/jwt-helper/index.js');
  await describe('crypto/jwt-helper', async () => {
    const secret = 'test-secret';
    await it('should sign and verify JWT payload without Node Buffer dependency', async () => {
      const token = await sign({ id: 1 }, secret);
      const payload = await verify(token, secret);
      expect(payload.id).toBe(1);
    });

    await it('should throw on invalid signature', async () => {
      const token = await sign({ id: 1 }, secret);
      const invalidToken = token + 'a';
      await expect(async () => {
        await verify(invalidToken, secret);
      }).toThrowAsync('Invalid signature');
    });
  });

  // 6. Cryptographic Hash Test
  const { sha256, hashPassword, verifyPassword } = await import('../blocks/crypto/hash/index.js');
  await describe('crypto/hash', async () => {
    await it('should generate SHA-256 string', async () => {
      const hash = await sha256('hello');
      expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    await it('should hash and verify passwords securely', async () => {
      const result = await hashPassword('my-password');
      const isValid = await verifyPassword('my-password', result.hash, result.salt);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrong-password', result.hash, result.salt);
      expect(isInvalid).toBe(false);
    });
  });

  // 7. Priority Queue Test
  const { PriorityQueue } = await import('../blocks/ds/priority-queue/index.js');
  await describe('ds/priority-queue', async () => {
    await it('should handle sorting values by weight priority', async () => {
      const pq = new PriorityQueue();
      pq.enqueue(10);
      pq.enqueue(3);
      pq.enqueue(7);
      expect(pq.dequeue()).toBe(3);
      expect(pq.dequeue()).toBe(7);
      expect(pq.dequeue()).toBe(10);
    });
  });

  // 8. Trie Test
  const { Trie } = await import('../blocks/ds/trie/index.js');
  await describe('ds/trie', async () => {
    await it('should support autocomplete checks', async () => {
      const trie = new Trie();
      trie.insert('cat');
      trie.insert('car');
      trie.insert('dog');
      expect(trie.startsWith('ca')).toBe(true);
      expect(trie.startsWith('do')).toBe(true);
      expect(trie.startsWith('co')).toBe(false);
      
      const suggestions = trie.autocomplete('ca').map(item => item.word);
      expect(suggestions.includes('cat')).toBe(true);
      expect(suggestions.includes('car')).toBe(true);
      expect(suggestions.includes('dog')).toBe(false);
    });
  });

  // 9. API Client Test
  const { ApiClient } = await import('../blocks/web/api-client/index.js');
  await describe('web/api-client', async () => {
    await it('should trigger request and response interceptors', async () => {
      const client = new ApiClient({ baseURL: 'https://test.com' });
      let reqTriggered = false;
      let resTriggered = false;

      client.addRequestInterceptor((options) => {
        reqTriggered = true;
        options.headers['X-Custom'] = '1';
        return options;
      });

      client.addResponseInterceptor((response) => {
        resTriggered = true;
        return response;
      });

      globalThis.fetch = async (url, opts) => {
        expect(opts.headers['X-Custom']).toBe('1');
        return { ok: true, status: 200 };
      };

      await client.get('/items');
      expect(reqTriggered).toBe(true);
      expect(resTriggered).toBe(true);
    });
  });

  // 10. Resilient WebSocket Test
  const { ResilientWebSocket } = await import('../blocks/web/websocket-client/index.js');
  await describe('web/websocket-client', async () => {
    await it('should buffer outgoing items while offline', async () => {
      class MockWS {
        constructor(url) {
          this.url = url;
          this.readyState = 0;
        }
      }
      const client = new ResilientWebSocket('ws://localhost:1234', { WebSocketClass: MockWS });
      client.connect();
      client.send('hello-buffered');
      expect(client.outboxBuffer.length).toBe(1);
      expect(client.outboxBuffer[0]).toBe('hello-buffered');
    });
  });

  // 11. Vector2D Test
  const { Vector2D } = await import('../blocks/math/vector2d/index.js');
  await describe('math/vector2d', async () => {
    await it('should perform vector mathematics correctly', async () => {
      const v1 = new Vector2D(3, 4);
      const v2 = new Vector2D(1, 2);
      expect(v1.magnitude()).toBe(5);
      expect(v1.add(v2)).toEqual(new Vector2D(4, 6));
      expect(v1.dot(v2)).toBe(11);
    });
  });

  // 12. Matrix Test
  const { Matrix } = await import('../blocks/math/matrix/index.js');
  await describe('math/matrix', async () => {
    await it('should calculate determinant and multiply matrices', async () => {
      const m1 = new Matrix([[1, 2], [3, 4]]);
      const m2 = new Matrix([[2, 0], [1, 2]]);
      expect(m1.determinant()).toBe(-2);
      expect(m1.multiply(m2)).toEqual(new Matrix([[4, 4], [10, 8]]));
    });
  });

  // 13. Semaphore Test
  const { Semaphore } = await import('../blocks/async/semaphore/index.js');
  await describe('async/semaphore', async () => {
    await it('should limit concurrency slots', async () => {
      const sem = new Semaphore(2);
      let count = 0;
      let maxActive = 0;
      const task = async () => {
        count++;
        if (count > maxActive) maxActive = count;
        await new Promise(resolve => setTimeout(resolve, 5));
        count--;
      };
      await Promise.all([sem.run(task), sem.run(task), sem.run(task)]);
      expect(maxActive).toBe(2);
    });
  });

  // 14. Event Emitter Test
  const { EventEmitter } = await import('../blocks/async/event-emitter/index.js');
  await describe('async/event-emitter', async () => {
    await it('should fire events and once events correctly', async () => {
      const em = new EventEmitter();
      let normalCount = 0;
      let onceCount = 0;

      const handler = () => { normalCount++; };
      em.on('evt', handler);
      em.once('evt', () => { onceCount++; });

      em.emit('evt');
      em.emit('evt');

      expect(normalCount).toBe(2);
      expect(onceCount).toBe(1);

      em.off('evt', handler);
      em.emit('evt');
      expect(normalCount).toBe(2);
    });
  });

  // 15. LRU Cache Test
  const { LruCache } = await import('../blocks/ds/lru-cache/index.js');
  await describe('ds/lru-cache', async () => {
    await it('should evict LRU items when size limit is exceeded', async () => {
      const cache = new LruCache(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      expect(cache.get('a')).toBe(undefined);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });
  });

  // 16. Bloom Filter Test
  const { BloomFilter } = await import('../blocks/ds/bloom-filter/index.js');
  await describe('ds/bloom-filter', async () => {
    await it('should estimate membership safely', async () => {
      const filter = new BloomFilter(100);
      filter.add('key');
      expect(filter.test('key')).toBe(true);
      expect(filter.test('non-key')).toBe(false);
    });
  });

  // 17. Markdown Parser Test
  const { parseMarkdown } = await import('../blocks/text/markdown-parser/index.js');
  await describe('text/markdown-parser', async () => {
    await it('should parse headings, inline bold, and links', async () => {
      const md = '# Header\nThis is **bold** text with a [link](https://ref.com)';
      const parsed = parseMarkdown(md);
      expect(parsed.includes('<h1>Header</h1>')).toBe(true);
      expect(parsed.includes('<strong>bold</strong>')).toBe(true);
      expect(parsed.includes('<a href="https://ref.com">link</a>')).toBe(true);
    });
  });

  // 18. CSV Parser Test
  const { parseCsv, stringifyCsv } = await import('../blocks/text/csv-parser/index.js');
  await describe('text/csv-parser', async () => {
    await it('should parse and serialize CSV content correctly', async () => {
      const csv = 'col1,col2\n"val,1",val2';
      const parsed = parseCsv(csv);
      expect(parsed[1][0]).toBe('val,1');
      expect(parsed[1][1]).toBe('val2');
      
      const stringified = stringifyCsv(parsed);
      expect(stringified.includes('"val,1"')).toBe(true);
    });
  });

  // 19. Color Converter Test
  const { hexToRgb, rgbToHex, getContrastRatio } = await import('../blocks/ui/color-converter/index.js');
  await describe('ui/color-converter', async () => {
    await it('should convert color channels and calculate W3C contrast', async () => {
      const rgb = hexToRgb('#ff0000');
      expect(rgb.r).toBe(255);
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      
      const contrast = getContrastRatio('#ffffff', '#000000');
      expect(contrast).toBe(21);
    });
  });

  // 20. Query Builder Test
  const { SqlQueryBuilder } = await import('../blocks/ui/query-builder/index.js');
  await describe('ui/query-builder', async () => {
    await it('should build SELECT strings with parameter bindings', async () => {
      const q = new SqlQueryBuilder('tbl')
        .select('c1', 'c2')
        .where('status', 'active')
        .build();
      expect(q.sql).toBe('SELECT c1, c2 FROM tbl WHERE status = ?');
      expect(q.values[0]).toBe('active');
    });
  });

  // 21. AES Encryption Test
  const { encrypt: aesEncrypt, decrypt: aesDecrypt } = await import('../blocks/crypto/aes/index.js');
  await describe('crypto/aes', async () => {
    await it('should encrypt and decrypt messages correctly', async () => {
      const secret = 'aes-shared-key';
      const cipher = await aesEncrypt('hello aes', secret);
      const plain = await aesDecrypt(cipher, secret);
      expect(plain).toBe('hello aes');
    });
  });

  // 22. JWT Validator Test
  const { validateJwtHeaders } = await import('../blocks/validation/jwt-validator/index.js');
  await describe('validation/jwt-validator', async () => {
    await it('should validate authorization Bearer headers', async () => {
      const token = await sign({ user: 'foo' }, 'secretKey');
      const payload = await validateJwtHeaders(`Bearer ${token}`, 'secretKey');
      expect(payload.user).toBe('foo');
    });
  });

  // 23. Binary Search Tree Test
  const { BinarySearchTree } = await import('../blocks/ds/binary-search-tree/index.js');
  await describe('ds/binary-search-tree', async () => {
    await it('should insert, find, delete and traverse values', async () => {
      const bst = new BinarySearchTree();
      bst.insert(15);
      bst.insert(10);
      bst.insert(20);
      expect(bst.find(10)).toBe(true);
      expect(bst.find(30)).toBe(false);
      
      bst.delete(10);
      expect(bst.find(10)).toBe(false);
      expect(bst.traverseInOrder()).toEqual([15, 20]);
    });
  });

  // 24. Sorting Algorithms Test
  const { quickSort, mergeSort } = await import('../blocks/algo/sorting/index.js');
  await describe('algo/sorting', async () => {
    await it('should sort arrays using QuickSort and MergeSort', async () => {
      const arr1 = [5, 2, 8, 1, 9];
      const sorted1 = quickSort(arr1);
      expect(sorted1).toEqual([1, 2, 5, 8, 9]);

      const arr2 = [10, -1, 3, 2];
      const sorted2 = mergeSort(arr2);
      expect(sorted2).toEqual([-1, 2, 3, 10]);
    });
  });

  // 25. Text Diffing Test
  const { diffLines } = await import('../blocks/text/diff-match/index.js');
  await describe('text/diff-match', async () => {
    await it('should calculate diff arrays for lines comparison', async () => {
      const text1 = 'hello\nworld';
      const text2 = 'hello\nthere\nworld';
      const diff = diffLines(text1, text2);
      expect(diff[1].type).toBe('added');
      expect(diff[1].value).toBe('there');
    });
  });

  // 26. Throttle Test
  const { throttle } = await import('../blocks/utils/throttle/index.js');
  await describe('utils/throttle', async () => {
    await it('should execute action at most once in a timeframe', async () => {
      let counter = 0;
      const fn = throttle(() => { counter++; }, 25);
      fn();
      fn();
      expect(counter).toBe(1);
      await new Promise(resolve => setTimeout(resolve, 30));
      fn();
      expect(counter).toBe(2);
    });
  });

  // 27. Memoize Test
  const { memoize } = await import('../blocks/utils/memoize/index.js');
  await describe('utils/memoize', async () => {
    await it('should retrieve cached outputs for same parameters', async () => {
      let counter = 0;
      const fn = memoize((x) => {
        counter++;
        return x * 2;
      });
      expect(fn(5)).toBe(10);
      expect(fn(5)).toBe(10);
      expect(counter).toBe(1); // Second call should be from cache
    });
  });

  // 28. Date Formatter Test
  const { formatDate, addTime, isBetween } = await import('../blocks/utils/date-formatter/index.js');
  await describe('utils/date-formatter', async () => {
    await it('should format, shift, and check date ranges', async () => {
      const date = new Date('2026-06-02T12:00:00.000Z');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-06-02');
      
      const newDate = addTime(date, 2, 'days');
      expect(formatDate(newDate, 'YYYY-MM-DD')).toBe('2026-06-04');

      expect(isBetween(date, '2026-06-01', '2026-06-03')).toBe(true);
    });
  });

  console.log(`\n${Colors.bright}${Colors.yellow}========================================`);
  console.log(`             TESTING COMPLETE            `);
  console.log(`========================================${Colors.reset}`);
  console.log(`  Total Suites: ${stats.suites}`);
  console.log(`  Passed Tests: ${Colors.green}${stats.passed}${Colors.reset}`);
  console.log(`  Failed Tests: ${stats.failed > 0 ? Colors.red : Colors.green}${stats.failed}${Colors.reset}`);
  console.log(`========================================\n`);

  if (stats.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Testing harness crashed:', err);
  process.exit(1);
});
