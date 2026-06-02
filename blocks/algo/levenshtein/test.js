import { describe, it, expect } from '../../../test/test-harness.js';
import {levenshteinDistance, stringSimilarity} from './index.js';

  await describe('algo/levenshtein', async () => {
    await it('should calculate edit distance and similarity percent', async () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(stringSimilarity('hello', 'hello')).toBe(100);
      expect(stringSimilarity('hello', 'he')).toBe(40);
    });
  });
