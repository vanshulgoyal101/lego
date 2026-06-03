import { describe, it, expect } from '../../../test/test-harness.js';
import { ndjsonParser, jsonArrayParser } from './index.js';

await describe('stream/json-streamer', async () => {
  await it('should parse NDJSON stream', async () => {
    const chunks = ['{"id":1}\n{"id":2', '}\n\n{"id":3}\n'];
    
    const results = [];
    for await (const obj of ndjsonParser(chunks)) {
      results.push(obj);
    }

    expect(results).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 }
    ]);
  });

  await it('should parse JSON arrays streaming objects incrementally', async () => {
    const chunks = [
      '[',
      '{"id": 1, "name": "Alice"},',
      '{"id": 2, "name": "Bob", "nested": {"val": "}"}}',
      ']'
    ];

    const results = [];
    for await (const obj of jsonArrayParser(chunks)) {
      results.push(obj);
    }

    expect(results).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob', nested: { val: '}' } }
    ]);
  });

  await it('should handle escaped quotes in strings', async () => {
    const chunks = [
      '[',
      '{"text": "He said \\"hello\\""}',
      ']'
    ];

    const results = [];
    for await (const obj of jsonArrayParser(chunks)) {
      results.push(obj);
    }

    expect(results).toEqual([
      { text: 'He said "hello"' }
    ]);
  });
});
