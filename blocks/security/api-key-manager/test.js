import { describe, it, expect } from '../../../test/test-harness.js';
import { generateAPIKey, hashAPIKey, verifyAPIKey, APIKeyManager } from './index.js';

describe('security/api-key-manager', () => {
  it('should generate secure api keys with prefix and verify them', () => {
    const { apiKey, hashedKey } = generateAPIKey({ prefix: 'sk_live_' });
    expect(apiKey.startsWith('sk_live_')).toBe(true);
    expect(hashedKey).toBe(hashAPIKey(apiKey));
    expect(verifyAPIKey(apiKey, hashedKey)).toBe(true);
    expect(verifyAPIKey('wrong_key', hashedKey)).toBe(false);
  });

  it('should create key records with metadata', () => {
    const manager = new APIKeyManager();
    const { apiKey, keyRecord } = manager.createKey({
      prefix: 'test_',
      metadata: { role: 'admin' }
    });

    expect(keyRecord.prefix).toBe('test_');
    expect(keyRecord.metadata.role).toBe('admin');
    expect(keyRecord.revoked).toBe(false);

    const authRecord = manager.authenticate(apiKey);
    expect(authRecord).toBeTruthy();
    expect(authRecord.id).toBe(keyRecord.id);
    expect(authRecord.lastUsedAt).toBeTruthy();
  });

  it('should handle revocation and expiration', async () => {
    const manager = new APIKeyManager();
    const { apiKey, keyRecord } = manager.createKey({
      expiresInMs: 10
    });

    // Revocation
    manager.revokeKey(keyRecord.id);
    expect(manager.authenticate(apiKey)).toBe(null);

    // Create another key with expiration
    const key2 = manager.createKey({
      expiresInMs: 5
    });
    expect(manager.authenticate(key2.apiKey)).toBeTruthy();

    await new Promise(resolve => setTimeout(resolve, 10));
    expect(manager.authenticate(key2.apiKey)).toBe(null);
  });

  it('should rotate keys and manage grace periods', async () => {
    const manager = new APIKeyManager();
    const original = manager.createKey({ prefix: 'rot_' });
    
    // Rotate key with a grace period of 20ms
    const rotated = manager.rotateKey(original.keyRecord.id, { gracePeriodMs: 20 });
    expect(rotated.apiKey.startsWith('rot_')).toBe(true);

    // During grace period, old key works
    expect(manager.authenticate(original.apiKey)).toBeTruthy();
    expect(manager.authenticate(rotated.apiKey)).toBeTruthy();

    // Wait for grace period to expire
    await new Promise(resolve => setTimeout(resolve, 25));
    expect(manager.authenticate(original.apiKey)).toBe(null);
    expect(manager.authenticate(rotated.apiKey)).toBeTruthy();
  });
});
