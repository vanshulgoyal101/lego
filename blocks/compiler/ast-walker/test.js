import { describe, it, expect } from '../../../test/test-harness.js';
import { ASTWalker } from './index.js';

await describe('compiler/ast-walker', async () => {
  await it('should traverse and evaluate a simple AST math expression tree', () => {
    // AST representing: 10 + 20
    const ast = {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Literal', value: 10 },
      right: { type: 'Literal', value: 20 }
    };

    const visitors = {
      Literal: (node) => {
        return node.value;
      },
      BinaryExpression: (node, walk) => {
        const leftVal = walk(node.left);
        const rightVal = walk(node.right);
        if (node.operator === '+') return leftVal + rightVal;
        if (node.operator === '-') return leftVal - rightVal;
        return 0;
      }
    };

    const walker = new ASTWalker(visitors);
    const result = walker.walk(ast);

    expect(result).toBe(30);
  });
});
