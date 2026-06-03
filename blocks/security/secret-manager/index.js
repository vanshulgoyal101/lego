import crypto from 'node:crypto';

export class SecretManager {
  #key;
  #store = new Map();
  #auditLog = [];
  #intervalId = null;

  constructor(options = {}) {
    const { masterKey, ttlCheckIntervalMs = 5000 } = options;
    
    // Fallback to random key if none provided
    const keySource = masterKey || crypto.randomBytes(32).toString('hex');
    this.#key = crypto.createHash('sha256').update(keySource).digest();

    if (ttlCheckIntervalMs > 0) {
      this.#intervalId = setInterval(() => this.#checkExpirations(), ttlCheckIntervalMs);
      if (this.#intervalId.unref) {
        this.#intervalId.unref(); // Don't keep Node process alive
      }
    }

    this.#log('INITIALIZE', 'system', 'success');
  }

  #log(action, key, status, details = {}) {
    this.#auditLog.push({
      timestamp: new Date().toISOString(),
      action,
      key,
      status,
      ...details
    });
  }

  #encrypt(value) {
    const serialized = JSON.stringify(value);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.#key, iv);
    
    let encrypted = cipher.update(serialized, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      data: encrypted,
      iv: iv.toString('hex'),
      tag
    };
  }

  #decrypt(encryptedObj) {
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const tag = Buffer.from(encryptedObj.tag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.#key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedObj.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  #checkExpirations() {
    const now = Date.now();
    for (const [key, item] of this.#store.entries()) {
      if (item.expiresAt && now >= item.expiresAt) {
        this.#store.delete(key);
        this.#log('EXPIRE', key, 'success');
      }
    }
  }

  set(key, value, ttlMs = null) {
    if (typeof key !== 'string' || !key) {
      throw new Error('Key must be a non-empty string');
    }

    try {
      const encrypted = this.#encrypt(value);
      const expiresAt = ttlMs ? Date.now() + ttlMs : null;

      this.#store.set(key, {
        encrypted,
        expiresAt
      });

      this.#log('SET', key, 'success', { ttl: ttlMs });
      return true;
    } catch (err) {
      this.#log('SET', key, 'failure', { error: err.message });
      throw err;
    }
  }

  get(key) {
    if (typeof key !== 'string' || !key) {
      throw new Error('Key must be a non-empty string');
    }

    const item = this.#store.get(key);
    if (!item) {
      this.#log('GET', key, 'failure', { reason: 'not_found' });
      return undefined;
    }

    if (item.expiresAt && Date.now() >= item.expiresAt) {
      this.#store.delete(key);
      this.#log('EXPIRE', key, 'success');
      this.#log('GET', key, 'failure', { reason: 'expired' });
      return undefined;
    }

    try {
      const decrypted = this.#decrypt(item.encrypted);
      this.#log('GET', key, 'success');
      return decrypted;
    } catch (err) {
      this.#log('GET', key, 'failure', { error: err.message });
      throw new Error('Failed to decrypt secret. Key/Integrity check failed.');
    }
  }

  has(key) {
    const item = this.#store.get(key);
    if (!item) return false;

    if (item.expiresAt && Date.now() >= item.expiresAt) {
      this.#store.delete(key);
      this.#log('EXPIRE', key, 'success');
      return false;
    }

    return true;
  }

  delete(key) {
    if (typeof key !== 'string' || !key) {
      throw new Error('Key must be a non-empty string');
    }

    const existed = this.has(key);
    if (existed) {
      this.#store.delete(key);
      this.#log('DELETE', key, 'success');
      return true;
    }

    this.#log('DELETE', key, 'failure', { reason: 'not_found' });
    return false;
  }

  clear() {
    this.#store.clear();
    this.#log('CLEAR', 'all', 'success');
  }

  getAuditLog() {
    // Return a shallow copy of audit logs to preserve integrity
    return [...this.#auditLog];
  }

  destroy() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
    this.clear();
  }
}
