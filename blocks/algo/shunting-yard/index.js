const OPERATORS = {
  '+': { precedence: 2, associativity: 'LEFT' },
  '-': { precedence: 2, associativity: 'LEFT' },
  '*': { precedence: 3, associativity: 'LEFT' },
  '/': { precedence: 3, associativity: 'LEFT' },
  '^': { precedence: 4, associativity: 'RIGHT' }
};

/**
 * Shunting-Yard Algorithm
 * Parses infix notation mathematical strings to Reverse Polish Notation (Postfix tokens).
 *
 * @param {string} expr - Infix string expression (e.g., "3 + 4 * 2 / ( 1 - 5 ) ^ 2")
 * @returns {string[]} Tokens in RPN order
 */
export function shuntingYard(expr) {
  // Basic space-insensitive split scanner, matching numbers or operators
  const tokens = expr.match(/\d+(\.\d+)?|[+\-*/^()]/g) || [];
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (/^\d+(\.\d+)?$/.test(token)) {
      outputQueue.push(token);
    } else if (token in OPERATORS) {
      const op1 = token;
      let op2 = operatorStack[operatorStack.length - 1];

      while (
        op2 &&
        op2 !== '(' &&
        (OPERATORS[op2].precedence > OPERATORS[op1].precedence ||
          (OPERATORS[op2].precedence === OPERATORS[op1].precedence &&
            OPERATORS[op1].associativity === 'LEFT'))
      ) {
        outputQueue.push(operatorStack.pop());
        op2 = operatorStack[operatorStack.length - 1];
      }
      operatorStack.push(op1);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      let top = operatorStack[operatorStack.length - 1];
      while (top && top !== '(') {
        outputQueue.push(operatorStack.pop());
        top = operatorStack[operatorStack.length - 1];
      }
      if (!top) {
        throw new Error('Mismatched parentheses (missing left paren)');
      }
      operatorStack.pop(); // discard '('
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === '(' || op === ')') {
      throw new Error('Mismatched parentheses (unclosed paren)');
    }
    outputQueue.push(op);
  }

  return outputQueue;
}
