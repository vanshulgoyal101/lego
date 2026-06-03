import { describe, it, expect } from '../../../test/test-harness.js';
import { extractJSON, validateSchema, parseStructured, ParseError } from './index.js';

describe('extractJSON', () => {
  it('parses clean JSON object', () => {
    const result = extractJSON('{"name":"Alice","age":30}');
    expect(result.name).toBe('Alice');
    expect(result.age).toBe(30);
  });

  it('extracts JSON from markdown code fence', () => {
    const result = extractJSON('```json\n{"key": "value"}\n```');
    expect(result.key).toBe('value');
  });

  it('extracts JSON from plain code fence', () => {
    const result = extractJSON('```\n{"x": 1}\n```');
    expect(result.x).toBe(1);
  });

  it('extracts JSON embedded in surrounding text', () => {
    const result = extractJSON('Here is the answer: {"score": 42} done.');
    expect(result.score).toBe(42);
  });

  it('parses JSON arrays', () => {
    const result = extractJSON('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('throws ParseError when no JSON found', () => {
    let threw = false;
    try { extractJSON('no json here'); } catch (e) {
      threw = true;
      expect(e instanceof ParseError).toBe(true);
      expect(e.raw).toBe('no json here');
    }
    expect(threw).toBe(true);
  });
});

describe('validateSchema', () => {
  it('validates required fields present', () => {
    const { valid } = validateSchema({ name: 'Bob' }, { required: ['name'] });
    expect(valid).toBe(true);
  });

  it('reports missing required field', () => {
    const { valid, errors } = validateSchema({}, { required: ['name'] });
    expect(valid).toBe(false);
    expect(errors.length).toBe(1);
  });

  it('validates type: string', () => {
    const { valid } = validateSchema({ x: 'hello' }, { properties: { x: { type: 'string' } } });
    expect(valid).toBe(true);
  });

  it('reports wrong type', () => {
    const { valid, errors } = validateSchema({ x: 42 }, { properties: { x: { type: 'string' } } });
    expect(valid).toBe(false);
    expect(errors[0].includes('"x"')).toBe(true);
  });

  it('validates enum values', () => {
    const schema = { properties: { color: { enum: ['red', 'blue'] } } };
    expect(validateSchema({ color: 'red' }, schema).valid).toBe(true);
    expect(validateSchema({ color: 'green' }, schema).valid).toBe(false);
  });

  it('validates minimum/maximum bounds', () => {
    const schema = { properties: { age: { type: 'number', minimum: 0, maximum: 150 } } };
    expect(validateSchema({ age: 25 }, schema).valid).toBe(true);
    expect(validateSchema({ age: -1 }, schema).valid).toBe(false);
    expect(validateSchema({ age: 200 }, schema).valid).toBe(false);
  });

  it('returns valid:true for no schema', () => {
    const { valid } = validateSchema({ x: 1 }, null);
    expect(valid).toBe(true);
  });
});

describe('parseStructured', () => {
  it('parses valid JSON with schema successfully', async () => {
    const schema = { required: ['name'], properties: { name: { type: 'string' } } };
    const result = await parseStructured('{"name": "Test"}', schema);
    expect(result.valid).toBe(true);
    expect(result.data.name).toBe('Test');
    expect(result.errors.length).toBe(0);
  });

  it('returns invalid when schema check fails', async () => {
    const schema = { required: ['score'], properties: { score: { type: 'number' } } };
    const result = await parseStructured('{"score": "notanumber"}', schema);
    expect(result.valid).toBe(false);
    expect(result.errors.length > 0).toBe(true);
  });

  it('throws ParseError on unparseable text with no retries', async () => {
    let threw = false;
    try { await parseStructured('not json at all', null); } catch (e) {
      threw = true;
      expect(e instanceof ParseError).toBe(true);
    }
    expect(threw).toBe(true);
  });
});
