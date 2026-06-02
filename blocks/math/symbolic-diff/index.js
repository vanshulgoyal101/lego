/**
 * Symbolic Differentiation Engine
 * Parses mathematical expression strings, differentiates them with respect to a variable,
 * simplifies the resulting syntax tree, and formats it back to a readable string.
 */

// Token types
const TOKEN_TYPES = {
  NUMBER: 'NUMBER',
  IDENTIFIER: 'IDENTIFIER',
  OPERATOR: 'OPERATOR',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EOF: 'EOF'
};

// Tokenize input string
function tokenize(str) {
  const tokens = [];
  let i = 0;
  
  while (i < str.length) {
    const char = str[i];
    
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(str[i + 1]))) {
      let numStr = '';
      while (i < str.length && (/[0-9.]/.test(str[i]))) {
        numStr += str[i];
        i++;
      }
      tokens.push({ type: TOKEN_TYPES.NUMBER, value: parseFloat(numStr) });
      continue;
    }
    
    if (/[a-zA-Z_]/.test(char)) {
      let identStr = '';
      while (i < str.length && /[a-zA-Z0-9_]/.test(str[i])) {
        identStr += str[i];
        i++;
      }
      tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: identStr });
      continue;
    }
    
    if ('+-*/^'.includes(char)) {
      tokens.push({ type: TOKEN_TYPES.OPERATOR, value: char });
      i++;
      continue;
    }
    
    if (char === '(') {
      tokens.push({ type: TOKEN_TYPES.LPAREN, value: '(' });
      i++;
      continue;
    }
    
    if (char === ')') {
      tokens.push({ type: TOKEN_TYPES.RPAREN, value: ')' });
      i++;
      continue;
    }
    
    throw new Error(`Unexpected character: ${char}`);
  }
  
  tokens.push({ type: TOKEN_TYPES.EOF, value: null });
  return tokens;
}

// AST Nodes
class ASTNode {}

class LiteralNode extends ASTNode {
  constructor(value) {
    super();
    this.type = 'Literal';
    this.value = value;
  }
}

class VariableNode extends ASTNode {
  constructor(name) {
    super();
    this.type = 'Variable';
    this.name = name;
  }
}

class OperatorNode extends ASTNode {
  constructor(op, left, right) {
    super();
    this.type = 'Operator';
    this.op = op;
    this.left = left;
    this.right = right;
  }
}

class FunctionNode extends ASTNode {
  constructor(name, arg) {
    super();
    this.type = 'Function';
    this.name = name;
    this.arg = arg;
  }
}

class UnaryNode extends ASTNode {
  constructor(op, arg) {
    super();
    this.type = 'Unary';
    this.op = op;
    this.arg = arg;
  }
}

