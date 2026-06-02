/**
 * Thompson NFA Regular Expression Engine.
 * Features:
 * 1. Recursive Descent Regex Parser (compiles pattern string to AST).
 * 2. Extended matching options: Alternation (|), Kleene Star (*), Plus (+), Optional (?).
 * 3. Range quantifiers: {min,max}, {min,}, {num} via Thompson NFA fragment cloning.
 * 4. Character bracket classes [a-z], [0-9], [A-Z0-9] and negated sets [^a-z].
 * 5. Predefined shorthand classes: \d (digit), \w (word), \s (whitespace).
 * 6. Escapes sequences matching e.g. \., \*, \|, \+, \?, \\.
 * 7. Thompson's construction compiler (translates AST into NFA graph states).
 * 8. Zero-width assertions: Positive Lookahead (?=...) and Negative Lookahead (?!...) using conditional epsilon transitions.
 * 9. Epsilon closure search and NFA simulation for matching evaluation.
 * 10. Substring searching, matching replacement (replace & replaceAll), and anchors (^, $).
 */

// --- 1. Regex Abstract Syntax Tree Nodes ---
const AST_TYPES = {
  LITERAL: 'LITERAL',
  CHAR_CLASS: 'CHAR_CLASS',
  CONCATENATION: 'CONCATENATION',
  ALTERNATION: 'ALTERNATION',
  QUANTIFIER: 'QUANTIFIER',
  LOOKAHEAD: 'LOOKAHEAD',
  EPSILON: 'EPSILON'
};

class AstNode {
  constructor(type, payload = {}) {
    this.type = type;
    Object.assign(this, payload);
  }
}

// --- 2. Recursive Descent Parser ---
export class RegexParser {
  constructor(pattern) {
    this.pattern = pattern;
    this.pos = 0;
  }

  peek() {
    return this.pattern[this.pos] || null;
  }

  next() {
    return this.pattern[this.pos++] || null;
  }

  parse() {
    const ast = this.parseAlternation();
    if (this.pos < this.pattern.length) {
      throw new Error(`ParserError: Unexpected token "${this.peek()}" at index ${this.pos}`);
    }
    return ast;
  }

  parseAlternation() {
    let node = this.parseConcatenation();
    while (this.peek() === '|') {
      this.next(); // skip '|'
      const right = this.parseConcatenation();
      node = new AstNode(AST_TYPES.ALTERNATION, { left: node, right });
    }
    return node;
  }

  parseConcatenation() {
    let node = null;
    while (this.pos < this.pattern.length) {
      const nextChar = this.peek();
      if (nextChar === '|' || nextChar === ')') {
        break;
      }
      const item = this.parseQuantified();
      if (!node) {
        node = item;
      } else {
        node = new AstNode(AST_TYPES.CONCATENATION, { left: node, right: item });
      }
    }
    return node || new AstNode(AST_TYPES.EPSILON);
  }

  parseQuantified() {
    let node = this.parseAtom();
    while (true) {
      const nextChar = this.peek();
      if (nextChar === '*' || nextChar === '+' || nextChar === '?') {
        this.next(); // skip quantifier
        node = new AstNode(AST_TYPES.QUANTIFIER, { child: node, qType: nextChar });
      } else if (nextChar === '{') {
        this.next(); // skip '{'
        let minStr = '';
        while (this.peek() !== null && /\d/.test(this.peek())) {
          minStr += this.next();
        }

        let maxStr = null;
        if (this.peek() === ',') {
          this.next(); // skip ','
          maxStr = '';
          while (this.peek() !== null && /\d/.test(this.peek())) {
            maxStr += this.next();
          }
        }

        if (this.next() !== '}') {
          throw new Error('ParserError: Mismatched brace in range quantifier');
        }

        const min = parseInt(minStr, 10);
        if (isNaN(min)) {
          throw new Error('ParserError: Invalid minimum count in range quantifier');
        }

        let max = min;
        if (maxStr !== null) {
          max = maxStr === '' ? Infinity : parseInt(maxStr, 10);
        }

        if (max < min) {
          throw new Error(`ParserError: Invalid range limits {${min},${max}}`);
        }

        node = new AstNode(AST_TYPES.QUANTIFIER, { child: node, qType: 'range', min, max });
      } else {
        break;
      }
    }
    return node;
  }

