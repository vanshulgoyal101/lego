/**
 * SQL Lexical Scanner and Query Parser.
 * Compiles basic SELECT statements into structured Abstract Syntax Trees (ASTs).
 * Supports: fields, alias, JOINs (ON conditions), WHERE (logical AND/OR), ORDER BY, LIMIT, OFFSET.
 */

// Token types
const TOKEN_TYPES = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION'
};

// SQL Lexer
function tokenize(sql) {
  const tokens = [];
  let index = 0;
  const keywords = new Set([
    'SELECT', 'FROM', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'ON', 'WHERE',
    'AND', 'OR', 'ORDER', 'BY', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'AS'
  ]);

  while (index < sql.length) {
    const char = sql[index];

    // Whitespace
    if (/\s/.test(char)) {
      index++;
      continue;
    }

    // Punctuation
    if (char === ',' || char === '(' || char === ')') {
      tokens.push({ type: TOKEN_TYPES.PUNCTUATION, value: char });
      index++;
      continue;
    }

    // Numbers
    if (/\d/.test(char)) {
      let num = '';
      while (index < sql.length && /\d/.test(sql[index])) {
        num += sql[index];
        index++;
      }
      tokens.push({ type: TOKEN_TYPES.NUMBER, value: Number(num) });
      continue;
    }

    // Operators
    const opMatch = sql.slice(index).match(/^(>=|<=|!=|<>|=|>|<)/);
    if (opMatch) {
      tokens.push({ type: TOKEN_TYPES.OPERATOR, value: opMatch[0] });
      index += opMatch[0].length;
      continue;
    }

    // Strings
    if (char === "'" || char === '"') {
      const quote = char;
      let str = '';
      index++; // Skip opening quote
      while (index < sql.length && sql[index] !== quote) {
        if (sql[index] === '\\') {
          index++;
        }
        str += sql[index];
        index++;
      }
      index++; // Skip closing quote
      tokens.push({ type: TOKEN_TYPES.STRING, value: str });
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_*]/.test(char)) {
      let word = '';
      while (index < sql.length && /[a-zA-Z0-9_*.]/.test(sql[index])) {
        word += sql[index];
        index++;
      }
      const upperWord = word.toUpperCase();
      if (keywords.has(upperWord)) {
        tokens.push({ type: TOKEN_TYPES.KEYWORD, value: upperWord });
      } else {
        tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: word });
      }
      continue;
    }

    throw new Error(`LexerError: Unexpected character "${char}" at index ${index}`);
  }

  return tokens;
}

/**
 * Parses SQL Select statement tokens into an AST.
 */
