/**
 * Monadic Parser Combinator library in pure JavaScript.
 * Tracks source code positions (index, line, column) to provide detailed syntax error logs.
 */

export class ParserState {
  constructor(input, index = 0, line = 1, column = 1, error = null) {
    this.input = input;
    this.index = index;
    this.line = line;
    this.column = column;
    this.error = error;
  }

  isError() {
    return this.error !== null;
  }

  advance(count) {
    if (count === 0) return this;
    
    let newLine = this.line;
    let newColumn = this.column;
    const end = Math.min(this.input.length, this.index + count);

    for (let i = this.index; i < end; i++) {
      const char = this.input[i];
      if (char === '\n') {
        newLine++;
        newColumn = 1;
      } else {
        newColumn++;
      }
    }

    return new ParserState(this.input, this.index + count, newLine, newColumn, null);
  }

  setError(msg) {
    const errorDetail = {
      message: msg,
      index: this.index,
      line: this.line,
      column: this.column
    };
    return new ParserState(this.input, this.index, this.line, this.column, errorDetail);
  }
}

export class ParserResult {
  constructor(state, value) {
    this.state = state;
    this.value = value;
  }
}

export class Parser {
  constructor(parseFn) {
    this.parseFn = parseFn;
  }

  run(input) {
    const initialState = new ParserState(input);
    return this.parseFn(initialState);
  }

  // Monadic Map (fmap)
  map(fn) {
    return new Parser(state => {
      const result = this.parseFn(state);
      if (result.state.isError()) return result;
      return new ParserResult(result.state, fn(result.value));
    });
  }

  // Monadic Bind (flatMap/chain)
  chain(fn) {
    return new Parser(state => {
      const result = this.parseFn(state);
      if (result.state.isError()) return result;
      const nextParser = fn(result.value);
      return nextParser.parseFn(result.state);
    });
  }

  // Combines two parsers, returning the result of the second
  then(nextParser) {
    return this.chain(() => nextParser);
  }

  // Combines two parsers, returning the result of the first
  skip(nextParser) {
    return this.chain(val => nextParser.map(() => val));
  }
}

// ---- Core Parsers ----

// Parses a single character matching a predicate
export function satisfy(predicate, expectedMsg) {
  return new Parser(state => {
    if (state.index >= state.input.length) {
      return new ParserResult(state.setError(`Unexpected EOF, expected ${expectedMsg}`), null);
    }
    const char = state.input[state.index];
    if (predicate(char)) {
      const nextState = state.advance(1);
      return new ParserResult(nextState, char);
    }
    return new ParserResult(state.setError(`Expected ${expectedMsg}, got "${char}"`), null);
  });
}

// Parses a specific character
export function char(c) {
  return satisfy(x => x === c, `'${c}'`);
}

// Parses a specific exact string
export function str(s) {
  return new Parser(state => {
    if (state.index + s.length > state.input.length) {
      return new ParserResult(state.setError(`Unexpected EOF, expected "${s}"`), null);
    }
    const chunk = state.input.slice(state.index, state.index + s.length);
    if (chunk === s) {
      const nextState = state.advance(s.length);
      return new ParserResult(nextState, s);
    }
    return new ParserResult(state.setError(`Expected "${s}", got "${chunk}"`), null);
  });
}

// Parses characters matching a regex pattern
export function regex(pattern, expectedMsg) {
  return new Parser(state => {
    const remainder = state.input.slice(state.index);
    const match = remainder.match(pattern);
    if (match && match.index === 0) {
      const matchedStr = match[0];
      const nextState = state.advance(matchedStr.length);
      return new ParserResult(nextState, matchedStr);
    }
    const gotSample = remainder.slice(0, 10);
    return new ParserResult(state.setError(`Expected ${expectedMsg}, got near "${gotSample}..."`), null);
  });
}

// Matches a lazy-evaluated parser (crucial for recursive parsers)
export function lazy(fn) {
  return new Parser(state => {
    const parser = fn();
    return parser.parseFn(state);
  });
}

// ---- Combinators ----

// Tries multiple parsers in sequence, returning the first success
export function choice(...parsers) {
  if (parsers.length === 0) {
    return new Parser(state => new ParserResult(state.setError('No choice parsers provided'), null));
  }
  return new Parser(state => {
    let lastErrorState = null;
    for (const parser of parsers) {
      const result = parser.parseFn(state);
      if (!result.state.isError()) {
        return result;
      }
      lastErrorState = result.state;
    }
    return new ParserResult(lastErrorState, null);
  });
}

// Runs parsers in sequence, returning an array of results
export function sequence(...parsers) {
  return new Parser(state => {
    const results = [];
    let currentState = state;
    for (const parser of parsers) {
      const result = parser.parseFn(currentState);
      if (result.state.isError()) {
        return result;
      }
      results.push(result.value);
      currentState = result.state;
    }
    return new ParserResult(currentState, results);
  });
}

// Matches zero or more times
export function many(parser) {
  return new Parser(state => {
    const results = [];
    let currentState = state;
    while (true) {
      const result = parser.parseFn(currentState);
      if (result.state.isError()) {
        break;
      }
      results.push(result.value);
      currentState = result.state;
    }
    return new ParserResult(currentState, results);
  });
}

// Matches one or more times
export function many1(parser) {
  return parser.chain(first => many(parser).map(rest => [first, ...rest]));
}

// Matches target parser separated by separator parser
export function sepBy(parser, separator) {
  return new Parser(state => {
    const results = [];
    let currentState = state;
    
    // Parse first item
    const firstResult = parser.parseFn(currentState);
    if (firstResult.state.isError()) {
      return new ParserResult(currentState, []);
    }
    results.push(firstResult.value);
    currentState = firstResult.state;

    while (true) {
      // Parse separator
      const sepResult = separator.parseFn(currentState);
      if (sepResult.state.isError()) {
        break;
      }
      // Parse next item
      const nextResult = parser.parseFn(sepResult.state);
      if (nextResult.state.isError()) {
        // Error on item after separator is a syntax error
        return nextResult;
      }
      results.push(nextResult.value);
      currentState = nextResult.state;
    }

    return new ParserResult(currentState, results);
  });
}

// Parse optionally, returning defaultValue if fails
export function optional(parser, defaultValue = null) {
  return new Parser(state => {
    const result = parser.parseFn(state);
    if (result.state.isError()) {
      return new ParserResult(state, defaultValue);
    }
    return result;
  });
}

// Helper to execute parser over string
export function parse(parser, input) {
  const result = parser.run(input);
  if (result.state.isError()) {
    const err = result.state.error;
    throw new SyntaxError(`${err.message} at line ${err.line}, col ${err.column} (index ${err.index})`);
  }
  return result.value;
}
