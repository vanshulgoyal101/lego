import { describe, it, expect } from '../../../test/test-harness.js';
import {uuidv4, isValidUuid, nanoid, uuidToBytes, bytesToUuid} from './index.js';

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
