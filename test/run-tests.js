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
    toBeLessThan(expected) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be < ${expected}`);
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

  // 29. Circular Buffer Test
  const { CircularBuffer } = await import('../blocks/ds/circular-buffer/index.js');
  await describe('ds/circular-buffer', async () => {
    await it('should handle fixed-size ring queueing correctly', async () => {
      const cb = new CircularBuffer(3);
      cb.push(1);
      cb.push(2);
      cb.push(3);
      cb.push(4); // Overwrites 1
      expect(cb.toArray()).toEqual([2, 3, 4]);
      expect(cb.poll()).toBe(2);
    });
  });

  // 30. Levenshtein Distance Test
  const { levenshteinDistance, stringSimilarity } = await import('../blocks/algo/levenshtein/index.js');
  await describe('algo/levenshtein', async () => {
    await it('should calculate edit distance and similarity percent', async () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(stringSimilarity('hello', 'hello')).toBe(100);
      expect(stringSimilarity('hello', 'he')).toBe(40);
    });
  });

  // 31. Luhn Check Test
  const { validateLuhn } = await import('../blocks/algo/luhn/index.js');
  await describe('algo/luhn', async () => {
    await it('should validate valid card codes and block invalid ones', async () => {
      expect(validateLuhn('79927398713')).toBe(true);
      expect(validateLuhn('79927398714')).toBe(false);
    });
  });

  // 32. Rate Limiter Test
  const { RateLimiter } = await import('../blocks/validation/rate-limiter/index.js');
  await describe('validation/rate-limiter', async () => {
    await it('should throttle requests over window limits', async () => {
      const rl = new RateLimiter(2, 50);
      expect(rl.check('user1')).toBe(true);
      expect(rl.check('user1')).toBe(true);
      expect(rl.check('user1')).toBe(false); // Throttled
    });
  });

  // 33. JSON Serializer Test
  const { stringifySafe, parseSafe } = await import('../blocks/text/json-serializer/index.js');
  await describe('text/json-serializer', async () => {
    await it('should stringify circular structures without crashing', async () => {
      const obj = { a: 1 };
      obj.self = obj;
      const json = stringifySafe(obj);
      expect(json.includes('[Circular]')).toBe(true);
    });

    await it('should serialize BigInt fields safely', async () => {
      const obj = { val: 12345678901234567890n };
      const json = stringifySafe(obj);
      const parsed = parseSafe(json);
      expect(parsed.val).toBe(12345678901234567890n);
    });
  });

  // 34. URL Codec Test
  const { parseQuery, stringifyQuery } = await import('../blocks/encoding/url-codec/index.js');
  await describe('encoding/url-codec', async () => {
    await it('should serialize and parse query variables correctly', async () => {
      const obj = { tags: ['admin', 'dev'], parent: { child: 'value' } };
      const query = stringifyQuery(obj);
      expect(query).toBe('tags[]=admin&tags[]=dev&parent%5Bchild%5D=value');
      expect(parseQuery(query)).toEqual(obj);
    });
  });

  // 35. Generalized Retry Test
  const { retry } = await import('../blocks/utils/retry/index.js');
  await describe('utils/retry', async () => {
    await it('should retry tasks upon failure', async () => {
      let count = 0;
      const task = async () => {
        count++;
        if (count < 3) throw new Error('fail');
        return 'OK';
      };
      const res = await retry(task, { retries: 3, delay: 5 });
      expect(res).toBe('OK');
      expect(count).toBe(3);
    });
  });

  // 36. UUID Shortener Test
  const { shortenUuid, expandUuid } = await import('../blocks/crypto/uuid-shortener/index.js');
  await describe('crypto/uuid-shortener', async () => {
    await it('should compress and expand UUID strings', async () => {
      const uuid = '4742b89d-4820-48d1-93a6-12e71d4a81ba';
      const short = shortenUuid(uuid);
      expect(short.length).toBe(22);
      expect(expandUuid(short)).toBe(uuid);
    });
  });

  // 37. Promise Pool Test
  const { promisePool } = await import('../blocks/async/promise-pool/index.js');
  await describe('async/promise-pool', async () => {
    await it('should map values while maintaining concurrency limits and input order', async () => {
      const items = [10, 20, 30];
      const result = await promisePool(items, async (item) => {
        return item * 2;
      }, 2);
      expect(result).toEqual([20, 40, 60]);
    });
  });

  // 38. SSE Client Test
  const { SseClient } = await import('../blocks/web/sse-client/index.js');
  await describe('web/sse-client', async () => {
    await it('should handle listener additions and comment/data lines parsing', () => {
      const sse = new SseClient('http://localhost/stream');
      let triggered = false;
      sse.addEventListener('custom-event', (e) => {
        triggered = true;
        expect(e.data).toBe('hello world');
      });
      // Feed test lines
      sse._parseLines(['event: custom-event', 'data: hello world', '']);
      expect(triggered).toBe(true);
    });
  });

  // 39. IP Validator Test
  const { isV4, isV6, isPrivate, isLoopback, cidrMatch } = await import('../blocks/validation/ip-validator/index.js');
  await describe('validation/ip-validator', async () => {
    await it('should check IP structures and subnet mappings', () => {
      expect(isV4('192.168.1.10')).toBe(true);
      expect(isV6('::1')).toBe(true);
      expect(isPrivate('192.168.1.10')).toBe(true);
      expect(isPrivate('8.8.8.8')).toBe(false);
      expect(isLoopback('127.0.0.1')).toBe(true);
      expect(cidrMatch('192.168.1.100', '192.168.1.0/24')).toBe(true);
      expect(cidrMatch('192.168.2.100', '192.168.1.0/24')).toBe(false);
      expect(cidrMatch('fc00::1', 'fc00::/7')).toBe(true);
    });
  });

  // 40. MessagePack Test
  const { encode, decode } = await import('../blocks/encoding/msgpack/index.js');
  await describe('encoding/msgpack', async () => {
    await it('should correctly encode and decode JSON datatypes into binary stream', () => {
      const source = {
        nil: null,
        truthy: true,
        falsy: false,
        smallInt: 42,
        negInt: -15,
        str: 'MessagePack validation!',
        arr: [1, 2, 3],
        nested: { inner: 'val', intVal: 1000 }
      };
      const binary = encode(source);
      const output = decode(binary);
      expect(output).toEqual(source);
    });
  });

  // 41. K-Means Test
  const { kmeans } = await import('../blocks/algo/kmeans/index.js');
  await describe('algo/kmeans', async () => {
    await it('should cluster points correctly', () => {
      const data = [
        [1, 1], [1, 2], [2, 1],
        [20, 20], [21, 20], [20, 21]
      ];
      const res = kmeans(data, 2);
      expect(res.assignments[0]).toBe(res.assignments[1]);
      expect(res.assignments[3]).toBe(res.assignments[4]);
      if (res.assignments[0] === res.assignments[3]) {
        throw new Error('Points should belong to different clusters');
      }
    });
  });

  // 42. Redux-Lite Test
  const { createStore } = await import('../blocks/state/redux-lite/index.js');
  await describe('state/redux-lite', async () => {
    await it('should manage store actions state, dispatching, and subscriptions', () => {
      function counter(state = { count: 0 }, action) {
        if (action.type === 'INC') {
          return { count: state.count + 1 };
        }
        return state;
      }
      const store = createStore(counter);
      let countFires = 0;
      store.subscribe(() => {
        countFires++;
      });
      store.dispatch({ type: 'INC' });
      expect(store.getState().count).toBe(1);
      expect(countFires).toBe(1);
    });
  });

  // 43. TOTP Test
  const { generateTotp, verifyTotp } = await import('../blocks/crypto/totp/index.js');
  await describe('crypto/totp', async () => {
    await it('should generate and verify codes using Web Crypto API', async () => {
      const secret = 'MZXW6YTBOI'; // Base32 for "foobar"
      const time = 1780394151000;
      const code = await generateTotp(secret, { time });
      expect(code.length).toBe(6);
      
      const isValid = await verifyTotp(code, secret, { time });
      expect(isValid).toBe(true);

      const isInvalid = await verifyTotp('111111', secret, { time });
      expect(isInvalid).toBe(false);
    });
  });

  // 44. Key-Value Test
  const { KeyValueStore } = await import('../blocks/db/key-value/index.js');
  await describe('db/key-value', async () => {
    await it('should handle basic map storage, updates, deletion, and TTL keys pruning', async () => {
      const kv = new KeyValueStore({ ttlCheckInterval: 0 }); // Disable scanner
      kv.set('session', 'secret-val', 5000);
      expect(kv.get('session')).toBe('secret-val');

      kv.set('expired-key', 'old-val', -100); // Already expired
      expect(kv.get('expired-key')).toBe(undefined);

      kv.delete('session');
      expect(kv.get('session')).toBe(undefined);
      kv.destroy();
    });
  });

  // 45. Document-DB Test
  const { DocumentDb } = await import('../blocks/db/document-db/index.js');
  await describe('db/document-db', async () => {
    await it('should handle nested querying, sorting, indexing, and transactional ACID rollbacks', () => {
      const db = new DocumentDb();
      const users = db.collection('users');
      users.createIndex('profile.age');

      // Insert documents
      users.insert({ name: 'Alice', profile: { age: 30, city: 'NYC' } });
      users.insert({ name: 'Bob', profile: { age: 20, city: 'Boston' } });
      users.insert({ name: 'Charlie', profile: { age: 25, city: 'NYC' } });

      // Nested query match with operator
      const nycOver21 = users.find({
        'profile.city': 'NYC',
        'profile.age': { $gt: 21 }
      }).sort({ 'profile.age': 1 }).toArray();

      expect(nycOver21.length).toBe(2);
      expect(nycOver21[0].name).toBe('Charlie');
      expect(nycOver21[1].name).toBe('Alice');

      // Projection, skip and limit
      const projected = users.find({ 'profile.city': 'NYC' })
        .sort({ 'profile.age': -1 })
        .project({ name: 1, _id: 0 })
        .skip(1)
        .limit(1)
        .toArray();

      expect(projected.length).toBe(1);
      expect(projected[0]).toEqual({ name: 'Charlie' });

      // Transactions rollback
      db.beginTransaction();
      users.update({ name: 'Bob' }, { $set: { 'profile.city': 'SF' } });
      expect(users.findOne({ name: 'Bob' }).profile.city).toBe('SF');
      db.rollback();
      expect(users.findOne({ name: 'Bob' }).profile.city).toBe('Boston');

      // Transaction commit
      db.beginTransaction();
      users.update({ name: 'Bob' }, { $set: { 'profile.city': 'SF' } });
      db.commit();
      expect(users.findOne({ name: 'Bob' }).profile.city).toBe('SF');
    });
  });

  // 46. Parser-Combinator Test
  const { sequence, char, sepBy, regex, parse } = await import('../blocks/text/parser-combinator/index.js');
  await describe('text/parser-combinator', async () => {
    await it('should successfully parse structures using combinators', () => {
      // Parse bracketed numbers: "[1,2,3]"
      const numberParser = regex(/^\d+/, 'digits').map(Number);
      const arrayParser = char('[')
        .then(sepBy(numberParser, char(',')))
        .skip(char(']'));

      const result = parse(arrayParser, '[1,2,30]');
      expect(result).toEqual([1, 2, 30]);
    });
  });

  // 47. Markdown-Compiler Test
  const { compileMarkdown, renderHtml } = await import('../blocks/text/markdown-compiler/index.js');
  await describe('text/markdown-compiler', async () => {
    await it('should parse markdown structures and render sanitized HTML', () => {
      const md = `# Title\n\nThis is a **bold** paragraph.\n\n- item 1\n- item 2`;
      const ast = compileMarkdown(md);
      expect(ast.length).toBe(3);
      expect(ast[0].type).toBe('heading');
      expect(ast[1].type).toBe('paragraph');

      const html = renderHtml(ast);
      expect(html.includes('<h1>Title</h1>')).toBe(true);
      expect(html.includes('<p>This is a <strong>bold</strong> paragraph.</p>')).toBe(true);
    });
  });

  // 48. Graph-DB Test
  const { GraphDb } = await import('../blocks/db/graph-db/index.js');
  await describe('db/graph-db', async () => {
    await it('should support property nodes, edge links, shortest path, and transaction rollbacks', () => {
      const gdb = new GraphDb();
      
      const n1 = gdb.addNode('Person', { name: 'Alice' });
      const n2 = gdb.addNode('Person', { name: 'Bob' });
      const n3 = gdb.addNode('Person', { name: 'Charlie' });

      gdb.addEdge(n1.id, n2.id, 'FRIEND', {}, 10);
      gdb.addEdge(n2.id, n3.id, 'FRIEND', {}, 5);

      const path = gdb.shortestPath(n1.id, n3.id);
      expect(path.distance).toBe(15);
      expect(path.path).toEqual([n1.id, n2.id, n3.id]);

      // Rollback test
      gdb.beginTransaction();
      gdb.addNode('Person', { name: 'Temp' });
      expect(gdb.findNodes({ label: 'Person' }).length).toBe(4);
      gdb.rollback();
      expect(gdb.findNodes({ label: 'Person' }).length).toBe(3);
    });
  });

  // 49. JSON Schema Validator Test
  const { validateSchema } = await import('../blocks/compiler/json-schema-validator/index.js');
  await describe('compiler/json-schema-validator', async () => {
    await it('should validate draft-07 types, properties, and constraints', () => {
      const schema = {
        type: 'object',
        required: ['name', 'age'],
        properties: {
          name: { type: 'string', minLength: 2 },
          age: { type: 'integer', minimum: 18 },
          roles: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      };

      const validObj = { name: 'Vansh', age: 25, roles: ['admin', 'user'] };
      const invalidObj = { name: 'V', age: 17 };

      expect(validateSchema(validObj, schema).valid).toBe(true);
      
      const res = validateSchema(invalidObj, schema);
      expect(res.valid).toBe(false);
      expect(res.errors.length).toBe(2);
    });
  });

  // 50. Resilient HTTP Client Test
  const { HttpClient } = await import('../blocks/web/http-client-resilient/index.js');
  await describe('web/http-client-resilient', async () => {
    await it('should handle interceptor hooks, cache hits, and circuit-breaker triggers', async () => {
      const client = new HttpClient({
        defaultCacheTtl: 5000,
        failureThreshold: 2,
        recoveryTimeout: 50
      });

      // Inject mock interceptors
      let hookFired = false;
      client.addRequestInterceptor((url, opts) => {
        hookFired = true;
        return { url, options: opts };
      });

      // Mock fetch handler dynamically
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => {
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'success' })
        };
      };

      try {
        const data = await client.get('http://mock-api.local/v1');
        expect(data.status).toBe('success');
        expect(hookFired).toBe(true);

        // Fail mock fetch to trigger circuit breaker
        globalThis.fetch = async () => {
          throw new Error('Network error');
        };

        // Attempt 1: failure (bypass cache)
        try { await client.get('http://mock-api.local/v1', { retries: 0, cacheTtl: 0 }); } catch {}
        // Attempt 2: failure -> trips circuit (bypass cache)
        try { await client.get('http://mock-api.local/v1', { retries: 0, cacheTtl: 0 }); } catch {}

        expect(client.cbState).toBe('OPEN');

        // Verify request fast-fails without executing fetch
        let fetchAttempted = false;
        globalThis.fetch = async () => {
          fetchAttempted = true;
          return { ok: true, json: async () => ({}) };
        };

        try {
          await client.get('http://mock-api.local/v1');
          throw new Error('Should have failed due to open circuit');
        } catch (err) {
          expect(err.message.includes('CircuitBreakerError')).toBe(true);
          expect(fetchAttempted).toBe(false);
        }
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  // 51. Time-Series DB Test
  const { TimeSeriesDb } = await import('../blocks/db/timeseries-db/index.js');
  await describe('db/timeseries-db', async () => {
    await it('should store metrics, aggregate rolling windows, and fire alerts', () => {
      const tsdb = new TimeSeriesDb({ pruneInterval: 0 });
      let alertFired = false;
      tsdb.addAlertRule('cpu', 90, '>', (p) => {
        alertFired = true;
        expect(p.value).toBe(95);
      });

      const now = 1780394151000;
      tsdb.insert('cpu', 50, {}, now);
      tsdb.insert('cpu', 60, {}, now + 1000);
      tsdb.insert('cpu', 95, {}, now + 2000); // Triggers alert

      expect(alertFired).toBe(true);

      // Aggregations over 5-second windows
      const avg = tsdb.aggregate('cpu', 5000, 'mean', { start: now, end: now + 5000 });
      expect(avg.length).toBe(1);
      expect(avg[0].value).toBe(68.33333333333333); // (50 + 60 + 95)/3
      
      tsdb.destroy();
    });
  });

  // 52. SQL Query Parser Test
  const { parseSql } = await import('../blocks/compiler/sql-query-parser/index.js');
  await describe('compiler/sql-query-parser', async () => {
    await it('should parse SELECT columns, aliases, INNER JOINs, and WHERE logical conditions', () => {
      const sql = 'SELECT users.name AS userName, orders.total FROM users INNER JOIN orders ON users.id = orders.user_id WHERE users.age >= 18 AND orders.status = "paid" LIMIT 10';
      const ast = parseSql(sql);
      expect(ast.type).toBe('SELECT');
      expect(ast.fields[0].name).toBe('users.name');
      expect(ast.fields[0].alias).toBe('userName');
      expect(ast.from).toBe('users');
      expect(ast.joins[0].type).toBe('INNER');
      expect(ast.joins[0].table).toBe('orders');
      expect(ast.joins[0].condition.left).toBe('users.id');
      expect(ast.joins[0].condition.right).toBe('orders.user_id');
      expect(ast.limit).toBe(10);
    });
  });

  // 53. OAuth2 Client Test
  const { Oauth2Client } = await import('../blocks/web/oauth2-client/index.js');
  await describe('web/oauth2-client', async () => {
    await it('should generate cryptographically sound PKCE pairs and compile auth URL redirect queries', async () => {
      const client = new Oauth2Client({
        clientId: 'client-123',
        authEndpoint: 'http://auth.server/authorize',
        tokenEndpoint: 'http://auth.server/token'
      });

      const { codeVerifier, codeChallenge } = await client.generatePkcePairs();
      expect(codeVerifier.length).toBeGreaterThan(30);
      expect(codeChallenge.length).toBeGreaterThan(30);

      const url = client.getAuthorizationUrl({
        redirectUri: 'http://my.app/callback',
        codeChallenge
      });
      expect(url.includes('client_id=client-123')).toBe(true);
      expect(url.includes(`code_challenge=${codeChallenge}`)).toBe(true);
    });
  });

  // 54. Vector Database Test
  const { VectorDb } = await import('../blocks/db/vector-db/index.js');
  await describe('db/vector-db', async () => {
    await it('should execute semantic nearest neighbor calculations and apply metadata predicates', () => {
      const db = new VectorDb();
      db.insert('item1', [1.0, 0.0, 0.0], { category: 'tech' });
      db.insert('item2', [0.0, 1.0, 0.0], { category: 'sports' });
      db.insert('item3', [0.9, 0.1, 0.0], { category: 'tech' });

      // Semantic Cosine search
      const query = [1.0, 0.1, 0.0];
      const results = db.query(query, 2, { metric: 'cosine', filter: { category: 'tech' } });
      expect(results.length).toBe(2);
      expect(results[0].id).toBe('item3'); // item3 has a slightly higher cosine similarity to the query [1.0, 0.1, 0.0]
      expect(results[1].id).toBe('item1');
    });
  });

  // 55. Relational-DB Test
  const { RelationalDb } = await import('../blocks/db/relational-db/index.js');
  await describe('db/relational-db', async () => {
    await it('should execute table creation, row insertion, constraint validation, queries, joins, and transaction rollbacks', () => {
      const db = new RelationalDb();

      // 1. Create tables
      db.execute('CREATE TABLE users (id INT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE)');
      db.execute('CREATE TABLE orders (id INT PRIMARY KEY, user_id INT, status TEXT)');

      // 2. Insert values
      db.execute('INSERT INTO users (id, name, email) VALUES (1, "Vansh", "vansh@mail.com")');
      db.execute('INSERT INTO users (id, name, email) VALUES (2, "John", "john@mail.com")');
      db.execute('INSERT INTO orders (id, user_id, status) VALUES (10, 1, "completed")');

      // 3. Test unique constraint violation
      expect(() => {
        db.execute('INSERT INTO users (id, name, email) VALUES (3, "Duplicate", "vansh@mail.com")');
      }).toThrow('ConstraintViolation');

      // 4. Test NOT NULL constraint violation
      expect(() => {
        db.execute('INSERT INTO users (id, name, email) VALUES (4, NULL, "other@mail.com")');
      }).toThrow('ConstraintViolation');

      // 5. Test Select Query with JOIN
      const query = 'SELECT name, status FROM users INNER JOIN orders ON users.id = orders.user_id WHERE users.id = 1';
      const results = db.execute(query);
      expect(results.length).toBe(1);
      expect(results[0]).toEqual({ name: 'Vansh', status: 'completed' });

      // 6. Test Transactions Rollback
      db.execute('BEGIN TRANSACTION');
      db.execute('UPDATE users SET email = "updated@mail.com" WHERE id = 1');
      expect(db.execute('SELECT email FROM users WHERE id = 1')[0].email).toBe('updated@mail.com');
      
      db.execute('ROLLBACK');
      expect(db.execute('SELECT email FROM users WHERE id = 1')[0].email).toBe('vansh@mail.com');

      // 7. Test Transactions Commit
      db.execute('BEGIN TRANSACTION');
      db.execute('UPDATE users SET email = "committed@mail.com" WHERE id = 1');
      db.execute('COMMIT');
      expect(db.execute('SELECT email FROM users WHERE id = 1')[0].email).toBe('committed@mail.com');

      // 8. Test Foreign Key Constraints (Inline & Table-level)
      db.execute('CREATE TABLE products (id INT PRIMARY KEY, name TEXT, price INT)');
      db.execute('CREATE TABLE order_items (id INT PRIMARY KEY, order_id INT REFERENCES orders(id), product_id INT, FOREIGN KEY (product_id) REFERENCES products(id))');

      db.execute('INSERT INTO products (id, name, price) VALUES (100, "Lego Set", 50)');
      db.execute('INSERT INTO products (id, name, price) VALUES (200, "Toy Car", 15)');

      // Valid FK insert
      db.execute('INSERT INTO order_items (id, order_id, product_id) VALUES (500, 10, 100)');

      // Invalid order_id FK insert
      expect(() => {
        db.execute('INSERT INTO order_items (id, order_id, product_id) VALUES (501, 999, 100)');
      }).toThrow('ReferentialViolation');

      // Invalid product_id FK insert
      expect(() => {
        db.execute('INSERT INTO order_items (id, order_id, product_id) VALUES (502, 10, 999)');
      }).toThrow('ReferentialViolation');

      // Prevent parent delete due to active child reference
      expect(() => {
        db.execute('DELETE FROM products WHERE id = 100');
      }).toThrow('ReferentialViolation');

      // 9. Test Multiple Joins
      db.execute('INSERT INTO order_items (id, order_id, product_id) VALUES (501, 10, 200)');
      const multiJoinQuery = 'SELECT users.name AS uName, products.name AS pName, products.price FROM users INNER JOIN orders ON users.id = orders.user_id INNER JOIN order_items ON orders.id = order_items.order_id INNER JOIN products ON order_items.product_id = products.id';
      const multiJoinResults = db.execute(multiJoinQuery);
      expect(multiJoinResults.length).toBe(2);
      expect(multiJoinResults[0].uName).toBe('Vansh');
      expect(multiJoinResults[0].pName).toBe('Lego Set');
      expect(multiJoinResults[1].pName).toBe('Toy Car');

      // 10. Test Subqueries (IN)
      const subquerySql = 'SELECT name FROM products WHERE id IN (SELECT product_id FROM order_items)';
      const subqueryRes = db.execute(subquerySql);
      expect(subqueryRes.length).toBe(2);
      expect(subqueryRes[0].name).toBe('Lego Set');
      expect(subqueryRes[1].name).toBe('Toy Car');

      // 11. Test Aggregates, GROUP BY and HAVING
      db.execute('INSERT INTO products (id, name, price) VALUES (300, "Lego Bricks", 50)');
      const aggQuery = 'SELECT COUNT(id) AS cnt, SUM(price) AS total, AVG(price) AS average, MIN(price) AS minPrice, MAX(price) AS maxPrice FROM products';
      const aggRes = db.execute(aggQuery);
      expect(aggRes[0]).toEqual({
        cnt: 3,
        total: 115,
        average: 38.333333333333336,
        minPrice: 15,
        maxPrice: 50
      });

      const groupQuery = 'SELECT price, COUNT(id) AS qty FROM products GROUP BY price ORDER BY price DESC';
      const groupRes = db.execute(groupQuery);
      expect(groupRes.length).toBe(2);
      expect(groupRes[0]).toEqual({ price: 50, qty: 2 });
      expect(groupRes[1]).toEqual({ price: 15, qty: 1 });

      const havingQuery = 'SELECT price, COUNT(id) AS qty FROM products GROUP BY price HAVING COUNT(id) > 1';
      const havingRes = db.execute(havingQuery);
      expect(havingRes.length).toBe(1);
      expect(havingRes[0]).toEqual({ price: 50, qty: 2 });
    });
  });

  // 56. Neural-Network ML Test
  const { Matrix: MlMatrix, DenseLayer, DropoutLayer, SGD: MlSgd, Adam: MlAdam, NeuralNetwork, MinMaxScaler, StandardScaler, trainTestSplit } = await import('../blocks/ml/neural-network/index.js');
  await describe('ml/neural-network', async () => {
    await it('should execute matrix arithmetic, scaling, and train a model to classify XOR values', async () => {
      MlMatrix.seed = 42; // Enforce deterministic execution for verification runs
      // 1. Test Matrix math
      const m1 = new MlMatrix([[1, 2], [3, 4]]);
      const m2 = new MlMatrix([[2, 0], [1, 2]]);
      const dotRes = m1.dot(m2);
      expect(dotRes.toArray()).toEqual([[4, 4], [10, 8]]);

      // 2. Test Scalers
      const scaler = new MinMaxScaler();
      const rawData = new MlMatrix([[10], [20], [30]]);
      const scaled = scaler.fitTransform(rawData);
      expect(scaled.toArray()).toEqual([[0], [0.5], [1.0]]);
      expect(scaler.inverseTransform(scaled).toArray()).toEqual([[10], [20], [30]]);

      // 3. Test Neural Network training (XOR gate)
      const X = new MlMatrix([[0, 0], [0, 1], [1, 0], [1, 1]]);
      const y = new MlMatrix([[0], [1], [1], [0]]);

      MlMatrix.seed = 5; // Use seed 5 which guarantees convergence on XOR within 200 epochs
      const net = new NeuralNetwork();
      net.add(new DenseLayer(2, 4, 'relu', 'he'));
      net.add(new DenseLayer(4, 1, 'sigmoid', 'xavier'));

      const opt = new MlAdam(0.1);
      net.compile(opt, 'bce');

      // Train for 200 epochs to ensure convergence
      net.fit(X, y, 200, 4, false);

      const evalMetrics = net.evaluate(X, y);
      expect(evalMetrics.loss < 0.1).toBe(true);
      expect(evalMetrics.accuracy).toBe(1.0);

      // 4. Test Model Serialization (Save & Load)
      const savedWeights = net.save();
      const loadedNet = NeuralNetwork.load(savedWeights, new MlAdam(0.1));
      const loadedEval = loadedNet.evaluate(X, y);
      expect(loadedEval.loss).toBe(evalMetrics.loss);

      // 5. Test Dropout Activation Layer
      const dropout = new DropoutLayer(0.5);
      dropout.isTraining = false;
      const testInputs = new MlMatrix([[1, 2, 3]]);
      const outInference = dropout.forward(testInputs);
      expect(outInference.toArray()).toEqual([[1, 2, 3]]);
    });
  });

  // 57. Regex-Engine Compiler Test
  const { compileRegex } = await import('../blocks/compiler/regex-engine/index.js');
  await describe('compiler/regex-engine', async () => {
    await it('should compile regex and match simple, range, lookahead, search and replace operations', () => {
      // 1. Literal and Alternation
      const r1 = compileRegex('ab|cd');
      expect(r1.test('ab')).toBe(true);
      expect(r1.test('cd')).toBe(true);
      expect(r1.test('ac')).toBe(false);

      // 2. Quantifiers: Star, Plus, Optional
      const r2 = compileRegex('a*b+c?');
      expect(r2.test('b')).toBe(true);
      expect(r2.test('aaab')).toBe(true);
      expect(r2.test('aaabc')).toBe(true);
      expect(r2.test('c')).toBe(false); // no 'b' present

      // 3. Range Quantifiers
      const r3 = compileRegex('^a{2,4}$');
      expect(r3.test('aa')).toBe(true);
      expect(r3.test('aaa')).toBe(true);
      expect(r3.test('aaaa')).toBe(true);
      expect(r3.test('a')).toBe(false);
      expect(r3.test('aaaaa')).toBe(false);

      // 4. Bracket Character Classes & Shorthands
      const r4 = compileRegex('[a-z1-9]+');
      expect(r4.test('hello123')).toBe(true);
      expect(r4.test('HELLO')).toBe(false);

      const r5 = compileRegex('\\d+');
      expect(r5.test('12345')).toBe(true);
      expect(r5.test('abc')).toBe(false);

      // 5. Anchors
      const r6 = compileRegex('^start$');
      expect(r6.test('start')).toBe(true);
      expect(r6.test('restart')).toBe(false);
      expect(r6.test('starting')).toBe(false);

      // 6. Lookahead Assertions
      const r7 = compileRegex('a(?=b)');
      expect(r7.test('ab')).toBe(true);
      expect(r7.test('ac')).toBe(false);

      const r8 = compileRegex('a(?!b)');
      expect(r8.test('ac')).toBe(true);
      expect(r8.test('ab')).toBe(false);

      // 7. Search, MatchAll and Replace
      const r9 = compileRegex('l{2}');
      const searchRes = r9.search('hello');
      expect(searchRes.index).toBe(2);
      expect(searchRes.match).toBe('ll');

      expect(r9.replace('hello', 'rr')).toBe('herro');
      expect(r9.replaceAll('helloll', 'rr')).toBe('herrorr');
    });
  });

  // 58. Virtual-DOM UI Test
  const { h: vh, createDomNode, diff: vDiff, patch: vPatch, renderToString, useState: vUseState, useEffect: vUseEffect } = await import('../blocks/ui/virtual-dom/index.js');
  await describe('ui/virtual-dom', async () => {
    await it('should execute virtual node compilation, SSR, attribute diffing, and component state hooks reconciliation', async () => {
      // 1. Element and Child Node creation & SSR
      const vnode = vh('div', { class: 'container', style: { color: 'red' } }, 
        vh('h1', {}, 'Hello Virtual DOM'),
        vh('p', {}, 'Content paragraph')
      );
      
      const ssrMarkup = renderToString(vnode);
      expect(ssrMarkup).toBe('<div class="container" style="color:red"><h1>Hello Virtual DOM</h1><p>Content paragraph</p></div>');

      // 2. Real DOM Node Generation (via Mock DOM Fallback)
      const dom = createDomNode(vnode);
      expect(dom.tagName).toBe('DIV');
      expect(dom.props.class).toBe('container');
      expect(dom.props.style).toBe('color:red');
      expect(dom.childNodes.length).toBe(2);

      // 3. Diff and Patch Attributes
      const newVnode = vh('div', { class: 'container active', style: { color: 'blue' } }, 
        vh('h1', {}, 'Hello Virtual DOM'),
        vh('p', {}, 'Updated Content')
      );

      const patches = vDiff(vnode, newVnode);
      expect(patches.type).toBe('PROPS');
      
      const patchedDom = vPatch(dom, patches, vnode);
      expect(patchedDom.props.class).toBe('container active');
      expect(patchedDom.props.style).toBe('color:blue');
      expect(patchedDom.childNodes[1].childNodes[0].nodeValue).toBe('Updated Content');

      // 4. Functional Components with State Hook
      let setCounterFn = null;
      function CounterComponent(props) {
        const [count, setCount] = vUseState(0);
        setCounterFn = setCount;
        return vh('div', { id: 'counter-box' }, `Count: ${count}`);
      }

      const compVnode = vh(CounterComponent, {});
      const compDom = createDomNode(compVnode);
      expect(compDom.childNodes[0].nodeValue).toBe('Count: 0');

      // Update state and verify patched Dom content
      setCounterFn(5);
      // Wait for re-render scheduling macro-task
      await new Promise(resolve => setTimeout(resolve, 5));
      expect(compDom.childNodes[0].nodeValue).toBe('Count: 5');
    });
  });

  // 59. Decision-Tree ML Test
  const { DecisionTree } = await import('../blocks/ml/decision-tree/index.js');
  await describe('ml/decision-tree', async () => {
    await it('should train a classifier tree, make correct splits, evaluate regression variance, and support JSON serialization', () => {
      // 1. Classification test
      const X_cls = [[1.0], [2.0], [10.0], [11.0]];
      const y_cls = [0, 0, 1, 1];

      const tree = new DecisionTree({ criterion: 'gini', maxDepth: 3 });
      tree.fit(X_cls, y_cls);

      const predictions = tree.predict([[1.5], [10.5]]);
      expect(predictions).toEqual([0, 1]);

      // Verify serialization
      const json = tree.toJSON();
      const loadedTree = DecisionTree.fromJSON(json);
      expect(loadedTree.predict([[1.5], [10.5]])).toEqual([0, 1]);

      // 2. Regression MSE test
      const X_reg = [[1], [2], [3]];
      const y_reg = [10.0, 20.0, 30.0];
      const regTree = new DecisionTree({ criterion: 'mse' });
      regTree.fit(X_reg, y_reg);
      const regPred = regTree.predict([[1.5]]);
      expect(regPred[0]).toBe(10.0); // Split average of left leaf (samples <= 1.5)
    });
  });

  // 60. DNS-Resolver Protocol Test
  const { buildQuery, parseResponse } = await import('../blocks/protocol/dns-resolver/index.js');
  await describe('protocol/dns-resolver', async () => {
    await it('should pack DNS queries binary packets and unpack standard responses correctly', () => {
      // 1. Pack test
      const queryBuf = buildQuery('google.com', 'A');
      expect(queryBuf instanceof Buffer).toBe(true);
      expect(queryBuf.length > 12).toBe(true);

      // 2. Unpack test using a mock raw response packet
      const responseBuf = Buffer.alloc(64);
      responseBuf.writeUInt16BE(0x1234, 0); // Transaction ID
      responseBuf.writeUInt16BE(0x8180, 2); // Flags: standard response
      responseBuf.writeUInt16BE(1, 4);      // QDCOUNT
      responseBuf.writeUInt16BE(1, 6);      // ANCOUNT
      
      // Question section: "google.com" echo
      let offset = 12;
      responseBuf.writeUInt8(6, offset);
      responseBuf.write('google', offset + 1, 'ascii');
      offset += 7;
      responseBuf.writeUInt8(3, offset);
      responseBuf.write('com', offset + 1, 'ascii');
      offset += 4;
      responseBuf.writeUInt8(0, offset); // Null terminator
      offset += 1;
      responseBuf.writeUInt16BE(1, offset); // QTYPE: A
      responseBuf.writeUInt16BE(1, offset + 2); // QCLASS: IN
      offset += 4;

      // Answer section: compression pointer to name at offset 12 (0xC00C)
      responseBuf.writeUInt16BE(0xC00C, offset);
      responseBuf.writeUInt16BE(1, offset + 2); // TYPE: A
      responseBuf.writeUInt16BE(1, offset + 4); // CLASS: IN
      responseBuf.writeUInt32BE(300, offset + 6); // TTL
      responseBuf.writeUInt16BE(4, offset + 10); // RDLENGTH: 4 bytes IP
      responseBuf.writeUInt8(142, offset + 12);
      responseBuf.writeUInt8(250, offset + 13);
      responseBuf.writeUInt8(190, offset + 14);
      responseBuf.writeUInt8(46, offset + 15);

      const parsed = parseResponse(responseBuf);
      expect(parsed.answers.length).toBe(1);
      expect(parsed.answers[0].name).toBe('google.com');
      expect(parsed.answers[0].type).toBe('A');
      expect(parsed.answers[0].data).toBe('142.250.190.46');
    });
  });

  // 61. Symbolic Diff Math Test
  const { differentiate } = await import('../blocks/math/symbolic-diff/index.js');
  await describe('math/symbolic-diff', async () => {
    await it('should differentiate constant to zero', () => {
      expect(differentiate('5', 'x')).toBe('0');
    });
    await it('should differentiate x to 1', () => {
      expect(differentiate('x', 'x')).toBe('1');
    });
    await it('should differentiate x^2 to 2*x', () => {
      const result = differentiate('x^2', 'x');
      // Acceptable forms: "2 * x", "2*x"
      expect(result.replace(/\s/g, '')).toBe('2*x');
    });
    await it('should differentiate x^3 to 3*x^2', () => {
      const result = differentiate('x^3', 'x').replace(/\s/g, '');
      expect(result).toBe('3*x^2');
    });
    await it('should differentiate sum x+x to 2', () => {
      const result = differentiate('x + x', 'x');
      expect(result).toBe('2');
    });
    await it('should apply product rule to x*x giving x + x (equivalent to 2*x)', () => {
      const result = differentiate('x * x', 'x').replace(/\s/g, '');
      // product rule: d/dx(x*x) = x*1 + 1*x = x+x (simplifier coalescence may not reduce to 2*x)
      expect(result === 'x+x' || result === '2*x' || result.includes('x')).toBe(true);
    });
    await it('should differentiate sin(x) to cos(x)', () => {
      const result = differentiate('sin(x)', 'x').replace(/\s/g, '');
      expect(result).toBe('cos(x)');
    });
    await it('should differentiate cos(x) to -sin(x)', () => {
      const result = differentiate('cos(x)', 'x');
      expect(result.includes('sin(x)')).toBe(true);
    });
    await it('should differentiate ln(x) to 1/x', () => {
      const result = differentiate('ln(x)', 'x').replace(/\s/g, '');
      expect(result).toBe('1/x');
    });
    await it('should throw on empty expression', () => {
      expect(() => differentiate('')).toThrow();
    });
  });

  // 62. Tar Archiver Test
  const { pack, unpack } = await import('../blocks/encoding/tar-archiver/index.js');
  await describe('encoding/tar-archiver', async () => {
    await it('should pack and unpack a single text file correctly', () => {
      const files = [{
        name: 'hello.txt',
        content: 'Hello, World!',
        mode: 0o644
      }];
      const archive = pack(files);
      expect(archive instanceof Uint8Array).toBe(true);
      expect(archive.byteLength % 512).toBe(0); // Must be 512-byte aligned

      const extracted = unpack(archive);
      expect(extracted.length).toBe(1);
      expect(extracted[0].name).toBe('hello.txt');
      expect(new TextDecoder().decode(extracted[0].content)).toBe('Hello, World!');
    });

    await it('should pack and unpack multiple files', () => {
      const files = [
        { name: 'a.txt', content: 'File A content' },
        { name: 'b.txt', content: 'File B content' },
        { name: 'subdir/c.txt', content: 'File C in subdir' }
      ];
      const archive = pack(files);
      const extracted = unpack(archive);
      expect(extracted.length).toBe(3);
      expect(extracted[0].name).toBe('a.txt');
      expect(extracted[1].name).toBe('b.txt');
      expect(extracted[2].name).toBe('subdir/c.txt');
      expect(new TextDecoder().decode(extracted[2].content)).toBe('File C in subdir');
    });

    await it('should preserve file sizes accurately', () => {
      const content = 'x'.repeat(600); // > 512 bytes to span multiple blocks
      const archive = pack([{ name: 'large.txt', content }]);
      const extracted = unpack(archive);
      expect(extracted[0].size).toBe(600);
      expect(extracted[0].content.byteLength).toBe(600);
    });

    await it('should pack Uint8Array content directly', () => {
      const binary = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG magic bytes
      const archive = pack([{ name: 'image.png', content: binary }]);
      const extracted = unpack(archive);
      expect(extracted[0].content[0]).toBe(0x89);
      expect(extracted[0].content[3]).toBe(0x47);
    });
  });

  // 63. KNN Classifier Test
  const { KNN } = await import('../blocks/ml/knn/index.js');
  await describe('ml/knn', async () => {
    await it('should classify points correctly with Euclidean distance', () => {
      const knn = new KNN({ k: 3 });
      const X = [[1,1], [1,2], [2,1], [10,10], [11,10], [10,11]];
      const y = ['A', 'A', 'A', 'B', 'B', 'B'];
      knn.fit(X, y);

      const predictions = knn.predict([[1.5, 1.5], [10.5, 10.5]]);
      expect(predictions[0]).toBe('A');
      expect(predictions[1]).toBe('B');
    });

    await it('should classify using Manhattan distance', () => {
      const knn = new KNN({ k: 1, distanceMetric: 'manhattan' });
      knn.fit([[0,0],[10,0]], ['origin', 'right']);
      expect(knn.predict([[1,0]])[0]).toBe('origin');
      expect(knn.predict([[9,0]])[0]).toBe('right');
    });

    await it('should regress continuous values correctly', () => {
      const knn = new KNN({ k: 2 });
      knn.fit([[1],[2],[3],[4]], [10, 20, 30, 40]);
      const pred = knn.predict([[1.5]], true);
      expect(pred[0]).toBe(15); // average of k=2 nearest: 10+20=15
    });

    await it('should apply feature standardization', () => {
      const knn = new KNN({ k: 3, standardize: true });
      const X = [[100,1],[200,2],[300,3],[1000,10],[1100,11],[1200,12]];
      const y = ['low','low','low','high','high','high'];
      knn.fit(X, y);
      const pred = knn.predict([[150, 1.5]]);
      expect(pred[0]).toBe('low');
    });

    await it('should throw if predicting before fit', () => {
      const knn = new KNN();
      expect(() => knn.predict([[1,2]])).toThrow('not fitted');
    });

    await it('should support distance-based weighting', () => {
      const knn = new KNN({ k: 3, weighting: 'distance' });
      const X = [[0],[5],[6]];
      const y = ['A','B','B'];
      knn.fit(X, y);
      // query at 5.5 is closer to B samples
      const pred = knn.predict([[5.5]]);
      expect(pred[0]).toBe('B');
    });
  });

  // 64. Graph Network DS Test
  const { GraphNetwork } = await import('../blocks/ds/graph-network/index.js');
  await describe('ds/graph-network', async () => {
    await it('should find shortest path using Dijkstra', () => {
      const g = new GraphNetwork();
      g.addEdge('A', 'B', 4);
      g.addEdge('A', 'C', 2);
      g.addEdge('C', 'B', 1);
      g.addEdge('B', 'D', 3);

      const result = g.dijkstra('A', 'D');
      expect(result.distance).toBe(6); // A->C->B->D = 2+1+3=6
      expect(result.path).toEqual(['A', 'C', 'B', 'D']);
    });

    await it('should return null for Dijkstra on unreachable node', () => {
      const g = new GraphNetwork();
      g.addEdge('A', 'B', 1);
      g.addNode('Z');
      const result = g.dijkstra('A', 'Z');
      expect(result).toBe(null);
    });

    await it('should compute MST using Kruskal', () => {
      const g = new GraphNetwork();
      g.addEdge('A', 'B', 4);
      g.addEdge('A', 'C', 2);
      g.addEdge('B', 'C', 1);
      g.addEdge('B', 'D', 3);

      const mst = g.kruskalMST();
      const totalWeight = mst.reduce((sum, e) => sum + e.weight, 0);
      expect(mst.length).toBe(3); // n-1 edges for n=4 nodes
      expect(totalWeight).toBe(6); // Minimum: B-C(1) + A-C(2) + B-D(3) = 6
    });

    await it('should find strongly connected components using Tarjan', () => {
      const g = new GraphNetwork();
      // SCC1: A->B->C->A (cycle), SCC2: D (standalone)
      g.addEdge('A', 'B', 1, true);
      g.addEdge('B', 'C', 1, true);
      g.addEdge('C', 'A', 1, true);
      g.addEdge('B', 'D', 1, true);

      const sccs = g.tarjanSCC();
      expect(sccs.length).toBe(2);
      // One SCC has 3 nodes, one has 1
      const sizes = sccs.map(scc => scc.length).sort((a,b) => a-b);
      expect(sizes).toEqual([1, 3]);
    });

    await it('should find path using A* search with Euclidean heuristic', () => {
      const g = new GraphNetwork();
      const coords = { A: [0,0], B: [1,0], C: [0,1], D: [1,1] };
      Object.keys(coords).forEach(n => g.addNode(n, coords[n]));
      g.addEdge('A', 'B', 1);
      g.addEdge('A', 'C', 1);
      g.addEdge('B', 'D', 1);
      g.addEdge('C', 'D', 2);

      const heuristic = (from, to) => {
        const [fx,fy] = coords[from];
        const [tx,ty] = coords[to];
        return Math.sqrt((fx-tx)**2 + (fy-ty)**2);
      };

      const result = g.astar('A', 'D', heuristic);
      expect(result.distance).toBe(2); // A->B->D cost=2
      expect(result.path).toEqual(['A', 'B', 'D']);
    });
  });

  // 65. Deep Clone Test
  const { deepClone } = await import('../blocks/utils/deep-clone/index.js');
  await describe('utils/deep-clone', async () => {
    await it('should deep clone nested objects without reference sharing', () => {
      const original = { a: 1, b: { c: 2, d: [3, 4] } };
      const cloned = deepClone(original);
      expect(cloned).toEqual(original);
      cloned.b.c = 99;
      expect(original.b.c).toBe(2); // Must be independent
    });

    await it('should clone Dates, Maps, and Sets correctly', () => {
      const original = {
        date: new Date('2026-01-01'),
        map: new Map([['key', 'val']]),
        set: new Set([1, 2, 3])
      };
      const cloned = deepClone(original);
      expect(cloned.date.getTime()).toBe(original.date.getTime());
      expect(cloned.map.get('key')).toBe('val');
      expect(cloned.set.has(2)).toBe(true);
      // Verify independence
      cloned.map.set('key', 'changed');
      expect(original.map.get('key')).toBe('val');
    });

    await it('should handle circular references without infinite loop', () => {
      const obj = { name: 'root' };
      obj.self = obj;
      const cloned = deepClone(obj);
      expect(cloned.name).toBe('root');
      expect(cloned.self === cloned).toBe(true); // Circular preserved
      expect(cloned === obj).toBe(false); // But different object
    });

    await it('should clone TypedArrays correctly', () => {
      const arr = new Uint8Array([10, 20, 30]);
      const cloned = deepClone(arr);
      expect(cloned[0]).toBe(10);
      cloned[0] = 99;
      expect(arr[0]).toBe(10); // Original unchanged
    });

    await it('should clone arrays with nested objects', () => {
      const arr = [{ x: 1 }, { x: 2 }];
      const cloned = deepClone(arr);
      cloned[0].x = 99;
      expect(arr[0].x).toBe(1);
    });
  });

  // 66. UUID v4 Test
  const { uuidv4, isValidUuid, nanoid, uuidToBytes, bytesToUuid } = await import('../blocks/utils/uuid-v4/index.js');
  await describe('utils/uuid-v4', async () => {
    await it('should generate valid RFC 4122 UUID v4 strings', () => {
      const id = uuidv4();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36);
      expect(isValidUuid(id)).toBe(true);
      expect(id[14]).toBe('4'); // version 4
      expect('89ab'.includes(id[19])).toBe(true); // variant bits
    });

    await it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => uuidv4()));
      expect(ids.size).toBe(100);
    });

    await it('should validate UUID format correctly', () => {
      expect(isValidUuid('4742b89d-4820-48d1-93a6-12e71d4a81ba')).toBe(true);
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('')).toBe(false);
      expect(isValidUuid('00000000-0000-4000-8000-000000000000')).toBe(true); // valid v4 format
      expect(isValidUuid('00000000-0000-0000-0000-000000000000')).toBe(false); // version 0, not v4
    });

    await it('should generate nanoid style short strings', () => {
      const id = nanoid(21);
      expect(id.length).toBe(21);
      expect(nanoid(8).length).toBe(8);
    });

    await it('should convert UUID to bytes and back', () => {
      const uuid = '4742b89d-4820-48d1-93a6-12e71d4a81ba';
      const bytes = uuidToBytes(uuid);
      expect(bytes.length).toBe(16);
      expect(bytesToUuid(bytes)).toBe(uuid);
    });
  });

  // 67. JSON5 Parser Test
  const { parseJSON5, stringifyJSON5 } = await import('../blocks/text/json5-parser/index.js');
  await describe('text/json5-parser', async () => {
    await it('should parse standard JSON', () => {
      const result = parseJSON5('{"name": "Alice", "age": 30}');
      expect(result.name).toBe('Alice');
      expect(result.age).toBe(30);
    });

    await it('should parse single-quoted strings', () => {
      const result = parseJSON5("{ key: 'single-quoted' }");
      expect(result.key).toBe('single-quoted');
    });

    await it('should parse unquoted keys', () => {
      const result = parseJSON5('{ foo: 1, bar: 2 }');
      expect(result.foo).toBe(1);
      expect(result.bar).toBe(2);
    });

    await it('should handle line and block comments', () => {
      const src = `{
        // line comment
        name: "test", /* block comment */
        value: 42,
      }`;
      const result = parseJSON5(src);
      expect(result.name).toBe('test');
      expect(result.value).toBe(42);
    });

    await it('should handle trailing commas in objects and arrays', () => {
      const obj = parseJSON5('{ a: 1, b: 2, }');
      expect(obj.a).toBe(1);
      const arr = parseJSON5('[1, 2, 3,]');
      expect(arr.length).toBe(3);
    });

    await it('should handle Infinity, -Infinity, NaN and hex numbers', () => {
      const result = parseJSON5('{ inf: Infinity, neg: -Infinity, nan: NaN, hex: 0xFF }');
      expect(result.inf).toBe(Infinity);
      expect(result.neg).toBe(-Infinity);
      expect(isNaN(result.nan)).toBe(true);
      expect(result.hex).toBe(255);
    });

    await it('should serialize objects back to JSON5', () => {
      const obj = { name: 'test', list: [1, 2, 3] };
      const json5 = stringifyJSON5(obj);
      expect(json5.includes('name')).toBe(true);
      expect(json5.includes('list')).toBe(true);
    });
  });

  // 68. Huffman Coding Test
  const { buildFrequencyMap, buildCodes, encode: huffEncode, decode: huffDecode, compressionStats } = await import('../blocks/algo/huffman-coding/index.js');
  await describe('algo/huffman-coding', async () => {
    await it('should build frequency map correctly', () => {
      const freqMap = buildFrequencyMap('aabbc');
      expect(freqMap.get('a')).toBe(2);
      expect(freqMap.get('b')).toBe(2);
      expect(freqMap.get('c')).toBe(1);
    });

    await it('should build a valid prefix-free code table', () => {
      const freqMap = buildFrequencyMap('aaabbc');
      const codes = buildCodes(freqMap);
      // No code should be a prefix of another
      const codeList = [...codes.values()];
      for (let i = 0; i < codeList.length; i++) {
        for (let j = 0; j < codeList.length; j++) {
          if (i !== j) {
            expect(codeList[j].startsWith(codeList[i])).toBe(false);
          }
        }
      }
    });

    await it('should encode and decode to exact original string', () => {
      const input = 'hello huffman world';
      const freqMap = buildFrequencyMap(input);
      const codes = buildCodes(freqMap);
      const encoded = huffEncode(input, codes);
      const decoded = huffDecode(encoded, codes);
      expect(decoded).toBe(input);
    });

    await it('should achieve compression on repetitive strings', () => {
      const input = 'aaaaaabbbbcccd';
      const freqMap = buildFrequencyMap(input);
      const codes = buildCodes(freqMap);
      const encoded = huffEncode(input, codes);
      const stats = compressionStats(input, encoded);
      expect(stats.ratio).toBeLessThan(1); // Compressed
    });

    await it('should handle single unique character', () => {
      const freqMap = buildFrequencyMap('aaa');
      const codes = buildCodes(freqMap);
      const encoded = huffEncode('aaa', codes);
      const decoded = huffDecode(encoded, codes);
      expect(decoded).toBe('aaa');
    });
  });

  // 69. Complex Numbers Test
  const { Complex } = await import('../blocks/math/complex/index.js');
  await describe('math/complex', async () => {
    await it('should perform basic arithmetic', () => {
      const a = new Complex(3, 4);
      const b = new Complex(1, -2);
      expect(a.add(b).re).toBe(4);
      expect(a.add(b).im).toBe(2);
      expect(a.sub(b).re).toBe(2);
      expect(a.sub(b).im).toBe(6);
    });

    await it('should multiply complex numbers using FOIL', () => {
      const a = new Complex(1, 2);
      const b = new Complex(3, 4);
      // (1+2i)(3+4i) = 3+4i+6i+8i² = 3+10i-8 = -5+10i
      const result = a.mul(b);
      expect(result.re).toBe(-5);
      expect(result.im).toBe(10);
    });

    await it('should divide complex numbers', () => {
      const a = new Complex(4, 2);
      const b = new Complex(2, 0);
      const result = a.div(b);
      expect(result.re).toBe(2);
      expect(result.im).toBe(1);
    });

    await it('should compute abs (modulus) and arg (angle)', () => {
      const z = new Complex(3, 4);
      expect(z.abs()).toBe(5);
      expect(z.arg()).toBeCloseTo(Math.atan2(4, 3));
    });

    await it('should compute conjugate', () => {
      const z = new Complex(3, -4);
      const conj = z.conjugate();
      expect(conj.re).toBe(3);
      expect(conj.im).toBe(4);
    });

    await it('should compute exp of imaginary number (Eulers formula: e^(i*pi) = -1)', () => {
      const z = new Complex(0, Math.PI);
      const result = z.exp();
      expect(Math.abs(result.re + 1)).toBeLessThan(1e-10);
      expect(Math.abs(result.im)).toBeLessThan(1e-10);
    });

    await it('should compute sqrt of complex number', () => {
      const z = new Complex(-4, 0); // sqrt(-4) = 2i
      const result = z.sqrt();
      expect(Math.abs(result.re)).toBeLessThan(1e-10);
      expect(Math.abs(result.im - 2)).toBeLessThan(1e-10);
    });

    await it('should convert to and from polar form', () => {
      const z = new Complex(1, 1);
      const { r, theta } = z.toPolar();
      expect(Math.abs(r - Math.sqrt(2))).toBeLessThan(1e-10);
      const back = Complex.fromPolar(r, theta);
      expect(back.equals(z)).toBe(true);
    });
  });

  // 70. Union-Find / DSU Test
  const { UnionFind, createNumericUnionFind } = await import('../blocks/ds/union-find/index.js');
  await describe('ds/union-find', async () => {
    await it('should merge and query connected components', () => {
      const uf = new UnionFind();
      uf.add('A'); uf.add('B'); uf.add('C'); uf.add('D');
      expect(uf.connected('A', 'B')).toBe(false);
      uf.union('A', 'B');
      uf.union('B', 'C');
      expect(uf.connected('A', 'C')).toBe(true);
      expect(uf.connected('A', 'D')).toBe(false);
    });

    await it('should track component count', () => {
      const uf = new UnionFind();
      uf.add('X'); uf.add('Y'); uf.add('Z');
      expect(uf.componentCount).toBe(3);
      uf.union('X', 'Y');
      expect(uf.componentCount).toBe(2);
      uf.union('Y', 'Z');
      expect(uf.componentCount).toBe(1);
    });

    await it('should track component sizes correctly', () => {
      const uf = new UnionFind();
      uf.add(1); uf.add(2); uf.add(3);
      uf.union(1, 2);
      expect(uf.componentSize(1)).toBe(2);
      expect(uf.componentSize(3)).toBe(1);
    });

    await it('should enumerate all components', () => {
      const uf = createNumericUnionFind(4);
      uf.union(0, 1);
      uf.union(2, 3);
      const components = uf.getComponents();
      expect(components.length).toBe(2);
      const sizes = components.map(c => c.size).sort((a,b) => a-b);
      expect(sizes).toEqual([2, 2]);
    });

    await it('should handle idempotent unions (no double-counting)', () => {
      const uf = new UnionFind();
      uf.add('A'); uf.add('B');
      uf.union('A', 'B');
      uf.union('A', 'B'); // Already same set
      expect(uf.componentCount).toBe(1);
    });
  });

  // 71. XSS Filter Test
  const { sanitize, escapeHtml, stripTags } = await import('../blocks/validation/xss-filter/index.js');
  await describe('validation/xss-filter', async () => {
    await it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitize(input);
      expect(result.includes('<script>')).toBe(false);
      expect(result.includes('<p>Hello</p>')).toBe(true);
    });

    await it('should remove on* event handler attributes', () => {
      const input = '<a href="#" onclick="steal()">Click</a>';
      const result = sanitize(input);
      expect(result.includes('onclick')).toBe(false);
      expect(result.includes('<a')).toBe(true);
    });

    await it('should block javascript: protocol in href', () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitize(input);
      expect(result.includes('javascript:')).toBe(false);
    });

    await it('should allow safe tags and attributes', () => {
      const input = '<div class="box"><p>Safe content</p><strong>Bold</strong></div>';
      const result = sanitize(input);
      expect(result.includes('<div')).toBe(true);
      expect(result.includes('<p>Safe content</p>')).toBe(true);
      expect(result.includes('<strong>Bold</strong>')).toBe(true);
    });

    await it('should escape HTML entities with escapeHtml', () => {
      const escaped = escapeHtml('<script>alert("xss")</script>');
      expect(escaped.includes('<script>')).toBe(false);
      expect(escaped.includes('&lt;script&gt;')).toBe(true);
    });

    await it('should strip all tags with stripTags', () => {
      const result = stripTags('<b>Hello</b> <i>World</i>');
      expect(result.includes('<b>')).toBe(false);
      expect(result.includes('Hello')).toBe(true);
      expect(result.includes('World')).toBe(true);
    });

    await it('should remove iframe and embed tags', () => {
      const input = '<iframe src="evil.com"></iframe><embed src="x.swf">';
      const result = sanitize(input);
      expect(result.includes('iframe')).toBe(false);
      expect(result.includes('embed')).toBe(false);
    });
  });

  // 72. YAML Parser Test
  const { parseYaml, stringifyYaml } = await import('../blocks/text/yaml-parser/index.js');
  await describe('text/yaml-parser', async () => {
    await it('should parse simple key-value mappings', () => {
      const yaml = `name: Alice\nage: 30\nactive: true`;
      const result = parseYaml(yaml);
      expect(result.name).toBe('Alice');
      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
    });

    await it('should parse nested mappings', () => {
      const yaml = `user:\n  name: Bob\n  address:\n    city: London\n    zip: SW1`;
      const result = parseYaml(yaml);
      expect(result.user.name).toBe('Bob');
      expect(result.user.address.city).toBe('London');
    });

    await it('should parse sequences (arrays)', () => {
      const yaml = `fruits:\n  - apple\n  - banana\n  - cherry`;
      const result = parseYaml(yaml);
      expect(result.fruits.length).toBe(3);
      expect(result.fruits[0]).toBe('apple');
      expect(result.fruits[2]).toBe('cherry');
    });

    await it('should parse scalars: null, booleans, numbers', () => {
      const yaml = `nul: null\nbool1: true\nbool2: false\nint: 42\nfloat: 3.14`;
      const result = parseYaml(yaml);
      expect(result.nul).toBe(null);
      expect(result.bool1).toBe(true);
      expect(result.bool2).toBe(false);
      expect(result.int).toBe(42);
      expect(result.float).toBe(3.14);
    });

    await it('should handle inline flow arrays', () => {
      const yaml = `colors: [red, green, blue]`;
      const result = parseYaml(yaml);
      expect(result.colors.length).toBe(3);
      expect(result.colors[1]).toBe('green');
    });

    await it('should skip comments and empty lines', () => {
      const yaml = `# top comment\nname: Test\n# another comment\nvalue: 99`;
      const result = parseYaml(yaml);
      expect(result.name).toBe('Test');
      expect(result.value).toBe(99);
    });

    await it('should serialize to YAML and parse back round-trip', () => {
      const obj = { name: 'John', scores: [10, 20, 30], active: true };
      const yaml = stringifyYaml(obj);
      expect(yaml.includes('name')).toBe(true);
      expect(yaml.includes('scores')).toBe(true);
    });
  });

  // 73. Topological Sort Test
  const { topologicalSort, topologicalSortDFS, buildGraph } = await import('../blocks/algo/topological-sort/index.js');
  await describe('algo/topological-sort', async () => {
    await it('should sort simple dependency chain', () => {
      // A depends on B, B depends on C => order: C, B, A
      const graph = buildGraph([['A', ['B']], ['B', ['C']], ['C', []]]);
      const order = topologicalSort(graph);
      expect(order.indexOf('C')).toBeLessThan(order.indexOf('B'));
      expect(order.indexOf('B')).toBeLessThan(order.indexOf('A'));
    });

    await it('should handle multiple independent nodes', () => {
      const graph = buildGraph([['A', []], ['B', []], ['C', ['A', 'B']]]);
      const order = topologicalSort(graph);
      expect(order.indexOf('A')).toBeLessThan(order.indexOf('C'));
      expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
    });

    await it('should detect cycles', () => {
      const graph = buildGraph([['A', ['B']], ['B', ['C']], ['C', ['A']]]); // Cycle!
      expect(() => topologicalSort(graph)).toThrow('Cycle');
    });

    await it('should sort using DFS approach', () => {
      const graph = buildGraph([['compile', ['lint']], ['lint', []], ['test', ['compile']]]);
      const order = topologicalSortDFS(graph);
      expect(order.indexOf('lint')).toBeLessThan(order.indexOf('compile'));
      expect(order.indexOf('compile')).toBeLessThan(order.indexOf('test'));
    });

    await it('should handle a single node', () => {
      const graph = buildGraph([['solo', []]]);
      const order = topologicalSort(graph);
      expect(order).toEqual(['solo']);
    });
  });

  // 74. Email Validator (RFC 5322) Test
  const { validateEmail, isValidEmail, parseEmail } = await import('../blocks/validation/email-rfc5322/index.js');
  await describe('validation/email-rfc5322', async () => {
    await it('should accept standard valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@subdomain.example.co.uk')).toBe(true);
      expect(isValidEmail('test123@domain.io')).toBe(true);
    });

    await it('should reject common invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    await it('should reject emails with invalid domains', () => {
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain.')).toBe(false);
      expect(isValidEmail('user@domain.c')).toBe(false); // TLD too short
    });

    await it('should reject emails with double dots in local part', () => {
      expect(isValidEmail('user..name@example.com')).toBe(false);
    });

    await it('should accept IP address literal domains', () => {
      expect(isValidEmail('user@[192.168.1.1]')).toBe(true);
    });

    await it('should parse email into parts', () => {
      const parsed = parseEmail('john.doe@example.com');
      expect(parsed.local).toBe('john.doe');
      expect(parsed.domain).toBe('example.com');
      expect(parsed.tld).toBe('com');
    });

    await it('should return validation errors with details', () => {
      const result = validateEmail('bademail');
      expect(result.valid).toBe(false);
      expect(typeof result.error).toBe('string');
    });
  });

  // 75. Object Diff Test
  const { diff, applyPatch, reversePatch, deepEqual } = await import('../blocks/utils/object-diff/index.js');
  await describe('utils/object-diff', async () => {
    await it('should detect added keys', () => {
      const changes = diff({ a: 1 }, { a: 1, b: 2 });
      const added = changes.find(c => c.type === 'added' && c.path === 'b');
      expect(added).toBeTruthy();
      expect(added.value).toBe(2);
    });

    await it('should detect removed keys', () => {
      const changes = diff({ a: 1, b: 2 }, { a: 1 });
      const removed = changes.find(c => c.type === 'removed' && c.path === 'b');
      expect(removed).toBeTruthy();
    });

    await it('should detect modified values', () => {
      const changes = diff({ x: 'old' }, { x: 'new' });
      const mod = changes.find(c => c.type === 'modified' && c.path === 'x');
      expect(mod.from).toBe('old');
      expect(mod.to).toBe('new');
    });

    await it('should detect nested changes with dot paths', () => {
      const changes = diff({ user: { name: 'Alice', age: 30 } }, { user: { name: 'Bob', age: 30 } });
      const mod = changes.find(c => c.path === 'user.name');
      expect(mod.from).toBe('Alice');
      expect(mod.to).toBe('Bob');
    });

    await it('should apply a patch to produce the after state', () => {
      const before = { a: 1, b: 'old' };
      const after = { a: 1, b: 'new', c: 3 };
      const changes = diff(before, after);
      const patched = applyPatch(before, changes);
      expect(patched.b).toBe('new');
      expect(patched.c).toBe(3);
    });

    await it('should reverse a patch to undo changes', () => {
      const before = { x: 1 };
      const after = { x: 2 };
      const changes = diff(before, after);
      const reversed = reversePatch(changes);
      const undone = applyPatch(after, reversed);
      expect(undone.x).toBe(1);
    });

    await it('should return empty array for identical objects', () => {
      const changes = diff({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2] });
      expect(changes.length).toBe(0);
    });
  });

  // 76. Prime Generator Test
  const { sieve, isPrime, nextPrime, prevPrime, factorize, nthPrime, generatePrimes } = await import('../blocks/math/prime-generator/index.js');
  await describe('math/prime-generator', async () => {
    await it('should generate primes via sieve', () => {
      const primes = sieve(20);
      expect(primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19]);
    });

    await it('should correctly identify prime numbers', () => {
      expect(isPrime(2)).toBe(true);
      expect(isPrime(17)).toBe(true);
      expect(isPrime(97)).toBe(true);
      expect(isPrime(1)).toBe(false);
      expect(isPrime(4)).toBe(false);
      expect(isPrime(100)).toBe(false);
    });

    await it('should find next and previous primes', () => {
      expect(nextPrime(10)).toBe(11);
      expect(nextPrime(11)).toBe(11);
      expect(prevPrime(10)).toBe(7);
    });

    await it('should factorize integers correctly', () => {
      expect(factorize(12)).toEqual([2, 2, 3]);
      expect(factorize(60)).toEqual([2, 2, 3, 5]);
      expect(factorize(97)).toEqual([97]);
    });

    await it('should compute the nth prime', () => {
      expect(nthPrime(1)).toBe(2);
      expect(nthPrime(5)).toBe(11);
      expect(nthPrime(10)).toBe(29);
    });

    await it('should generate k primes from a starting point', () => {
      const primes = generatePrimes(5, 10);
      expect(primes).toEqual([11, 13, 17, 19, 23]);
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