  parseAtom() {
    const char = this.peek();
    if (char === null) {
      throw new Error('ParserError: Unexpected EOF in atom expression');
    }

    if (char === '(') {
      this.next(); // skip '('
      
      // Check Lookahead syntax: (?=pattern) or (?!pattern)
      if (this.peek() === '?') {
        this.next(); // skip '?'
        const indicator = this.next();
        if (indicator === '=' || indicator === '!') {
          const subNode = this.parseAlternation();
          if (this.next() !== ')') {
            throw new Error('ParserError: Mismatched parentheses in lookahead expression');
          }
          return new AstNode(AST_TYPES.LOOKAHEAD, { child: subNode, negated: (indicator === '!') });
        } else {
          throw new Error(`ParserError: Unsupported lookahead pattern type "(?${indicator}"`);
        }
      }

      const node = this.parseAlternation();
      if (this.next() !== ')') {
        throw new Error('ParserError: Mismatched parentheses in pattern grouping');
      }
      return node;
    }

    if (char === '[') {
      return this.parseBracketClass();
    }

    if (char === '\\') {
      this.next(); // skip '\'
      const escaped = this.next();
      if (escaped === null) {
        throw new Error('ParserError: Trailing escape character at EOF');
      }

      // Shorthand sequences
      if (escaped === 'd') {
        return new AstNode(AST_TYPES.CHAR_CLASS, { ranges: [['0', '9']], chars: new Set(), negated: false });
      }
      if (escaped === 'w') {
        return new AstNode(AST_TYPES.CHAR_CLASS, {
          ranges: [['a', 'z'], ['A', 'Z'], ['0', '9']],
          chars: new Set(['_']),
          negated: false
        });
      }
      if (escaped === 's') {
        return new AstNode(AST_TYPES.CHAR_CLASS, {
          ranges: [],
          chars: new Set([' ', '\t', '\r', '\n', '\v', '\f']),
          negated: false
        });
      }

      // Literal escaped char
      return new AstNode(AST_TYPES.LITERAL, { char: escaped });
    }

    if (char === '.') {
      this.next(); // skip '.'
      // Matches everything except newline character
      return new AstNode(AST_TYPES.CHAR_CLASS, { ranges: [], chars: new Set(), negated: true, isWildcard: true });
    }

    // Standard character literal
    if (['|', '*', '+', '?', ')', '{', '}'].includes(char)) {
      throw new Error(`ParserError: Unexpected operator symbol "${char}" in expression`);
    }

    this.next();
    return new AstNode(AST_TYPES.LITERAL, { char });
  }

  parseBracketClass() {
    this.next(); // skip '['
    let negated = false;
    if (this.peek() === '^') {
      negated = true;
      this.next(); // skip '^'
    }

    const chars = new Set();
    const ranges = [];

    while (this.peek() !== null && this.peek() !== ']') {
      let char = this.next();
      if (char === '\\') {
        char = this.next();
        if (char === null) throw new Error('ParserError: Trailing escape inside bracket class');
      }

      if (this.peek() === '-') {
        this.next(); // skip '-'
        let endChar = this.next();
        if (endChar === null || endChar === ']') {
          // If '-' is at the end, treat it as a literal '-' character
          chars.add(char);
          chars.add('-');
          if (endChar === ']') {
            this.pos--; // put back ']'
          }
          continue;
        }
        if (endChar === '\\') {
          endChar = this.next();
          if (endChar === null) throw new Error('ParserError: Trailing escape inside bracket range');
        }
        if (char.charCodeAt(0) > endChar.charCodeAt(0)) {
          throw new Error(`ParserError: Invalid character range [${char}-${endChar}]`);
        }
        ranges.push([char, endChar]);
      } else {
        chars.add(char);
      }
    }

    if (this.next() !== ']') {
      throw new Error('ParserError: Unterminated bracket class expression');
    }

    return new AstNode(AST_TYPES.CHAR_CLASS, { ranges, chars, negated, isWildcard: false });
  }
}

// --- 3. Thompson NFA States Definition ---
let stateCounter = 0;

