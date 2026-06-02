/**
 * Helper function for modular exponentiation: (base^exp) % mod
 */
export function modPow(base, exp, mod) {
  let res = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);

  if (b === 0n) return 0n;

  while (e > 0n) {
    if (e & 1n) {
      res = (res * b) % m;
    }
    b = (b * b) % m;
    e = e >> 1n;
  }
  return res;
}

// RFC 3526 2048-bit MODP Group 14 Prime
const DEFAULT_PRIME_HEX = 
  "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1" +
  "29024E088A67CC74020BBEA63B139B22514A08798E3404DD" +
  "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245" +
  "E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED" +
  "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D" +
  "C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F" +
  "83655D23DCA3AD961C62F356208552BB9ED529077096966D" +
  "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B" +
  "E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9" +
  "DE2BCBF6955817183995497C1B8E9F3D9DEC9316625314C7" +
  "C940E135C6E61167C12E9044A24821E6F721F6851C3E2124" +
  "C31E059619141473E8C17C49582AF28FA90C4ABF7755517F";

export class DiffieHellman {
  /**
   * @param {string|BigInt} [primeHexOrVal] - Prime group (default is RFC 3526 2048-bit MODP)
   * @param {number|BigInt} [generator=2] - Generator base
   */
  constructor(primeHexOrVal = DEFAULT_PRIME_HEX, generator = 2) {
    if (typeof primeHexOrVal === 'string') {
      this.prime = BigInt('0x' + primeHexOrVal);
    } else {
      this.prime = BigInt(primeHexOrVal);
    }
    this.generator = BigInt(generator);
    this.privateKey = null;
    this.publicKey = null;
  }

  /**
   * Generate private and public keys
   * @returns {BigInt} Public key
   */
  generateKeys() {
    // Generate private key. For safety, it should be between 2 and prime-2.
    // Here we generate a random key of length ~256 bits for demonstration.
    // A production implementation could use a larger random value.
    const byteLength = 32; // 256 bits
    let privateVal = 0n;
    for (let i = 0; i < byteLength; i++) {
      const randByte = BigInt(Math.floor(Math.random() * 256));
      privateVal = (privateVal << 8n) + randByte;
    }
    // Ensure key is > 1
    if (privateVal < 2n) privateVal += 2n;

    this.privateKey = privateVal;
    this.publicKey = modPow(this.generator, this.privateKey, this.prime);
    return this.publicKey;
  }

  /**
   * Compute the shared secret key from other party's public key
   * @param {BigInt|string} otherPublicKey
   * @returns {string} Hex representation of the shared secret
   */
  computeSecret(otherPublicKey) {
    if (this.privateKey === null) {
      throw new Error('KeyNotGenerated: Generate keys before computing shared secret.');
    }
    const otherPub = BigInt(otherPublicKey);
    const secretVal = modPow(otherPub, this.privateKey, this.prime);
    return secretVal.toString(16);
  }
}
