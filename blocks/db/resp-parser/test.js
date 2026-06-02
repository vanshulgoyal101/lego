import { describe, it, expect } from '../../../test/test-harness.js';
import { encode, RESPParser } from './index.js';

await describe('db/resp-parser', async () => {
  await it('should encode structures to valid RESP format', () => {
    expect(encode('PING')).toBe('$4\r\nPING\r\n');
    expect(encode(100)).toBe(':100\r\n');
    expect(encode(null)).toBe('$-1\r\n');
    expect(encode(new Error('ERR test'))).toBe('-ERR test\r\n');
    expect(encode(['GET', 'key'])).toBe('*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n');
  });

  await it('should parse RESP streams and return reconstructed data structures', () => {
    const parser = new RESPParser();

    // 1. Simple String
    let results = parser.parse('+OK\r\n');
    expect(results).toEqual(['OK']);

    // 2. Multi-frame & Integers
    results = parser.parse(':15\r\n-SOME ERROR\r\n');
    expect(results.length).toBe(2);
    expect(results[0]).toBe(15);
    expect(results[1] instanceof Error).toBe(true);
    expect(results[1].message).toBe('SOME ERROR');

    // 3. Streaming split frame
    results = parser.parse('*2\r\n$4\r\nLLEN\r\n');
    expect(results.length).toBe(0); // Incomplete
    results = parser.parse('$6\r\nmylist\r\n');
    expect(results.length).toBe(1);
    expect(results[0]).toEqual(['LLEN', 'mylist']);
  });
});