// Parser
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }
  
  peek() {
    return this.tokens[this.pos];
  }
  
  consume() {
    return this.tokens[this.pos++];
  }
  
  match(type, value) {
    const token = this.peek();
    if (token.type === type && (value === undefined || token.value === value)) {
      this.consume();
      return true;
    }
    return false;
  }
  
  parse() {
    const node = this.parseExpression();
    if (this.peek().type !== TOKEN_TYPES.EOF) {
      throw new Error(`Unexpected token at end of expression: ${JSON.stringify(this.peek())}`);
    }
    return node;
  }
  
  parseExpression() {
    return this.parseAdditionSubtraction();
  }
  
  parseAdditionSubtraction() {
    let node = this.parseMultiplicationDivision();
    
    while (true) {
      if (this.match(TOKEN_TYPES.OPERATOR, '+')) {
        node = new OperatorNode('+', node, this.parseMultiplicationDivision());
      } else if (this.match(TOKEN_TYPES.OPERATOR, '-')) {
        node = new OperatorNode('-', node, this.parseMultiplicationDivision());
      } else {
        break;
      }
    }
    
    return node;
  }
  
  parseMultiplicationDivision() {
    let node = this.parseUnary();
    
    while (true) {
      if (this.match(TOKEN_TYPES.OPERATOR, '*')) {
        node = new OperatorNode('*', node, this.parseUnary());
      } else if (this.match(TOKEN_TYPES.OPERATOR, '/')) {
        node = new OperatorNode('/', node, this.parseUnary());
      } else {
        break;
      }
    }
    
    return node;
  }

  parseUnary() {
    if (this.match(TOKEN_TYPES.OPERATOR, '-')) {
      return new UnaryNode('-', this.parseUnary());
    } else if (this.match(TOKEN_TYPES.OPERATOR, '+')) {
      return this.parseUnary();
    }
    return this.parsePower();
  }
  
  parsePower() {
    let node = this.parsePrimary();
    
    if (this.match(TOKEN_TYPES.OPERATOR, '^')) {
      node = new OperatorNode('^', node, this.parseUnary()); // Exponent can be unary (e.g. x^-2)
    }
    
    return node;
  }
  
  parsePrimary() {
    const token = this.peek();
    
    if (this.match(TOKEN_TYPES.NUMBER)) {
      return new LiteralNode(token.value);
    }
    
    if (this.match(TOKEN_TYPES.LPAREN)) {
      const expr = this.parseExpression();
      if (!this.match(TOKEN_TYPES.RPAREN)) {
        throw new Error('Expected matching closing parenthesis )');
      }
      return expr;
    }
    
    if (this.match(TOKEN_TYPES.IDENTIFIER)) {
      const nextToken = this.peek();
      // Check if it's a function call (e.g. sin(...))
      if (nextToken.type === TOKEN_TYPES.LPAREN) {
        this.consume(); // Consume (
        const arg = this.parseExpression();
        if (!this.match(TOKEN_TYPES.RPAREN)) {
          throw new Error(`Expected closing parenthesis for function call: ${token.value}`);
        }
        return new FunctionNode(token.value.toLowerCase(), arg);
      }
      return new VariableNode(token.value);
    }
    
    throw new Error(`Unexpected token in primary parsing: ${JSON.stringify(token)}`);
  }
}

// Check if an AST node contains the target variable
function containsVariable(node, variable) {
  if (node instanceof LiteralNode) return false;
  if (node instanceof VariableNode) return node.name === variable;
  if (node instanceof OperatorNode) return containsVariable(node.left, variable) || containsVariable(node.right, variable);
  if (node instanceof FunctionNode) return containsVariable(node.arg, variable);
  if (node instanceof UnaryNode) return containsVariable(node.arg, variable);
  return false;
}

