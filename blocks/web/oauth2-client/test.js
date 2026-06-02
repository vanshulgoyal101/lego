import { describe, it, expect } from '../../../test/test-harness.js';
import {Oauth2Client} from './index.js';

  await describe('web/oauth2-client', async () => {
    await it('should generate cryptographically sound PKCE pairs and compile auth URL redirect queries', async () => {
      const client = new Oauth2Client({
        clientId: 'client-123',
        authEndpoint: 'http://auth.server/authorize',
        tokenEndpoint: 'http://auth.server/token'
      });

      const { codeVerifier, codeChallenge } = await client.generatePkcePairs();
      expect(codeVerifier.length).toBeGreaterThan(30);
      expect(codeChallenge.length).toBeGreaterThan(30);

      const url = client.getAuthorizationUrl({
        redirectUri: 'http://my.app/callback',
        codeChallenge
      });
      expect(url.includes('client_id=client-123')).toBe(true);
      expect(url.includes(`code_challenge=${codeChallenge}`)).toBe(true);
    });
  });