class NfaState {
  constructor() {
    this.id = stateCounter++;
    this.transitions = new Map(); // char -> Array(NfaState)
    this.epsilonTransitions = []; // Array(NfaState | { state: NfaState, checkFn: (remainingSlice) => boolean })
    this.isAccept = false;
  }

  addTransition(char, state) {
    if (!this.transitions.has(char)) {
      this.transitions.set(char, []);
    }
    this.transitions.get(char).push(state);
  }

  addEpsilonTransition(target) {
    this.epsilonTransitions.push(target);
  }
}

class Fragment {
  constructor(start, accept) {
    this.start = start;
    this.accept = accept;
  }
}

// --- 4. Thompson Construction Compiler & Fragment Cloning ---
function cloneState(state, visited = new Map()) {
  if (visited.has(state)) return visited.get(state);
  const copy = new NfaState();
  copy.isAccept = state.isAccept;
  visited.set(state, copy);

  for (const [key, targets] of state.transitions.entries()) {
    for (const t of targets) {
      copy.addTransition(key, cloneState(t, visited));
    }
  }
  for (const target of state.epsilonTransitions) {
    if (target instanceof NfaState) {
      copy.addEpsilonTransition(cloneState(target, visited));
    } else {
      // Epsilon conditional configuration copy
      copy.addEpsilonTransition({
        state: cloneState(target.state, visited),
        checkFn: target.checkFn
      });
    }
  }
  return copy;
}

function cloneFragment(frag) {
  const visited = new Map();
  const startCopy = cloneState(frag.start, visited);
  const acceptCopy = visited.get(frag.accept);
  return new Fragment(startCopy, acceptCopy);
}

