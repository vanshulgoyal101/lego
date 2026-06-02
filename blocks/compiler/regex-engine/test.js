import { describe, it, expect } from '../../../test/test-harness.js';
import {compileRegex} from './index.js';

  await describe('compiler/regex-engine', async () => {
    await it('should compile regex and match simple, range, lookahead, search and replace operations', () => {
      // 1. Literal and Alternation
      const r1 = compileRegex('ab|cd');
      expect(r1.test('ab')).toBe(true);
      expect(r1.test('cd')).toBe(true);
      expect(r1.test('ac')).toBe(false);

      // 2. Quantifiers: Star, Plus, Optional
      const r2 = compileRegex('a*b+c?');
      expect(r2.test('b')).toBe(true);
      expect(r2.test('aaab')).toBe(true);
      expect(r2.test('aaabc')).toBe(true);
      expect(r2.test('c')).toBe(false); // no 'b' present

      // 3. Range Quantifiers
      const r3 = compileRegex('^a{2,4}$');
      expect(r3.test('aa')).toBe(true);
      expect(r3.test('aaa')).toBe(true);
      expect(r3.test('aaaa')).toBe(true);
      expect(r3.test('a')).toBe(false);
      expect(r3.test('aaaaa')).toBe(false);

      // 4. Bracket Character Classes & Shorthands
      const r4 = compileRegex('[a-z1-9]+');
      expect(r4.test('hello123')).toBe(true);
      expect(r4.test('HELLO')).toBe(false);

      const r5 = compileRegex('\\d+');
      expect(r5.test('12345')).toBe(true);
      expect(r5.test('abc')).toBe(false);

      // 5. Anchors
      const r6 = compileRegex('^start$');
      expect(r6.test('start')).toBe(true);
      expect(r6.test('restart')).toBe(false);
      expect(r6.test('starting')).toBe(false);

      // 6. Lookahead Assertions
      const r7 = compileRegex('a(?=b)');
      expect(r7.test('ab')).toBe(true);
      expect(r7.test('ac')).toBe(false);

      const r8 = compileRegex('a(?!b)');
      expect(r8.test('ac')).toBe(true);
      expect(r8.test('ab')).toBe(false);

      // 7. Search, MatchAll and Replace
      const r9 = compileRegex('l{2}');
      const searchRes = r9.search('hello');
      expect(searchRes.index).toBe(2);
      expect(searchRes.match).toBe('ll');

      expect(r9.replace('hello', 'rr')).toBe('herro');
      expect(r9.replaceAll('helloll', 'rr')).toBe('herrorr');
    });
  });
