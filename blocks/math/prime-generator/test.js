import { describe, it, expect } from '../../../test/test-harness.js';
import {sieve, isPrime, nextPrime, prevPrime, factorize, nthPrime, generatePrimes} from './index.js';

  await describe('math/prime-generator', async () => {
    await it('should generate primes via sieve', () => {
      const primes = sieve(20);
      expect(primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19]);
    });

    await it('should correctly identify prime numbers', () => {
      expect(isPrime(2)).toBe(true);
      expect(isPrime(17)).toBe(true);
      expect(isPrime(97)).toBe(true);
      expect(isPrime(1)).toBe(false);
      expect(isPrime(4)).toBe(false);
      expect(isPrime(100)).toBe(false);
    });

    await it('should find next and previous primes', () => {
      expect(nextPrime(10)).toBe(11);
      expect(nextPrime(11)).toBe(11);
      expect(prevPrime(10)).toBe(7);
    });

    await it('should factorize integers correctly', () => {
      expect(factorize(12)).toEqual([2, 2, 3]);
      expect(factorize(60)).toEqual([2, 2, 3, 5]);
      expect(factorize(97)).toEqual([97]);
    });

    await it('should compute the nth prime', () => {
      expect(nthPrime(1)).toBe(2);
      expect(nthPrime(5)).toBe(11);
      expect(nthPrime(10)).toBe(29);
    });

    await it('should generate k primes from a starting point', () => {
      const primes = generatePrimes(5, 10);
      expect(primes).toEqual([11, 13, 17, 19, 23]);
    });
  });
