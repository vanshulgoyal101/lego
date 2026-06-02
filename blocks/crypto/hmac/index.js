import crypto from 'crypto';

export class HMAC {
  constructor(key, algorithm = 'sha256') {
    this.key = typeof key === 'string' ? Buffer.from(key, 'utf8') : Buffer.from(key);
    this.algorithm = algorithm.toLowerCase().replace('-', '');
  }

  sign(message) {
    const data = typeof message === 'string' ? Buffer.from(message, 'utf8') : Buffer.from(message);
    const hmac = crypto.createHmac(this.algorithm, this.key);
    hmac.update(data);
    return hmac.digest();
  }

  verify(message, signature) {
    const computed = this.sign(message);
    const expected = typeof signature === 'string' ? Buffer.from(signature, 'hex') : Buffer.from(signature);

    if (computed.length !== expected.length) {
      return false;
    }

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(computed, expected);
  }
}
