import { describe, it, expect } from '../../../test/test-harness.js';
import {stringifySafe, parseSafe} from './index.js';

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