// Compute derivative of a node
function derive(node, variable) {
  if (node instanceof LiteralNode) {
    return new LiteralNode(0);
  }
  
  if (node instanceof VariableNode) {
    if (node.name === variable) {
      return new LiteralNode(1);
    }
    return new LiteralNode(0);
  }
  
  if (node instanceof OperatorNode) {
    const u = node.left;
    const v = node.right;
    const du = derive(u, variable);
    const dv = derive(v, variable);
    
    switch (node.op) {
      case '+':
        return new OperatorNode('+', du, dv);
      case '-':
        return new OperatorNode('-', du, dv);
      case '*':
        // Product Rule: u*dv + du*v
        return new OperatorNode('+', 
          new OperatorNode('*', u, dv),
          new OperatorNode('*', du, v)
        );
      case '/':
        // Quotient Rule: (du*v - u*dv) / (v^2)
        return new OperatorNode('/',
          new OperatorNode('-',
            new OperatorNode('*', du, v),
            new OperatorNode('*', u, dv)
          ),
          new OperatorNode('^', v, new LiteralNode(2))
        );
      case '^':
        const uHasX = containsVariable(u, variable);
        const vHasX = containsVariable(v, variable);
        
        if (!uHasX && !vHasX) {
          return new LiteralNode(0);
        }
        
        if (uHasX && !vHasX) {
          // Power rule: d/dx(u^n) = n * u^(n-1) * du/dx
          return new OperatorNode('*',
            new OperatorNode('*',
              v,
              new OperatorNode('^', u, new OperatorNode('-', v, new LiteralNode(1)))
            ),
            du
          );
        }
        
        if (!uHasX && vHasX) {
          // Exponential rule: d/dx(a^v) = a^v * ln(a) * dv/dx
          return new OperatorNode('*',
            new OperatorNode('*',
              new OperatorNode('^', u, v),
              new FunctionNode('ln', u)
            ),
            dv
          );
        }
        
        // General rule: d/dx(u^v) = d/dx(exp(v * ln(u)))
        // = u^v * (dv/dx * ln(u) + v * (du/dx / u))
        return new OperatorNode('*',
          new OperatorNode('^', u, v),
          new OperatorNode('+',
            new OperatorNode('*', dv, new FunctionNode('ln', u)),
            new OperatorNode('*', v, new OperatorNode('/', du, u))
          )
        );
    }
  }
  
  if (node instanceof FunctionNode) {
    const u = node.arg;
    const du = derive(u, variable);
    
    switch (node.name) {
      case 'sin':
        // d/dx(sin(u)) = cos(u) * du/dx
        return new OperatorNode('*', new FunctionNode('cos', u), du);
      case 'cos':
        // d/dx(cos(u)) = -sin(u) * du/dx
        return new OperatorNode('*', new UnaryNode('-', new FunctionNode('sin', u)), du);
      case 'tan':
        // d/dx(tan(u)) = (1 / cos(u)^2) * du/dx
        return new OperatorNode('/',
          du,
          new OperatorNode('^', new FunctionNode('cos', u), new LiteralNode(2))
        );
      case 'ln':
        // d/dx(ln(u)) = (1 / u) * du/dx
        return new OperatorNode('/', du, u);
      case 'exp':
        // d/dx(exp(u)) = exp(u) * du/dx
        return new OperatorNode('*', new FunctionNode('exp', u), du);
      default:
        throw new Error(`Unsupported function: ${node.name}`);
    }
  }
  
  if (node instanceof UnaryNode) {
    if (node.op === '-') {
      return new UnaryNode('-', derive(node.arg, variable));
    }
    return derive(node.arg, variable);
  }
  
  throw new Error(`Unknown node class: ${node.constructor.name}`);
}

// Compare structure of two nodes (for exact subtraction identity e.g. x - x -> 0)
function equal(node1, node2) {
  if (node1.type !== node2.type) return false;
  if (node1 instanceof LiteralNode) return node1.value === node2.value;
  if (node1 instanceof VariableNode) return node1.name === node2.name;
  if (node1 instanceof UnaryNode) return node1.op === node2.op && equal(node1.arg, node2.arg);
  if (node1 instanceof FunctionNode) return node1.name === node2.name && equal(node1.arg, node2.arg);
  if (node1 instanceof OperatorNode) {
    return node1.op === node2.op && equal(node1.left, node2.left) && equal(node1.right, node2.right);
  }
  return false;
}

// AST Simplifier
function simplifyNode(node) {
  // Post-order simplification
  if (node instanceof OperatorNode) {
    node.left = simplifyNode(node.left);
    node.right = simplifyNode(node.right);
  } else if (node instanceof FunctionNode || node instanceof UnaryNode) {
    node.arg = simplifyNode(node.arg);
  }
  
  // Literal constant folding
  if (node instanceof OperatorNode && node.left instanceof LiteralNode && node.right instanceof LiteralNode) {
    const lVal = node.left.value;
    const rVal = node.right.value;
    switch (node.op) {
      case '+': return new LiteralNode(lVal + rVal);
      case '-': return new LiteralNode(lVal - rVal);
      case '*': return new LiteralNode(lVal * rVal);
      case '/': return rVal !== 0 ? new LiteralNode(lVal / rVal) : node;
      case '^': return new LiteralNode(Math.pow(lVal, rVal));
    }
  }
  
  if (node instanceof UnaryNode && node.arg instanceof LiteralNode) {
    if (node.op === '-') return new LiteralNode(-node.arg.value);
    return node.arg;
  }
  
  // Algebraic simplification rules
  if (node instanceof OperatorNode) {
    const op = node.op;
    const left = node.left;
    const right = node.right;
    
    if (op === '+') {
      if (left instanceof LiteralNode && left.value === 0) return right;
      if (right instanceof LiteralNode && right.value === 0) return left;
    }
    
    if (op === '-') {
      if (right instanceof LiteralNode && right.value === 0) return left;
      if (left instanceof LiteralNode && left.value === 0) return new UnaryNode('-', right);
      if (equal(left, right)) return new LiteralNode(0);
    }
    
    if (op === '*') {
      if ((left instanceof LiteralNode && left.value === 0) || (right instanceof LiteralNode && right.value === 0)) {
        return new LiteralNode(0);
      }
      if (left instanceof LiteralNode && left.value === 1) return right;
      if (right instanceof LiteralNode && right.value === 1) return left;
    }
    
    if (op === '/') {
      if (left instanceof LiteralNode && left.value === 0) {
        return new LiteralNode(0);
      }
      if (right instanceof LiteralNode && right.value === 1) return left;
      if (equal(left, right)) return new LiteralNode(1);
    }
    
    if (op === '^') {
      if (right instanceof LiteralNode && right.value === 0) return new LiteralNode(1);
      if (right instanceof LiteralNode && right.value === 1) return left;
      if (left instanceof LiteralNode && left.value === 0) return new LiteralNode(0);
      if (left instanceof LiteralNode && left.value === 1) return new LiteralNode(1);
    }
  }
  
  if (node instanceof UnaryNode && node.op === '-') {
    if (node.arg instanceof UnaryNode && node.arg.op === '-') {
      return node.arg.arg; // -(-x) -> x
    }
  }
  
  return node;
}