export function compileAstToNfa(ast) {
  switch (ast.type) {
    case AST_TYPES.LITERAL: {
      const start = new NfaState();
      const accept = new NfaState();
      start.addTransition(ast.char, accept);
      return new Fragment(start, accept);
    }

    case AST_TYPES.CHAR_CLASS: {
      const start = new NfaState();
      const accept = new NfaState();

      const checkFn = (c) => {
        if (ast.isWildcard) {
          return c !== '\n' && c !== '\r';
        }

        let match = false;
        if (ast.chars.has(c)) {
          match = true;
        } else {
          for (const [startCh, endCh] of ast.ranges) {
            if (c >= startCh && c <= endCh) {
              match = true;
              break;
            }
          }
        }
        return ast.negated ? !match : match;
      };

      start.addTransition(checkFn, accept);
      return new Fragment(start, accept);
    }

    case AST_TYPES.CONCATENATION: {
      const leftFrag = compileAstToNfa(ast.left);
      const rightFrag = compileAstToNfa(ast.right);

      leftFrag.accept.addEpsilonTransition(rightFrag.start);
      return new Fragment(leftFrag.start, rightFrag.accept);
    }

    case AST_TYPES.ALTERNATION: {
      const leftFrag = compileAstToNfa(ast.left);
      const rightFrag = compileAstToNfa(ast.right);

      const start = new NfaState();
      const accept = new NfaState();

      start.addEpsilonTransition(leftFrag.start);
      start.addEpsilonTransition(rightFrag.start);

      leftFrag.accept.addEpsilonTransition(accept);
      rightFrag.accept.addEpsilonTransition(accept);

      return new Fragment(start, accept);
    }

    case AST_TYPES.QUANTIFIER: {
      const childFrag = compileAstToNfa(ast.child);

      if (ast.qType === '*') {
        const start = new NfaState();
        const accept = new NfaState();
        start.addEpsilonTransition(childFrag.start);
        start.addEpsilonTransition(accept);
        childFrag.accept.addEpsilonTransition(childFrag.start);
        childFrag.accept.addEpsilonTransition(accept);
        return new Fragment(start, accept);
      } 
      
      if (ast.qType === '+') {
        const start = new NfaState();
        const accept = new NfaState();
        start.addEpsilonTransition(childFrag.start);
        childFrag.accept.addEpsilonTransition(childFrag.start);
        childFrag.accept.addEpsilonTransition(accept);
        return new Fragment(start, accept);
      } 
      
      if (ast.qType === '?') {
        const start = new NfaState();
        const accept = new NfaState();
        start.addEpsilonTransition(childFrag.start);
        start.addEpsilonTransition(accept);
        childFrag.accept.addEpsilonTransition(accept);
        return new Fragment(start, accept);
      }

      if (ast.qType === 'range') {
        let currentFrag = null;

        // Compile mandatory copies
        for (let i = 0; i < ast.min; i++) {
          const copy = cloneFragment(childFrag);
          if (!currentFrag) {
            currentFrag = copy;
          } else {
            currentFrag.accept.addEpsilonTransition(copy.start);
            currentFrag = new Fragment(currentFrag.start, copy.accept);
          }
        }

        // If min === 0, compile an initial epsilon start-accept bridge
        if (ast.min === 0) {
          const start = new NfaState();
          const accept = new NfaState();
          start.addEpsilonTransition(accept);
          currentFrag = new Fragment(start, accept);
        }

        if (ast.max === Infinity) {
          const starCopy = compileAstToNfa(new AstNode(AST_TYPES.QUANTIFIER, { child: ast.child, qType: '*' }));
          currentFrag.accept.addEpsilonTransition(starCopy.start);
          currentFrag = new Fragment(currentFrag.start, starCopy.accept);
        } else {
          for (let i = ast.min; i < ast.max; i++) {
            const optCopy = cloneFragment(childFrag);
            const optStart = new NfaState();
            const optAccept = new NfaState();

            optStart.addEpsilonTransition(optCopy.start);
            optStart.addEpsilonTransition(optAccept);
            optCopy.accept.addEpsilonTransition(optAccept);

            currentFrag.accept.addEpsilonTransition(optStart);
            currentFrag = new Fragment(currentFrag.start, optAccept);
          }
        }

        return currentFrag;
      }

      throw new Error(`CompilerError: Unsupported quantifier type: ${ast.qType}`);
    }

    case AST_TYPES.LOOKAHEAD: {
      const childFrag = compileAstToNfa(ast.child);
      childFrag.accept.isAccept = true;

      const start = new NfaState();
      const accept = new NfaState();

      // Zero-width conditional assertion using lookahead state evaluation
      start.addEpsilonTransition({
        state: accept,
        checkFn: (remainingSlice) => {
          let currentStates = getEpsilonClosure([childFrag.start], remainingSlice);
          if (currentStates.has(childFrag.accept)) {
            return !ast.negated;
          }

          for (let i = 0; i < remainingSlice.length; i++) {
            const char = remainingSlice[i];
            const nextSlice = remainingSlice.slice(i + 1);
            currentStates = getNextStates(currentStates, char, nextSlice);
            if (currentStates.size === 0) break;
            if (currentStates.has(childFrag.accept)) {
              return !ast.negated;
            }
          }
          return ast.negated;
        }
      });

      return new Fragment(start, accept);
    }

    case AST_TYPES.EPSILON: {
      const start = new NfaState();
      const accept = new NfaState();
      start.addEpsilonTransition(accept);
      return new Fragment(start, accept);
    }

    default:
      throw new Error(`CompilerError: Unknown AST Node type "${ast.type}"`);
  }
}

// --- 5. NFA Epsilon Closure & Simulator ---
function getEpsilonClosure(states, remainingSlice = '') {
  const closure = new Set(states);
  const stack = Array.from(states);

  while (stack.length > 0) {
    const s = stack.pop();
    for (const transition of s.epsilonTransitions) {
      let targetState = null;
      let pass = true;

      if (transition instanceof NfaState) {
        targetState = transition;
      } else {
        targetState = transition.state;
        pass = transition.checkFn(remainingSlice);
      }

      if (pass && !closure.has(targetState)) {
        closure.add(targetState);
        stack.push(targetState);
      }
    }
  }

  return closure;
}

function getNextStates(currentStates, char, remainingSlice = '') {
  const nextStates = new Set();

  for (const s of currentStates) {
    for (const [key, targetStates] of s.transitions.entries()) {
      if (typeof key === 'function') {
        if (key(char)) {
          for (const target of targetStates) {
            nextStates.add(target);
          }
        }
      } else if (key === char) {
        for (const target of targetStates) {
          nextStates.add(target);
        }
      }
    }
  }

  return getEpsilonClosure(nextStates, remainingSlice);
}

