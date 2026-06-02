import { describe, it, expect } from '../../../test/test-harness.js';
import {sequence, char, sepBy, regex, parse} from './index.js';

  await describe('text/parser-combinator', async () => {
    await it('should successfully parse structures using combinators', () => {
      // Parse bracketed numbers: "[1,2,3]"
      const numberParser = regex(/^\d+/, 'digits').map(Number);
      const arrayParser = char('[')
        .then(sepBy(numberParser, char(',')))
        .skip(char(']'));

      const result = parse(arrayParser, '[1,2,30]');
      expect(result).toEqual([1, 2, 30]);
    });
  });