// Run simplifier multiple times to resolve nested constant propagation and simplifications
function simplify(node) {
  let prevStr = '';
  let current = node;
  
  // Loop up to 5 times or until stringified version stabilizes
  for (let iter = 0; iter < 5; iter++) {
    current = simplifyNode(current);
    const currentStr = stringify(current);
    if (currentStr === prevStr) {
      break;
    }
    prevStr = currentStr;
  }
  
  return current;
}

// Get operator precedence for parenting
function getPrecedence(node) {
  if (node instanceof LiteralNode || node instanceof VariableNode || node instanceof FunctionNode) {
    return 5;
  }
  if (node instanceof OperatorNode) {
    if (node.op === '^') return 4;
    if (node.op === '*' || node.op === '/') return 3;
    if (node.op === '+' || node.op === '-') return 2;
  }
  if (node instanceof UnaryNode) {
    return 1;
  }
  return 0;
}

// Stringify AST back to a mathematical string
function stringify(node, parentPrec = 0) {
  if (node instanceof LiteralNode) {
    return String(node.value);
  }
  
  if (node instanceof VariableNode) {
    return node.name;
  }
  
  if (node instanceof UnaryNode) {
    const argStr = stringify(node.arg, 1);
    const formatted = `${node.op}${argStr}`;
    return parentPrec > 1 ? `(${formatted})` : formatted;
  }
  
  if (node instanceof FunctionNode) {
    return `${node.name}(${stringify(node.arg)})`;
  }
  
  if (node instanceof OperatorNode) {
    const prec = getPrecedence(node);
    
    // Right associativity of '^' and standard left associativity of others
    let leftPrec = prec;
    let rightPrec = prec;
    
    if (node.op === '^') {
      leftPrec = prec + 1; // Left child of ^ must parenthesize if it has lower or equal precedence
    } else {
      rightPrec = prec + 1; // Right child of + - * / must parenthesize if it has same precedence
    }
    
    const leftStr = stringify(node.left, leftPrec);
    const rightStr = stringify(node.right, rightPrec);
    
    const formatted = `${leftStr} ${node.op} ${rightStr}`;
    return prec < parentPrec ? `(${formatted})` : formatted;
  }
  
  return '';
}

/**
 * Interface function to compute symbolic derivative of a given expression.
 * @param {string} exprStr - Mathematical expression to differentiate.
 * @param {string} [wrt='x'] - Variable to differentiate with respect to.
 * @returns {string} - Simplified derivative string.
 */
export function differentiate(exprStr, wrt = 'x') {
  if (!exprStr || typeof exprStr !== 'string') {
    throw new Error('differentiate expects a non-empty string expression');
  }
  
  const tokens = tokenize(exprStr);
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const derivedAST = derive(ast, wrt);
  const simplifiedAST = simplify(derivedAST);
  return stringify(simplifiedAST);
}