// --- 6. Compiled Regex Container Engine ---
export class CompiledRegex {
  constructor(pattern) {
    stateCounter = 0;
    this.startsWithAnchor = false;
    this.endsWithAnchor = false;

    let processedPattern = pattern;
    if (processedPattern.startsWith('^')) {
      this.startsWithAnchor = true;
      processedPattern = processedPattern.slice(1);
    }
    if (processedPattern.endsWith('$') && !processedPattern.endsWith('\\$')) {
      this.endsWithAnchor = true;
      processedPattern = processedPattern.slice(0, -1);
    }

    const parser = new RegexParser(processedPattern);
    const ast = parser.parse();
    const frag = compileAstToNfa(ast);

    this.startState = frag.start;
    this.acceptState = frag.accept;
    this.acceptState.isAccept = true;
  }

  /**
   * Evaluates if the compiled pattern matches the input string according to anchors.
   */
  test(inputString) {
    if (this.startsWithAnchor && this.endsWithAnchor) {
      let currentStates = getEpsilonClosure([this.startState], inputString);
      for (let i = 0; i < inputString.length; i++) {
        const nextSlice = inputString.slice(i + 1);
        currentStates = getNextStates(currentStates, inputString[i], nextSlice);
        if (currentStates.size === 0) return false;
      }
      return currentStates.has(this.acceptState);
    }

    const match = this.search(inputString);
    if (!match) return false;

    if (this.startsWithAnchor && match.index !== 0) return false;
    if (this.endsWithAnchor && match.index + match.length !== inputString.length) return false;

    return true;
  }

  /**
   * Search for the first matching occurrence of the pattern in the input string.
   * Uses greedy evaluation to return the longest match at the earliest index.
   */
  search(text) {
    for (let start = 0; start <= text.length; start++) {
      const startSlice = text.slice(start);
      let currentStates = getEpsilonClosure([this.startState], startSlice);
      let bestEnd = -1;

      if (currentStates.has(this.acceptState)) {
        bestEnd = start; // Empty match support
      }

      for (let i = start; i < text.length; i++) {
        const char = text[i];
        const nextSlice = text.slice(i + 1);
        currentStates = getNextStates(currentStates, char, nextSlice);
        if (currentStates.size === 0) {
          break;
        }
        if (currentStates.has(this.acceptState)) {
          bestEnd = i + 1;
        }
      }

      if (bestEnd !== -1) {
        return {
          index: start,
          match: text.slice(start, bestEnd),
          length: bestEnd - start
        };
      }
    }
    return null;
  }

  /**
   * Find all non-overlapping match occurrences in the text.
   */
  matchAll(text) {
    const matches = [];
    let index = 0;
    while (index <= text.length) {
      const matchRes = this.search(text.slice(index));
      if (!matchRes) break;

      matches.push({
        index: index + matchRes.index,
        match: matchRes.match,
        length: matchRes.length
      });

      // Advance by matching length, or at least 1 index to prevent infinite loops
      index += matchRes.index + Math.max(1, matchRes.length);
    }
    return matches;
  }

  /**
   * Replace the first matching occurrence in the text.
   */
  replace(text, replacement) {
    const matchRes = this.search(text);
    if (!matchRes) return text;

    const before = text.slice(0, matchRes.index);
    const after = text.slice(matchRes.index + matchRes.length);
    
    const repl = typeof replacement === 'function' 
      ? replacement(matchRes.match, matchRes.index) 
      : replacement;
      
    return before + repl + after;
  }

  /**
   * Replace all matching occurrences in the text.
   */
  replaceAll(text, replacement) {
    const matches = this.matchAll(text);
    if (matches.length === 0) return text;

    let result = '';
    let lastIdx = 0;

    for (const m of matches) {
      result += text.slice(lastIdx, m.index);
      const repl = typeof replacement === 'function'
        ? replacement(m.match, m.index)
        : replacement;
      result += repl;
      lastIdx = m.index + m.length;
    }

    result += text.slice(lastIdx);
    return result;
  }
}

/**
 * Convenience builder helper.
 */
export function compileRegex(pattern) {
  return new CompiledRegex(pattern);
}
