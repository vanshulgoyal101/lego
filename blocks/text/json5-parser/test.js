import { describe, it, expect } from '../../../test/test-harness.js';
import {parseJSON5, stringifyJSON5} from './index.js';

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
