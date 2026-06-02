/**
 * Prime Number Toolkit
 * Sieve of Eratosthenes, next-prime, Miller-Rabin primality test, and factorization.
 */

/**
 * Generate all primes up to n using the Sieve of Eratosthenes.
 * @param {number} n - Upper limit (inclusive).
 * @returns {number[]} Array of prime numbers up to n.
 */
export function sieve(n) {
  if (n < 2) return [];
  const composite = new Uint8Array(n + 1);
  composite[0] = composite[1] = 1;

  for (let i = 2; i * i <= n; i++) {
    if (!composite[i]) {
      for (let j = i * i; j <= n; j += i) {
        composite[j] = 1;
      }
    }
  }

  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (!composite[i]) primes.push(i);
  }
  return primes;
}

/**
 * Simple trial division primality check (up to ~10^7).
 * @param {number} n
 * @returns {boolean}
 */
function trialDivisionIsPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Miller-Rabin primality test (deterministic for n < 3,215,031,751).
 * @param {number} n - Number to test.
 * @returns {boolean} True if n is probably prime.
 */
export function isPrime(n) {
  if (n < 2) return false;
  if (n === 2 || n === 3 || n === 5 || n === 7) return true;
  if (n % 2 === 0 || n % 3 === 0 || n % 5 === 0) return false;

  // Use trial division for small numbers
  if (n < 1_000_000) return trialDivisionIsPrime(n);

  // Miller-Rabin with deterministic witnesses for n < 3,215,031,751
  // Express n-1 as 2^r * d
  let r = 0;
  let d = n - 1;
  while (d % 2 === 0) { d >>= 1; r++; }

  function modPow(base, exp, mod) {
    let result = 1n;
    let b = BigInt(base);
    let e = BigInt(exp);
    const m = BigInt(mod);
    b = b % m;
    while (e > 0n) {
      if (e % 2n === 1n) result = (result * b) % m;
      e = e >> 1n;
      b = (b * b) % m;
    }
    return Number(result);
  }

  function millerTest(a) {
    if (a >= n) a = a % n || 1;
    if (a < 2) return true;
    let x = modPow(a, d, n);
    if (x === 1 || x === n - 1) return true;
    for (let i = 0; i < r - 1; i++) {
      x = modPow(x, 2, n);
      if (x === n - 1) return true;
    }
    return false;
  }

  // Deterministic witnesses for n < 3,215,031,751
  const witnesses = [2, 3, 5, 7];
  return witnesses.every(a => millerTest(a));
}

/**
 * Find the next prime >= start.
 * @param {number} start
 * @returns {number}
 */
export function nextPrime(start) {
  let n = start < 2 ? 2 : Math.ceil(start);
  while (!isPrime(n)) n++;
  return n;
}

/**
 * Find the previous prime <= n.
 * @param {number} n
 * @returns {number|null} Null if no prime <= n.
 */
export function prevPrime(n) {
  let p = Math.floor(n);
  while (p >= 2 && !isPrime(p)) p--;
  return p >= 2 ? p : null;
}

/**
 * Factorize n into its prime factors using trial division.
 * @param {number} n - Integer >= 2.
 * @returns {number[]} Sorted array of prime factors (with repetitions).
 */
export function factorize(n) {
  if (n < 2) return [];
  const factors = [];
  let remaining = n;

  for (let p = 2; p * p <= remaining; p++) {
    while (remaining % p === 0) {
      factors.push(p);
      remaining = Math.floor(remaining / p);
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

/**
 * Compute the nth prime (1-indexed).
 * @param {number} n - Position (1 = first prime = 2).
 * @returns {number}
 */
export function nthPrime(n) {
  if (n < 1) throw new Error('n must be >= 1');
  let count = 0;
  let candidate = 1;
  while (count < n) {
    candidate++;
    if (isPrime(candidate)) count++;
  }
  return candidate;
}

/**
 * Generate k primes starting from start.
 * @param {number} k - Number of primes to generate.
 * @param {number} [start=2] - Starting candidate.
 * @returns {number[]}
 */
export function generatePrimes(k, start = 2) {
  const primes = [];
  let n = start < 2 ? 2 : start;
  while (primes.length < k) {
    if (isPrime(n)) primes.push(n);
    n++;
  }
  return primes;
}
