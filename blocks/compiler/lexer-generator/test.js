import { describe, it, expect } from '../../../test/test-harness.js';
import { Lexer } from './index.js';

await describe('compiler/lexer-generator', async () => {
  await it('should tokenize simple mathematical expressions', () => {
    const rules = [
      { type: 'NUMBER', regex: /[0-9]+/ },
      { type: 'PLUS', regex: /\+/ },
      { type: 'MINUS', regex: /-/ },
      { type: null, regex: /\s+/ } // null means ignore token in outputs
    ];

    const lexer = new Lexer(rules);
    const tokens = lexer.tokenize('123 + 45 - 6');

    expect(tokens.length).toBe(5);
    expect(tokens[0]).toEqual({ type: 'NUMBER', value: '123', line: 1, column: 1 });
    expect(tokens[1]).toEqual({ type: 'PLUS', value: '+', line: 1, column: 5 });
    expect(tokens[2]).toEqual({ type: 'NUMBER', value: '45', line: 1, column: 7 });
    expect(tokens[3]).toEqual({ type: 'MINUS', value: '-', line: 1, column: 10 });
    expect(tokens[4]).toEqual({ type: 'NUMBER', value: '6', line: 1, column: 12 });
  });

  await it('should throw error on unexpected tokens', () => {
    const rules = [{ type: 'WORD', regex: /[a-z]+/ }];
    const lexer = new Lexer(rules);
    
    expect(() => lexer.tokenize('abc123xyz')).toThrow('Lexical error');
  });
});
