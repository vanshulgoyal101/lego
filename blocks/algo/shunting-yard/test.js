import { describe, it, expect } from '../../../test/test-harness.js';
import { shuntingYard } from './index.js';

await describe('algo/shunting-yard', async () => {
  await it('should correctly convert infix math expressions to RPN', () => {
    expect(shuntingYard('3 + 4')).toEqual(['3', '4', '+']);
    expect(shuntingYard('3 + 4 * 2 / ( 1 - 5 ) ^ 2')).toEqual([
      '3', '4', '2', '*', '1', '5', '-', '2', '^', '/', '+'
    ]);
  });

  await it('should throw error for mismatched parentheses', () => {
    expect(() => shuntingYard('3 + ( 4 * 2')).toThrow('Mismatched parentheses');
    expect(() => shuntingYard('3 + 4 )')).toThrow('Mismatched parentheses');
  });
});
