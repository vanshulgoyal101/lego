import { describe, it, expect } from '../../../test/test-harness.js';
import {deepClone} from './index.js';

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
