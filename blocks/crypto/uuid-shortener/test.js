import { describe, it, expect } from '../../../test/test-harness.js';
import {shortenUuid, expandUuid} from './index.js';

  await describe('crypto/uuid-shortener', async () => {
    await it('should compress and expand UUID strings', async () => {
      const uuid = '4742b89d-4820-48d1-93a6-12e71d4a81ba';
      const short = shortenUuid(uuid);
      expect(short.length).toBe(22);
      expect(expandUuid(short)).toBe(uuid);
    });
  });
