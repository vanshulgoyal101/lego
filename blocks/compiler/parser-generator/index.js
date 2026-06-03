export class LL1ParserGenerator {
  /**
   * Generates LL(1) parse tables, FIRST, and FOLLOW sets from a grammar.
   * @param {Object} grammar - E.g. { E: [['T', "E'"]], ... }
   * @param {string} startSymbol - The start symbol of the grammar
   * @param {string[]} terminals - List of terminal strings
   * @param {string} [epsilon='ε'] - Epsilon placeholder
   * @returns {Object} { first, follow, parseTable }
   */
  static generate(grammar, startSymbol, terminals, epsilon = 'ε') {
    const nonTerminals = Object.keys(grammar);
    const first = {};
    const follow = {};

    // Initialize FIRST and FOLLOW sets
    for (const nt of nonTerminals) {
      first[nt] = new Set();
      follow[nt] = new Set();
    }
    follow[startSymbol].add('$'); // EOF marker

    const isTerminal = (sym) => terminals.includes(sym) || sym === '$';

    // 1. Compute FIRST sets iteratively until no more changes occur
    let changed = true;
    while (changed) {
      changed = false;
      for (const nt of nonTerminals) {
        const productions = grammar[nt];
        for (const prod of productions) {
          const beforeSize = first[nt].size;

          let allEpsilon = true;
          for (const sym of prod) {
            if (sym === epsilon) {
              first[nt].add(epsilon);
              break;
            } else if (isTerminal(sym)) {
              first[nt].add(sym);
              allEpsilon = false;
              break;
            } else {
              // Non-terminal
              for (const f of first[sym]) {
                if (f !== epsilon) {
                  first[nt].add(f);
                }
              }
              if (!first[sym].has(epsilon)) {
                allEpsilon = false;
                break;
              }
            }
          }
          if (allEpsilon) {
            first[nt].add(epsilon);
          }

          if (first[nt].size > beforeSize) {
            changed = true;
          }
        }
      }
    }

    // Helper to find FIRST of a sequence of symbols
    const getFirstOfSequence = (seq) => {
      const result = new Set();
      let allEpsilon = true;
      for (const sym of seq) {
        if (sym === epsilon) {
          result.add(epsilon);
          break;
        } else if (isTerminal(sym)) {
          result.add(sym);
          allEpsilon = false;
          break;
        } else {
          for (const f of first[sym]) {
            if (f !== epsilon) {
              result.add(f);
            }
          }
          if (!first[sym].has(epsilon)) {
            allEpsilon = false;
            break;
          }
        }
      }
      if (allEpsilon) {
        result.add(epsilon);
      }
      return result;
    };

    // 2. Compute FOLLOW sets
    changed = true;
    while (changed) {
      changed = false;
      for (const nt of nonTerminals) {
        const productions = grammar[nt];
        for (const prod of productions) {
          for (let i = 0; i < prod.length; i++) {
            const B = prod[i];
            if (nonTerminals.includes(B)) {
              const beforeSize = follow[B].size;

              // Get FIRST of everything following B
              const rest = prod.slice(i + 1);
              const firstRest = getFirstOfSequence(rest);

              for (const f of firstRest) {
                if (f !== epsilon) {
                  follow[B].add(f);
                }
              }

              if (firstRest.has(epsilon) || rest.length === 0) {
                for (const f of follow[nt]) {
                  follow[B].add(f);
                }
              }

              if (follow[B].size > beforeSize) {
                changed = true;
              }
            }
          }
        }
      }
    }

    // 3. Construct Parse Table
    const parseTable = {};
    for (const nt of nonTerminals) {
      parseTable[nt] = {};
    }

    for (const nt of nonTerminals) {
      const productions = grammar[nt];
      for (const prod of productions) {
        const firstProd = getFirstOfSequence(prod);

        for (const a of firstProd) {
          if (a !== epsilon) {
            if (parseTable[nt][a]) {
              throw new Error(`Grammar is not LL(1): Conflict at [${nt}, ${a}]`);
            }
            parseTable[nt][a] = prod;
          }
        }

        if (firstProd.has(epsilon)) {
          for (const b of follow[nt]) {
            if (parseTable[nt][b]) {
              throw new Error(`Grammar is not LL(1): Conflict at [${nt}, ${b}]`);
            }
            parseTable[nt][b] = prod;
          }
        }
      }
    }

    // Convert sets to arrays for easy JSON consumption
    const firstObj = {};
    const followObj = {};
    for (const nt of nonTerminals) {
      firstObj[nt] = Array.from(first[nt]);
      followObj[nt] = Array.from(follow[nt]);
    }

    return { first: firstObj, follow: followObj, parseTable };
  }
}
