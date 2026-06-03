import { describe, it, expect } from '../../../test/test-harness.js';
import {sign, verify} from './index.js';

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

    await it('should throw when alg is not HS256', async () => {
      // Create a token manually with a none algorithm header
      const parts = (await sign({ id: 1 }, secret)).split('.');
      const header = JSON.parse(new TextDecoder().decode(new Uint8Array([
        ...[123, 34, 97, 108, 103, 34, 58, 34, 110, 111, 110, 101, 34, 125] // {"alg":"none"}
      ])));
      // base64url encode {"alg":"none"}
      const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const fakeToken = `${encodedHeader}.${parts[1]}.${parts[2]}`;
      await expect(async () => {
        await verify(fakeToken, secret);
      }).toThrowAsync('Unsupported or invalid algorithm');
    });

    await it('should throw when token is not active yet (nbf validation)', async () => {
      const futureNbf = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
      const token = await sign({ id: 1, nbf: futureNbf }, secret);
      await expect(async () => {
        await verify(token, secret);
      }).toThrowAsync('Token not active yet');
    });
  });