export function parseSql(sql) {
  const tokens = tokenize(sql);
  let pos = 0;

  function peek() {
    return tokens[pos];
  }

  function next() {
    return tokens[pos++];
  }

  function expectKeyword(value) {
    const tok = next();
    if (!tok || tok.type !== TOKEN_TYPES.KEYWORD || tok.value !== value) {
      throw new Error(`ParserError: Expected keyword "${value}", got ${tok ? tok.value : 'EOF'}`);
    }
  }

  // AST root
  const ast = {
    type: 'SELECT',
    fields: [],
    from: null,
    joins: [],
    where: null,
    orderBy: null,
    limit: null,
    offset: null
  };

  expectKeyword('SELECT');

  // Parse Fields
  while (pos < tokens.length) {
    const tok = next();
    if (!tok) break;

    if (tok.type === TOKEN_TYPES.IDENTIFIER || (tok.type === TOKEN_TYPES.KEYWORD && tok.value === '*')) {
      let field = { name: tok.value, alias: null };
      
      // Check for AS alias
      const pk = peek();
      if (pk && pk.type === TOKEN_TYPES.KEYWORD && pk.value === 'AS') {
        next(); // skip 'AS'
        const aliasTok = next();
        if (aliasTok && aliasTok.type === TOKEN_TYPES.IDENTIFIER) {
          field.alias = aliasTok.value;
        }
      }
      ast.fields.push(field);
    }

    const nextTok = peek();
    if (nextTok && nextTok.type === TOKEN_TYPES.PUNCTUATION && nextTok.value === ',') {
      next(); // skip comma
    } else {
      break;
    }
  }

  expectKeyword('FROM');
  
  const tableTok = next();
  if (!tableTok || tableTok.type !== TOKEN_TYPES.IDENTIFIER) {
    throw new Error('ParserError: Expected table name identifier after FROM');
  }
  ast.from = tableTok.value;

  // Parse JOINS, WHERE, ORDER BY, LIMIT, OFFSET loop
  while (pos < tokens.length) {
    const tok = peek();
    if (!tok) break;

    if (tok.type === TOKEN_TYPES.KEYWORD) {
      if (tok.value === 'JOIN' || tok.value === 'LEFT' || tok.value === 'RIGHT' || tok.value === 'INNER') {
        parseJoin();
      } else if (tok.value === 'WHERE') {
        next(); // skip 'WHERE'
        ast.where = parseWhereExpression();
      } else if (tok.value === 'ORDER') {
        next(); // skip 'ORDER'
        expectKeyword('BY');
        ast.orderBy = parseOrderBy();
      } else if (tok.value === 'LIMIT') {
        next(); // skip 'LIMIT'
        const lim = next();
        if (!lim || lim.type !== TOKEN_TYPES.NUMBER) throw new Error('ParserError: Expected number limit value');
        ast.limit = lim.value;
      } else if (tok.value === 'OFFSET') {
        next(); // skip 'OFFSET'
        const off = next();
        if (!off || off.type !== TOKEN_TYPES.NUMBER) throw new Error('ParserError: Expected number offset value');
        ast.offset = off.value;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  function parseJoin() {
    let joinType = 'INNER';
    const firstTok = next(); // skip first join type word or JOIN keyword
    if (firstTok.value === 'LEFT' || firstTok.value === 'RIGHT' || firstTok.value === 'INNER') {
      joinType = firstTok.value;
      let nextTok = next();
      if (nextTok.value === 'OUTER') {
        nextTok = next();
      }
      if (nextTok.value !== 'JOIN') {
        throw new Error(`ParserError: Expected "JOIN" keyword, got "${nextTok.value}"`);
      }
    }

    const joinTable = next();
    if (!joinTable || joinTable.type !== TOKEN_TYPES.IDENTIFIER) {
      throw new Error('ParserError: Expected join table name identifier');
    }

    expectKeyword('ON');

    const leftCol = next();
    const op = next();
    const rightCol = next();

    if (!leftCol || !op || !rightCol) {
      throw new Error('ParserError: Malformed JOIN ON condition');
    }

    ast.joins.push({
      type: joinType,
      table: joinTable.value,
      condition: {
        left: leftCol.value,
        operator: op.value,
        right: rightCol.value
      }
    });
  }

  function parseWhereExpression() {
    const left = parseComparison();
    const pk = peek();
    if (pk && pk.type === TOKEN_TYPES.KEYWORD && (pk.value === 'AND' || pk.value === 'OR')) {
      const op = next();
      const right = parseWhereExpression();
      return {
        type: 'LOGICAL',
        operator: op.value,
        left,
        right
      };
    }
    return left;
  }

  function parseComparison() {
    const left = next();
    const op = next();
    const right = next();

    if (!left || !op || !right) {
      throw new Error('ParserError: Malformed WHERE comparison clause');
    }

    return {
      type: 'COMPARISON',
      left: left.value,
      operator: op.value,
      right: right.value
    };
  }

  function parseOrderBy() {
    const orders = [];
    while (pos < tokens.length) {
      const field = next();
      if (!field || field.type !== TOKEN_TYPES.IDENTIFIER) {
        throw new Error('ParserError: Expected field identifier in ORDER BY');
      }

      let dir = 'ASC';
      const pk = peek();
      if (pk && pk.type === TOKEN_TYPES.KEYWORD && (pk.value === 'ASC' || pk.value === 'DESC')) {
        dir = next().value;
      }

      orders.push({ field: field.value, direction: dir });

      const sep = peek();
      if (sep && sep.type === TOKEN_TYPES.PUNCTUATION && sep.value === ',') {
        next(); // skip comma
      } else {
        break;
      }
    }
    return orders;
  }

  return ast;
}
