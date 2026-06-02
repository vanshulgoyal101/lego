import { describe, it, expect } from '../../../test/test-harness.js';
import {encode, decode} from './index.js';

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

    await it('should reject unsafe map keys during decode', () => {
      const payload = JSON.parse('{"__proto__":{"polluted":"yes"}}');
      const binary = encode(payload);
      expect(() => decode(binary)).toThrow('Unsafe MsgPack map key');
      expect({}.polluted).toBe(undefined);
    });
  });
