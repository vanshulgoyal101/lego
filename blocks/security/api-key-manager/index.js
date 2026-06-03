import crypto from 'node:crypto';

export function generateAPIKey(options = {}) {
  const { prefix = '', length = 32, encoding = 'base64url' } = options;
  const bytes = crypto.randomBytes(length);
  let keyString;
  if (encoding === 'hex') {
    keyString = bytes.toString('hex');
  } else if (encoding === 'base64') {
    keyString = bytes.toString('base64');
  } else {
    keyString = bytes.toString('base64url');
  }
  
  const apiKey = prefix ? `${prefix}${keyString}` : keyString;
  const hashedKey = hashAPIKey(apiKey);
  return { apiKey, hashedKey };
}

export function hashAPIKey(apiKey) {
  if (typeof apiKey !== 'string' || !apiKey) {
    throw new Error('API key must be a non-empty string');
  }
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function verifyAPIKey(apiKey, hashedKey) {
  if (typeof apiKey !== 'string' || typeof hashedKey !== 'string') {
    return false;
  }
  const hash1 = Buffer.from(hashAPIKey(apiKey), 'hex');
  const hash2 = Buffer.from(hashedKey, 'hex');
  if (hash1.length !== hash2.length) {
    return false;
  }
  return crypto.timingSafeEqual(hash1, hash2);
}

export class APIKeyManager {
  #keys = new Map();

  createKey(options = {}) {
    const { prefix = '', expiresInMs = null, metadata = {} } = options;
    const { apiKey, hashedKey } = generateAPIKey({ prefix });
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const expiresAt = expiresInMs ? new Date(Date.now() + expiresInMs).toISOString() : null;

    const keyRecord = {
      id,
      hashedKey,
      prefix,
      revoked: false,
      createdAt,
      expiresAt,
      lastUsedAt: null,
      metadata
    };

    this.#keys.set(id, keyRecord);
    return { apiKey, keyRecord: { ...keyRecord } };
  }

  authenticate(apiKey) {
    if (!apiKey) return null;
    const currentHash = hashAPIKey(apiKey);
    
    for (const record of this.#keys.values()) {
      if (verifyAPIKey(apiKey, record.hashedKey)) {
        if (record.revoked) return null;
        if (record.expiresAt && Date.now() > new Date(record.expiresAt).getTime()) {
          return null;
        }
        record.lastUsedAt = new Date().toISOString();
        return { ...record };
      }
    }
    return null;
  }

  revokeKey(id) {
    const record = this.#keys.get(id);
    if (!record) return false;
    record.revoked = true;
    return true;
  }

  rotateKey(id, options = {}) {
    const oldRecord = this.#keys.get(id);
    if (!oldRecord) {
      throw new Error('Key not found');
    }

    const { gracePeriodMs = 0 } = options;

    if (gracePeriodMs > 0) {
      // Set old key to expire after grace period
      oldRecord.expiresAt = new Date(Date.now() + gracePeriodMs).toISOString();
    } else {
      oldRecord.revoked = true;
    }

    // Generate new key with same config
    const newKeyResult = this.createKey({
      prefix: oldRecord.prefix,
      expiresInMs: options.expiresInMs,
      metadata: { ...oldRecord.metadata, rotatedFrom: id }
    });

    return newKeyResult;
  }

  getKey(id) {
    const record = this.#keys.get(id);
    return record ? { ...record } : null;
  }
}
