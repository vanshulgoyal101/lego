export function gcd(a, b) {
  let x = BigInt(a);
  let y = BigInt(b);
  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

export function modInverse(e, phi) {
  let m0 = BigInt(phi);
  let y = 0n;
  let x = 1n;
  let a = BigInt(e);

  if (phi === 1n) return 0n;

  while (a > 1n) {
    const q = a / phi;
    let t = phi;

    phi = a % phi;
    a = t;
    t = y;

    y = x - q * y;
    x = t;
  }

  if (x < 0n) x += m0;

  return x;
}

/**
 * Simple/Lightweight RSA cryptosystem implementation using BigInt
 */
export class RSALight {
  /**
   * @param {Object} [keys={}]
   * @param {Object} [keys.publicKey] - { e: BigInt, n: BigInt }
   * @param {Object} [keys.privateKey] - { d: BigInt, n: BigInt }
   */
  constructor(keys = {}) {
    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;
  }

  /**
   * Generate RSA public/private keys using two prime numbers
   *
   * @param {BigInt|number} p - First prime number (default: 61n)
   * @param {BigInt|number} q - Second prime number (default: 53n)
   * @param {BigInt|number} e - Coprime value (default: 17n)
   * @returns {Object} Keys structure { publicKey, privateKey }
   */
  static generateKeys(p = 61n, q = 53n, e = 17n) {
    const pVal = BigInt(p);
    const qVal = BigInt(q);
    const eVal = BigInt(e);
    
    const n = pVal * qVal;
    const phi = (pVal - 1n) * (qVal - 1n);

    if (gcd(eVal, phi) !== 1n) {
      throw new Error('InvalidParams: e must be coprime to (p-1)*(q-1).');
    }

    const d = modInverse(eVal, phi);

    return {
      publicKey: { e: eVal, n },
      privateKey: { d, n }
    };
  }

  /**
   * Encrypt a message integer using public key
   * @param {BigInt|number} message
   * @param {Object} [pubKey]
   * @returns {BigInt} Ciphertext
   */
  encrypt(message, pubKey = this.publicKey) {
    if (!pubKey) throw new Error('PublicKeyRequired: Instantiate with or pass publicKey.');
    const m = BigInt(message);
    return this._modPow(m, pubKey.e, pubKey.n);
  }

  /**
   * Decrypt ciphertext using private key
   * @param {BigInt|number} ciphertext
   * @param {Object} [privKey]
   * @returns {BigInt} Original message
   */
  decrypt(ciphertext, privKey = this.privateKey) {
    if (!privKey) throw new Error('PrivateKeyRequired: Instantiate with or pass privateKey.');
    const c = BigInt(ciphertext);
    return this._modPow(c, privKey.d, privKey.n);
  }

  /**
   * Sign a message (decrypts message with private key)
   */
  sign(message, privKey = this.privateKey) {
    return this.decrypt(message, privKey);
  }

  /**
   * Verify signature (encrypts signature with public key and matches message)
   */
  verify(message, signature, pubKey = this.publicKey) {
    const dec = this.encrypt(signature, pubKey);
    return dec === BigInt(message);
  }

  _modPow(base, exp, mod) {
    let res = 1n;
    base = base % mod;
    let e = exp;
    while (e > 0n) {
      if (e % 2n === 1n) {
        res = (res * base) % mod;
      }
      base = (base * base) % mod;
      e /= 2n;
    }
    return res;
  }
}
export default RSALight;
