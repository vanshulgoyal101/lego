import crypto from 'node:crypto';

export class AuditLogger {
  #secret;
  #log = [];

  constructor(secret) {
    if (!secret || typeof secret !== 'string') {
      throw new Error('HMAC secret is required and must be a string');
    }
    this.#secret = secret;
  }

  #calculateHMAC(entry, previousHash) {
    const dataString = [
      entry.index,
      entry.timestamp,
      entry.actor,
      entry.action,
      JSON.stringify(entry.payload),
      previousHash
    ].join('|');

    return crypto.createHmac('sha256', this.#secret).update(dataString).digest('hex');
  }

  log(actor, action, payload = {}) {
    if (!actor || typeof actor !== 'string') {
      throw new Error('Actor must be a non-empty string');
    }
    if (!action || typeof action !== 'string') {
      throw new Error('Action must be a non-empty string');
    }

    const previousEntry = this.#log[this.#log.length - 1];
    const previousHash = previousEntry ? previousEntry.hash : '0'.repeat(64);
    const index = this.#log.length;
    const timestamp = new Date().toISOString();

    const entry = {
      index,
      timestamp,
      actor,
      action,
      payload,
      previousHash
    };

    entry.hash = this.#calculateHMAC(entry, previousHash);
    this.#log.push(entry);
    return { ...entry };
  }

  verify() {
    let expectedPreviousHash = '0'.repeat(64);

    for (let i = 0; i < this.#log.length; i++) {
      const entry = this.#log[i];

      if (entry.index !== i) {
        return { valid: false, reason: `Invalid sequence index at position ${i}` };
      }

      if (entry.previousHash !== expectedPreviousHash) {
        return { valid: false, reason: `Chain broken at index ${i}. Expected previous pointer ${expectedPreviousHash}, got ${entry.previousHash}` };
      }

      const calculatedHash = this.#calculateHMAC(entry, entry.previousHash);
      if (entry.hash !== calculatedHash) {
        return { valid: false, reason: `Tampering detected at index ${i}` };
      }

      expectedPreviousHash = entry.hash;
    }

    return { valid: true };
  }

  getEntries() {
    return this.#log.map((entry) => ({ ...entry }));
  }

  static verifyChain(entries, secret) {
    if (!Array.isArray(entries)) {
      return { valid: false, reason: 'Entries must be an array' };
    }
    const logger = new AuditLogger(secret);
    logger.#log = entries.map((e) => ({ ...e }));
    return logger.verify();
  }
}
