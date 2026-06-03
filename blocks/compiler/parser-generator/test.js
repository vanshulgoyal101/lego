import { describe, it, expect } from '../../../test/test-harness.js';
import { LL1ParserGenerator } from './index.js';

await describe('compiler/parser-generator', async () => {
  await it('should build FIRST/FOLLOW and parse table for a simple grammar', () => {
    // S -> a B | ε
    // B -> b S
    const grammar = {
      S: [['a', 'B'], ['ε']],
      B: [['b', 'S']]
    };

    const startSymbol = 'S';
    const terminals = ['a', 'b'];

    const { first, follow, parseTable } = LL1ParserGenerator.generate(grammar, startSymbol, terminals, 'ε');

    expect(first.S.includes('a')).toBe(true);
    expect(first.S.includes('ε')).toBe(true);
    expect(first.B.includes('b')).toBe(true);

    expect(follow.S.includes('$')).toBe(true);
    expect(follow.B.includes('$')).toBe(true);

    // Check table entries
    expect(parseTable.S.a.join('')).toBe('aB');
    expect(parseTable.S['$'].join('')).toBe('ε');
    expect(parseTable.B.b.join('')).toBe('bS');
  });
});
