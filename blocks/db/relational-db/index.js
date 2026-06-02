/**
 * Universal SQL Relational Database Engine.
 * Features:
 * 1. SQL Lexer & Parser (SELECT, INSERT, UPDATE, DELETE, CREATE TABLE).
 * 2. Column Constraints (PRIMARY KEY, UNIQUE, NOT NULL, types: INT, TEXT, BOOLEAN).
 * 3. In-memory Indexing Maps for fast unique keys constraints check.
 * 4. Query Executor supporting JOINs, logical WHERE conditions, ORDER BY, LIMIT.
 * 5. Transaction Journaling for safe rollbacks without replacing instances.
 * 6. Aggregate functions (COUNT, SUM, AVG, MIN, MAX).
 * 7. Grouping with GROUP BY & HAVING clauses.
 * 8. Multiple JOIN support.
 * 9. Subquery evaluation (IN and operator comparisons).
 * 10. Foreign Key Constraints (both inline and table-level references).
 */

// --- SQL Lexer & Token Types ---
const TOKEN_TYPES = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION'
};

function tokenize(sql) {
  const tokens = [];
  let index = 0;
  const keywords = new Set([
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE', 'CREATE', 'TABLE', 'INT', 'INTEGER', 'TEXT', 'VARCHAR', 'BOOLEAN',
    'PRIMARY', 'KEY', 'UNIQUE', 'NOT', 'NULL', 'JOIN', 'ON', 'AND', 'OR',
    'ORDER', 'BY', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'BEGIN', 'TRANSACTION', 'COMMIT', 'ROLLBACK',
    'INNER', 'LEFT', 'RIGHT', 'GROUP', 'HAVING', 'FOREIGN', 'REFERENCES',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'IN', 'TRUE', 'FALSE', 'AS'
  ]);

  while (index < sql.length) {
    const char = sql[index];

    if (/\s/.test(char)) {
      index++;
      continue;
    }

    if (char === ',' || char === '(' || char === ')' || char === ';') {
      tokens.push({ type: TOKEN_TYPES.PUNCTUATION, value: char });
      index++;
      continue;
    }

    if (/\d/.test(char)) {
      let num = '';
      while (index < sql.length && /\d/.test(sql[index])) {
        num += sql[index];
        index++;
      }
      tokens.push({ type: TOKEN_TYPES.NUMBER, value: Number(num) });
      continue;
    }

    const opMatch = sql.slice(index).match(/^(>=|<=|!=|<>|=|>|<)/);
    if (opMatch) {
      tokens.push({ type: TOKEN_TYPES.OPERATOR, value: opMatch[0] });
      index += opMatch[0].length;
      continue;
    }

    if (char === "'" || char === '"') {
      const quote = char;
      let str = '';
      index++;
      while (index < sql.length && sql[index] !== quote) {
        if (sql[index] === '\\') index++;
        str += sql[index];
        index++;
      }
      index++;
      tokens.push({ type: TOKEN_TYPES.STRING, value: str });
      continue;
    }

    if (/[a-zA-Z_*]/.test(char)) {
      let word = '';
      while (index < sql.length && /[a-zA-Z0-9_*.]/.test(sql[index])) {
        word += sql[index];
        index++;
      }
      const upper = word.toUpperCase();
      if (keywords.has(upper)) {
        tokens.push({ type: TOKEN_TYPES.KEYWORD, value: upper });
      } else {
        tokens.push({ type: TOKEN_TYPES.IDENTIFIER, value: word });
      }
      continue;
    }

    throw new Error(`LexerError: Unexpected token character "${char}" at index ${index}`);
  }

  return tokens;
}

// --- SQL Parser ---
export class SqlParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos];
  }

  next() {
    return this.tokens[this.pos++];
  }

  expectKeyword(val) {
    const tok = this.next();
    if (!tok || tok.type !== TOKEN_TYPES.KEYWORD || tok.value !== val) {
      throw new Error(`ParserError: Expected keyword "${val}", got "${tok ? tok.value : 'EOF'}"`);
    }
  }

  expectType(type) {
    const tok = this.next();
    if (!tok || tok.type !== type) {
      throw new Error(`ParserError: Expected token type ${type}, got "${tok ? tok.type : 'EOF'}"`);
    }
    return tok;
  }

  expectPunctuation(val) {
    const tok = this.next();
    if (!tok || tok.type !== TOKEN_TYPES.PUNCTUATION || tok.value !== val) {
      throw new Error(`ParserError: Expected punctuation "${val}", got "${tok ? tok.value : 'EOF'}"`);
    }
  }

  parse() {
    const tok = this.peek();
    if (!tok) throw new Error('ParserError: Empty query statement');

    if (tok.type === TOKEN_TYPES.KEYWORD) {
      switch (tok.value) {
        case 'CREATE':
          return this.parseCreate();
        case 'INSERT':
          return this.parseInsert();
        case 'SELECT':
          return this.parseSelect();
        case 'UPDATE':
          return this.parseUpdate();
        case 'DELETE':
          return this.parseDelete();
        case 'BEGIN':
          this.next();
          this.expectKeyword('TRANSACTION');
          return { type: 'BEGIN' };
        case 'COMMIT':
          this.next();
          return { type: 'COMMIT' };
        case 'ROLLBACK':
          this.next();
          return { type: 'ROLLBACK' };
        default:
          throw new Error(`ParserError: Unhandled instruction keyword: ${tok.value}`);
      }
    }
    throw new Error(`ParserError: Unexpected token: ${tok.value}`);
  }

  parseCreate() {
    this.next(); // skip CREATE
    this.expectKeyword('TABLE');
    const tableName = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
    this.expectPunctuation('(');

    const columns = [];
    const foreignKeys = [];

    while (this.pos < this.tokens.length) {
      const firstTok = this.peek();
      if (!firstTok) throw new Error('ParserError: Unexpected EOF in CREATE TABLE columns');

      // Support Table-level Foreign Key Constraint: FOREIGN KEY (col) REFERENCES ref_table(ref_col)
      if (firstTok.type === TOKEN_TYPES.KEYWORD && firstTok.value === 'FOREIGN') {
        this.next(); // skip FOREIGN
        this.expectKeyword('KEY');
        this.expectPunctuation('(');
        const colName = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
        this.expectPunctuation(')');
        this.expectKeyword('REFERENCES');
        const refTable = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
        this.expectPunctuation('(');
        const refCol = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
        this.expectPunctuation(')');

        foreignKeys.push({
          column: colName,
          referencesTable: refTable,
          referencesColumn: refCol
        });

        const nextTok = this.peek();
        if (nextTok && nextTok.type === TOKEN_TYPES.PUNCTUATION && nextTok.value === ',') {
          this.next(); // skip comma
          continue;
        } else {
          break;
        }
      }

      const colName = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
      const typeTok = this.next();
      if (!typeTok || typeTok.type !== TOKEN_TYPES.KEYWORD || !['INT', 'INTEGER', 'TEXT', 'VARCHAR', 'BOOLEAN'].includes(typeTok.value)) {
        throw new Error(`ParserError: Expected valid data type, got "${typeTok ? typeTok.value : 'EOF'}"`);
      }

      const col = {
        name: colName,
        type: typeTok.value === 'INTEGER' ? 'INT' : typeTok.value,
        primaryKey: false,
        unique: false,
        notNull: false,
        references: null
      };

      // Read constraints
      while (this.pos < this.tokens.length) {
        const pk = this.peek();
        if (pk && pk.type === TOKEN_TYPES.KEYWORD) {
          if (pk.value === 'PRIMARY') {
            this.next();
            this.expectKeyword('KEY');
            col.primaryKey = true;
            col.unique = true;
            col.notNull = true;
          } else if (pk.value === 'UNIQUE') {
            this.next();
            col.unique = true;
          } else if (pk.value === 'NOT') {
            this.next();
            this.expectKeyword('NULL');
            col.notNull = true;
          } else if (pk.value === 'REFERENCES') {
            this.next();
            const refTable = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
            this.expectPunctuation('(');
            const refCol = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
            this.expectPunctuation(')');
            col.references = { table: refTable, column: refCol };
          } else {
            break;
          }
        } else {
          break;
        }
      }

      columns.push(col);

      const nextTok = this.peek();
      if (nextTok && nextTok.type === TOKEN_TYPES.PUNCTUATION && nextTok.value === ',') {
        this.next(); // skip comma
      } else {
        break;
      }
    }

    this.expectPunctuation(')');
    return { type: 'CREATE_TABLE', name: tableName, columns, foreignKeys };
  }

  parseInsert() {
    this.next(); // skip INSERT
    this.expectKeyword('INTO');
    const tableName = this.expectType(TOKEN_TYPES.IDENTIFIER).value;

    let columns = null;
    const pk = this.peek();
    if (pk && pk.type === TOKEN_TYPES.PUNCTUATION && pk.value === '(') {
      this.next();
      columns = [];
      while (this.pos < this.tokens.length) {
        columns.push(this.expectType(TOKEN_TYPES.IDENTIFIER).value);
        const sep = this.peek();
        if (sep && sep.type === TOKEN_TYPES.PUNCTUATION && sep.value === ',') {
          this.next();
        } else {
          break;
        }
      }
      this.expectPunctuation(')');
    }

    this.expectKeyword('VALUES');
    this.expectPunctuation('(');

    const values = [];
    while (this.pos < this.tokens.length) {
      const vTok = this.next();
      if (!vTok || ![TOKEN_TYPES.NUMBER, TOKEN_TYPES.STRING, TOKEN_TYPES.KEYWORD].includes(vTok.type)) {
        throw new Error('ParserError: Expected literal value in VALUES');
      }

      let val = vTok.value;
      if (vTok.type === TOKEN_TYPES.KEYWORD) {
        if (val === 'NULL') val = null;
        else if (val === 'TRUE') val = true;
        else if (val === 'FALSE') val = false;
        else throw new Error(`ParserError: Invalid literal "${val}"`);
      }
      values.push(val);

      const sep = this.peek();
      if (sep && sep.type === TOKEN_TYPES.PUNCTUATION && sep.value === ',') {
        this.next();
      } else {
        break;
      }
    }

    this.expectPunctuation(')');
    return { type: 'INSERT', table: tableName, columns, values };
  }

  parseSelect() {
    this.next(); // skip SELECT
    const fields = [];

    // Fields
    while (this.pos < this.tokens.length) {
      const tok = this.next();
      let fieldSpec = null;

      if (tok.type === TOKEN_TYPES.KEYWORD && ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].includes(tok.value)) {
        const aggType = tok.value;
        this.expectPunctuation('(');
        const argTok = this.next();
        if (!argTok || (argTok.type !== TOKEN_TYPES.IDENTIFIER && argTok.value !== '*')) {
          throw new Error(`ParserError: Expected identifier or '*' in ${aggType}`);
        }
        this.expectPunctuation(')');
        fieldSpec = {
          type: 'AGGREGATE',
          aggType,
          field: argTok.value,
          name: `${aggType}(${argTok.value})`,
          alias: null
        };
      } else if (tok.type === TOKEN_TYPES.IDENTIFIER || (tok.type === TOKEN_TYPES.KEYWORD && tok.value === '*')) {
        fieldSpec = { type: 'FIELD', name: tok.value, alias: null };
      } else {
        throw new Error(`ParserError: Unexpected select item: ${tok.value}`);
      }

      const pk = this.peek();
      if (pk && pk.type === TOKEN_TYPES.KEYWORD && pk.value === 'AS') {
        this.next();
        fieldSpec.alias = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
      }

      fields.push(fieldSpec);

      const sep = this.peek();
      if (sep && sep.type === TOKEN_TYPES.PUNCTUATION && sep.value === ',') {
        this.next();
      } else {
        break;
      }
    }

    this.expectKeyword('FROM');
    const tableName = this.expectType(TOKEN_TYPES.IDENTIFIER).value;

    const joins = [];
    let whereSpec = null;
    let orderSpec = null;
    let limitVal = null;
    let groupByVal = null;
    let havingSpec = null;

    while (this.pos < this.tokens.length) {
      const tok = this.peek();
      if (!tok) break;

      if (tok.type === TOKEN_TYPES.KEYWORD) {
        if (tok.value === 'JOIN' || tok.value === 'INNER' || tok.value === 'LEFT') {
          joins.push(this.parseJoinExpression());
        } else if (tok.value === 'WHERE') {
          this.next();
          whereSpec = this.parseWhereExpression();
        } else if (tok.value === 'GROUP') {
          this.next();
          this.expectKeyword('BY');
          groupByVal = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
        } else if (tok.value === 'HAVING') {
          this.next();
          havingSpec = this.parseWhereExpression();
        } else if (tok.value === 'ORDER') {
          this.next();
          this.expectKeyword('BY');
          orderSpec = this.parseOrderBy();
        } else if (tok.value === 'LIMIT') {
          this.next();
          limitVal = this.expectType(TOKEN_TYPES.NUMBER).value;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return {
      type: 'SELECT',
      fields,
      from: tableName,
      joins,
      where: whereSpec,
      groupBy: groupByVal,
      having: havingSpec,
      orderBy: orderSpec,
      limit: limitVal
    };
  }

  parseJoinExpression() {
    let type = 'INNER';
    const first = this.next();
    if (first.value === 'LEFT' || first.value === 'INNER') {
      type = first.value;
      this.expectKeyword('JOIN');
    }

    const table = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
    this.expectKeyword('ON');

    const left = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
    const op = this.expectType(TOKEN_TYPES.OPERATOR).value;
    const right = this.expectType(TOKEN_TYPES.IDENTIFIER).value;

    return { type, table, left, operator: op, right };
  }

  parseWhereExpression() {
    const left = this.parseComparison();
    const pk = this.peek();
    if (pk && pk.type === TOKEN_TYPES.KEYWORD && (pk.value === 'AND' || pk.value === 'OR')) {
      const op = this.next().value;
      const right = this.parseWhereExpression();
      return { type: 'LOGICAL', operator: op, left, right };
    }
    return left;
  }

  parseComparison() {
    let left = '';
    const firstTok = this.peek();
    if (firstTok && firstTok.type === TOKEN_TYPES.KEYWORD && ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].includes(firstTok.value)) {
      this.next(); // skip function name
      this.expectPunctuation('(');
      const arg = this.next();
      if (!arg || (arg.type !== TOKEN_TYPES.IDENTIFIER && arg.value !== '*')) {
        throw new Error(`ParserError: Expected identifier or '*' inside aggregate in comparison`);
      }
      this.expectPunctuation(')');
      left = `${firstTok.value}(${arg.value})`;
    } else {
      left = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
    }

    const opTok = this.peek();

    if (opTok && opTok.type === TOKEN_TYPES.KEYWORD && opTok.value === 'IN') {
      this.next(); // skip IN
      this.expectPunctuation('(');
      const subquery = this.parseSelect();
      this.expectPunctuation(')');
      return { type: 'SUBQUERY', left, operator: 'IN', right: subquery };
    }

    const op = this.expectType(TOKEN_TYPES.OPERATOR).value;
    const rTok = this.peek();
    if (rTok && rTok.type === TOKEN_TYPES.PUNCTUATION && rTok.value === '(') {
      this.next(); // skip '('
      const subquery = this.parseSelect();
      this.expectPunctuation(')');
      return { type: 'SUBQUERY', left, operator: op, right: subquery };
    }

    const nextTok = this.next();
    if (!nextTok || ![TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.NUMBER, TOKEN_TYPES.STRING].includes(nextTok.type)) {
      throw new Error('ParserError: Invalid right comparison value');
    }
    return { type: 'COMPARISON', left, operator: op, right: nextTok.value, rightType: nextTok.type };
  }

  parseOrderBy() {
    const field = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
    let direction = 'ASC';
    const pk = this.peek();
    if (pk && pk.type === TOKEN_TYPES.KEYWORD && (pk.value === 'ASC' || pk.value === 'DESC')) {
      direction = this.next().value;
    }
    return { field, direction };
  }

  parseUpdate() {
    this.next(); // skip UPDATE
    const tableName = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
    this.expectKeyword('SET');

    const sets = [];
    while (this.pos < this.tokens.length) {
      const field = this.expectType(TOKEN_TYPES.IDENTIFIER).value;
      this.expectType(TOKEN_TYPES.OPERATOR); // expect '='
      const valTok = this.next();
      let val = valTok.value;
      if (valTok.type === TOKEN_TYPES.KEYWORD) {
        if (val === 'NULL') val = null;
        else if (val === 'TRUE') val = true;
        else if (val === 'FALSE') val = false;
      }
      sets.push({ field, value: val });

      const sep = this.peek();
      if (sep && sep.type === TOKEN_TYPES.PUNCTUATION && sep.value === ',') {
        this.next();
      } else {
        break;
      }
    }

    let where = null;
    const pk = this.peek();
    if (pk && pk.type === TOKEN_TYPES.KEYWORD && pk.value === 'WHERE') {
      this.next();
      where = this.parseWhereExpression();
    }

    return { type: 'UPDATE', table: tableName, sets, where };
  }

  parseDelete() {
    this.next(); // skip DELETE
    this.expectKeyword('FROM');
    const tableName = this.expectType(TOKEN_TYPES.IDENTIFIER).value;

    let where = null;
    const pk = this.peek();
    if (pk && pk.type === TOKEN_TYPES.KEYWORD && pk.value === 'WHERE') {
      this.next();
      where = this.parseWhereExpression();
    }

    return { type: 'DELETE', table: tableName, where };
  }
}

// --- Relational Engine table schemas & journaling ---
class Table {
  constructor(name, columns, foreignKeys = []) {
    this.name = name;
    this.columns = columns; // Array({ name, type, primaryKey, unique, notNull, references: { table, column } })
    this.foreignKeys = foreignKeys; // Array({ column, referencesTable, referencesColumn })
    this.rows = [];

    // Index map caches for fast unique checks: field -> Set(values)
    this.indexes = new Map();
    for (const col of columns) {
      if (col.unique || col.primaryKey) {
        this.indexes.set(col.name, new Set());
      }
    }
  }

  validateRow(row) {
    for (const col of this.columns) {
      const val = row[col.name];

      // Check notNull
      if (col.notNull && (val === undefined || val === null)) {
        throw new Error(`ConstraintViolation: Column "${col.name}" cannot be NULL`);
      }

      if (val !== undefined && val !== null) {
        // Check Type
        if (col.type === 'INT') {
          if (!Number.isInteger(val)) throw new TypeError(`TypeMismatch: Column "${col.name}" expected INTEGER`);
        } else if (col.type === 'BOOLEAN') {
          if (typeof val !== 'boolean') throw new TypeError(`TypeMismatch: Column "${col.name}" expected BOOLEAN`);
        } else if (col.type === 'TEXT' || col.type === 'VARCHAR') {
          if (typeof val !== 'string') throw new TypeError(`TypeMismatch: Column "${col.name}" expected string`);
        }

        // Check Unique constraint
        if (col.unique || col.primaryKey) {
          const indexSet = this.indexes.get(col.name);
          if (indexSet.has(val)) {
            throw new Error(`ConstraintViolation: Duplicate key error on Unique index "${col.name}" value: ${val}`);
          }
        }
      }
    }
  }
}

/**
 * SQL Relational Database System.
 */
export class RelationalDb {
  constructor() {
    this.tables = new Map(); // tableName -> Table
    this.inTransaction = false;
    this.journal = []; // transaction logs: Array({ type: 'INSERT'|'DELETE'|'UPDATE', table, snapshot, rowRef })
  }

  execute(sqlString) {
    const tokens = tokenize(sqlString);
    const parser = new SqlParser(tokens);
    const command = parser.parse();

    switch (command.type) {
      case 'BEGIN':
        this.beginTransaction();
        return 'Transaction started';
      case 'COMMIT':
        this.commit();
        return 'Transaction committed';
      case 'ROLLBACK':
        this.rollback();
        return 'Transaction rolled back';
      case 'CREATE_TABLE':
        return this.createTable(command.name, command.columns, command.foreignKeys);
      case 'INSERT':
        return this.insertRow(command.table, command.columns, command.values);
      case 'SELECT':
        return this.select(command);
      case 'UPDATE':
        return this.update(command);
      case 'DELETE':
        return this.deleteRows(command);
    }
  }

  createTable(name, columns, foreignKeys = []) {
    if (this.tables.has(name)) {
      throw new Error(`TableAlreadyExistsError: Table "${name}" already configured`);
    }
    const table = new Table(name, columns, foreignKeys);
    this.tables.set(name, table);
    return `Table "${name}" created successfully`;
  }

  insertRow(tableName, columns, values) {
    const table = this.tables.get(tableName);
    if (!table) throw new Error(`TableNotFoundError: Table "${tableName}" does not exist`);

    const colNames = columns || table.columns.map(c => c.name);
    if (colNames.length !== values.length) {
      throw new Error('InsertError: Column count does not match values count');
    }

    const row = {};
    for (let i = 0; i < table.columns.length; i++) {
      const col = table.columns[i];
      const valIdx = colNames.indexOf(col.name);
      row[col.name] = valIdx !== -1 ? values[valIdx] : null;
    }

    table.validateRow(row);
    this._checkReferentialIntegrity(table, row);

    // Insert row
    table.rows.push(row);

    // Update index sets
    for (const [col, indexSet] of table.indexes.entries()) {
      if (row[col] !== null && row[col] !== undefined) {
        indexSet.add(row[col]);
      }
    }

    // Write transaction log
    if (this.inTransaction) {
      this.journal.push({
        type: 'INSERT',
        table: tableName,
        rowRef: row
      });
    }

    return 1; // 1 row inserted
  }

  select(spec) {
    const table = this.tables.get(spec.from);
    if (!table) throw new Error(`TableNotFoundError: Table "${spec.from}" does not exist`);

    let rows = table.rows.map(r => ({ ...r }));

    // Handle joins
    if (spec.joins && spec.joins.length > 0) {
      for (const j of spec.joins) {
        const joinTable = this.tables.get(j.table);
        if (!joinTable) throw new Error(`TableNotFoundError: Join table "${j.table}" not found`);

        const joinedRows = [];
        const leftCol = j.left.includes('.') ? j.left.split('.')[1] : j.left;
        const rightCol = j.right.includes('.') ? j.right.split('.')[1] : j.right;

        const leftTableName = j.left.includes('.') ? j.left.split('.')[0] : table.name;
        const rightTableName = j.right.includes('.') ? j.right.split('.')[0] : joinTable.name;

        for (const leftRow of rows) {
          let matched = false;
          // Resolve left comparison value
          const leftVal = leftRow[`${leftTableName}.${leftCol}`] !== undefined 
            ? leftRow[`${leftTableName}.${leftCol}`] 
            : leftRow[leftCol];

          for (const rightRow of joinTable.rows) {
            const rightVal = rightRow[rightCol];
            if (leftVal === rightVal) {
              matched = true;
              const merged = { ...leftRow };
              // Assign fields with table prefixes
              for (const col of joinTable.columns) {
                merged[`${joinTable.name}.${col.name}`] = rightRow[col.name];
              }
              // Also ensure left row has prefixes
              for (const col of table.columns) {
                if (merged[`${table.name}.${col.name}`] === undefined) {
                  merged[`${table.name}.${col.name}`] = leftRow[col.name];
                }
              }
              joinedRows.push(merged);
            }
          }

          if (!matched && j.type === 'LEFT') {
            const merged = { ...leftRow };
            for (const col of joinTable.columns) {
              merged[`${joinTable.name}.${col.name}`] = null;
            }
            for (const col of table.columns) {
              if (merged[`${table.name}.${col.name}`] === undefined) {
                merged[`${table.name}.${col.name}`] = leftRow[col.name];
              }
            }
            joinedRows.push(merged);
          }
        }
        rows = joinedRows;
      }
    }

    // Filter using WHERE conditions
    if (spec.where) {
      rows = rows.filter(row => this._evaluateWhere(row, spec.where));
    }

    // Handle Aggregations & GROUP BY
    const hasAggregates = spec.fields.some(f => f.type === 'AGGREGATE');
    if (spec.groupBy || hasAggregates) {
      const groups = new Map();

      for (const row of rows) {
        let groupKey = 'ALL';
        if (spec.groupBy) {
          const val = row[spec.groupBy] !== undefined ? row[spec.groupBy] : row[`${table.name}.${spec.groupBy}`];
          groupKey = String(val);
        }

        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey).push(row);
      }

      const groupedRows = [];
      for (const [key, groupRows] of groups.entries()) {
        const aggregatedRow = {};

        // Evaluate aggregate and grouping fields
        for (const field of spec.fields) {
          if (field.type === 'AGGREGATE') {
            const { aggType, field: colName } = field;

            const vals = groupRows.map(r => {
              let val = r[colName];
              if (val === undefined) {
                val = r[`${table.name}.${colName}`];
              }
              if (val === undefined && spec.joins) {
                for (const j of spec.joins) {
                  if (r[`${j.table}.${colName}`] !== undefined) {
                    val = r[`${j.table}.${colName}`];
                    break;
                  }
                }
              }
              return val;
            }).filter(v => v !== null && v !== undefined);

            let result = null;
            if (aggType === 'COUNT') {
              result = colName === '*' ? groupRows.length : vals.length;
            } else if (aggType === 'SUM') {
              result = vals.reduce((sum, v) => sum + (Number(v) || 0), 0);
            } else if (aggType === 'AVG') {
              result = vals.length > 0 ? vals.reduce((sum, v) => sum + (Number(v) || 0), 0) / vals.length : null;
            } else if (aggType === 'MIN') {
              result = vals.length > 0 ? Math.min(...vals) : null;
            } else if (aggType === 'MAX') {
              result = vals.length > 0 ? Math.max(...vals) : null;
            }
            aggregatedRow[field.name] = result;
          } else {
            const firstRow = groupRows[0];
            let val = firstRow[field.name];
            if (val === undefined) {
              val = firstRow[`${table.name}.${field.name}`];
            }
            if (val === undefined && spec.joins) {
              for (const j of spec.joins) {
                if (firstRow[`${j.table}.${field.name}`] !== undefined) {
                  val = firstRow[`${j.table}.${field.name}`];
                  break;
                }
              }
            }
            aggregatedRow[field.name] = val;
          }
        }

        // Expose all fields to aggregatedRow for HAVING clause checking
        if (groupRows.length > 0) {
          const firstRow = groupRows[0];
          for (const k of Object.keys(firstRow)) {
            if (aggregatedRow[k] === undefined) {
              aggregatedRow[k] = firstRow[k];
            }
          }
        }

        groupedRows.push(aggregatedRow);
      }

      rows = groupedRows;

      if (spec.having) {
        rows = rows.filter(row => this._evaluateWhere(row, spec.having));
      }
    }

    // Sorting
    if (spec.orderBy) {
      const field = spec.orderBy.field;
      const dir = spec.orderBy.direction === 'DESC' ? -1 : 1;
      rows.sort((a, b) => {
        if (a[field] < b[field]) return -1 * dir;
        if (a[field] > b[field]) return 1 * dir;
        return 0;
      });
    }

    // Limit & Offset
    if (spec.limit !== null) {
      rows = rows.slice(0, spec.limit);
    }

    // Project fields mapping
    if (spec.fields.length === 1 && spec.fields[0].name === '*') {
      return rows;
    }

    return rows.map(row => {
      const projected = {};
      for (const field of spec.fields) {
        if (field.type === 'AGGREGATE') {
          projected[field.alias || field.name] = row[field.name];
        } else {
          let val = row[field.name];
          if (val === undefined) {
            val = row[`${table.name}.${field.name}`];
          }
          if (val === undefined && spec.joins) {
            for (const j of spec.joins) {
              if (row[`${j.table}.${field.name}`] !== undefined) {
                val = row[`${j.table}.${field.name}`];
                break;
              }
            }
          }
          projected[field.alias || field.name] = val;
        }
      }
      return projected;
    });
  }

  update(spec) {
    const table = this.tables.get(spec.table);
    if (!table) throw new Error(`TableNotFoundError: Table "${spec.table}" does not exist`);

    let count = 0;
    for (const row of table.rows) {
      if (!spec.where || this._evaluateWhere(row, spec.where)) {
        // Record log journal prior to update
        if (this.inTransaction) {
          this.journal.push({
            type: 'UPDATE',
            table: spec.table,
            rowRef: row,
            snapshot: { ...row }
          });
        }

        // Apply mutations
        const oldIndexVals = {};
        for (const colName of table.indexes.keys()) {
          oldIndexVals[colName] = row[colName];
        }

        const updatedRow = { ...row };
        for (const set of spec.sets) {
          updatedRow[set.field] = set.value;
        }

        // Check foreign keys and constraints
        this._checkReferentialIntegrity(table, updatedRow);

        for (const colName of table.indexes.keys()) {
          table.indexes.get(colName).delete(oldIndexVals[colName]);
        }

        try {
          table.validateRow(updatedRow);
        } catch (err) {
          // Restore indexes on failure
          for (const colName of table.indexes.keys()) {
            if (oldIndexVals[colName] !== null && oldIndexVals[colName] !== undefined) {
              table.indexes.get(colName).add(oldIndexVals[colName]);
            }
          }
          throw err;
        }

        // Save mutations
        Object.assign(row, updatedRow);

        // Commit index updates
        for (const colName of table.indexes.keys()) {
          if (row[colName] !== null && row[colName] !== undefined) {
            table.indexes.get(colName).add(row[colName]);
          }
        }

        count++;
      }
    }
    return count;
  }

  deleteRows(spec) {
    const table = this.tables.get(spec.table);
    if (!table) throw new Error(`TableNotFoundError: Table "${spec.table}" does not exist`);

    const remaining = [];
    const deleted = [];

    for (const row of table.rows) {
      if (!spec.where || this._evaluateWhere(row, spec.where)) {
        this._checkDeleteReferentialIntegrity(table, row);
        deleted.push(row);
      } else {
        remaining.push(row);
      }
    }

    table.rows = remaining;

    // Prune indexes
    for (const row of deleted) {
      for (const [col, indexSet] of table.indexes.entries()) {
        if (row[col] !== null && row[col] !== undefined) {
          indexSet.delete(row[col]);
        }
      }

      if (this.inTransaction) {
        this.journal.push({
          type: 'DELETE',
          table: spec.table,
          snapshot: row
        });
      }
    }

    return deleted.length;
  }

  beginTransaction() {
    if (this.inTransaction) throw new Error('TransactionAlreadyStartedError');
    this.inTransaction = true;
    this.journal = [];
  }

  commit() {
    if (!this.inTransaction) throw new Error('NoActiveTransactionError');
    this.journal = [];
    this.inTransaction = false;
  }

  rollback() {
    if (!this.inTransaction) throw new Error('NoActiveTransactionError');

    // Undo transaction logs in reverse
    for (let i = this.journal.length - 1; i >= 0; i--) {
      const log = this.journal[i];
      const table = this.tables.get(log.table);

      if (log.type === 'INSERT') {
        const idx = table.rows.indexOf(log.rowRef);
        if (idx !== -1) {
          table.rows.splice(idx, 1);
        }
        for (const [col, indexSet] of table.indexes.entries()) {
          if (log.rowRef[col] !== null && log.rowRef[col] !== undefined) {
            indexSet.delete(log.rowRef[col]);
          }
        }
      } else if (log.type === 'DELETE') {
        table.rows.push(log.snapshot);
        for (const [col, indexSet] of table.indexes.entries()) {
          if (log.snapshot[col] !== null && log.snapshot[col] !== undefined) {
            indexSet.add(log.snapshot[col]);
          }
        }
      } else if (log.type === 'UPDATE') {
        for (const colName of table.indexes.keys()) {
          table.indexes.get(colName).delete(log.rowRef[colName]);
        }
        Object.assign(log.rowRef, log.snapshot);
        for (const colName of table.indexes.keys()) {
          if (log.rowRef[colName] !== null && log.rowRef[colName] !== undefined) {
            table.indexes.get(colName).add(log.rowRef[colName]);
          }
        }
      }
    }

    this.journal = [];
    this.inTransaction = false;
  }

  _evaluateWhere(row, expr) {
    if (expr.type === 'LOGICAL') {
      const leftVal = this._evaluateWhere(row, expr.left);
      const rightVal = this._evaluateWhere(row, expr.right);
      return expr.operator === 'AND' ? leftVal && rightVal : leftVal || rightVal;
    }

    if (expr.type === 'SUBQUERY') {
      const leftVal = row[expr.left];
      const results = this.select(expr.right);
      const values = results.map(r => Object.values(r)[0]);

      if (expr.operator === 'IN') {
        return values.includes(leftVal);
      }
      if (expr.operator === '=') {
        return leftVal === values[0];
      }
      if (expr.operator === '!=') {
        return leftVal !== values[0];
      }
      return false;
    }

    // Comparison evaluation
    const leftVal = row[expr.left];
    const rightVal = expr.right;

    switch (expr.operator) {
      case '=': return leftVal === rightVal;
      case '!=':
      case '<>': return leftVal !== rightVal;
      case '>': return leftVal > rightVal;
      case '>=': return leftVal >= rightVal;
      case '<': return leftVal < rightVal;
      case '<=': return leftVal <= rightVal;
      default: return false;
    }
  }

  _checkReferentialIntegrity(table, row) {
    // Check inline references constraints
    for (const col of table.columns) {
      if (col.references) {
        const val = row[col.name];
        if (val !== null && val !== undefined) {
          const parentTable = this.tables.get(col.references.table);
          if (!parentTable) {
            throw new Error(`ReferentialViolation: Referenced table "${col.references.table}" does not exist`);
          }
          const parentIndex = parentTable.indexes.get(col.references.column);
          if (!parentIndex || !parentIndex.has(val)) {
            throw new Error(`ReferentialViolation: Key (${col.name}=${val}) is not present in table "${parentTable.name}"`);
          }
        }
      }
    }

    // Check table-level foreign keys
    for (const fk of table.foreignKeys) {
      const val = row[fk.column];
      if (val !== null && val !== undefined) {
        const parentTable = this.tables.get(fk.referencesTable);
        if (!parentTable) {
          throw new Error(`ReferentialViolation: Referenced table "${fk.referencesTable}" does not exist`);
        }
        const parentIndex = parentTable.indexes.get(fk.referencesColumn);
        if (!parentIndex || !parentIndex.has(val)) {
          throw new Error(`ReferentialViolation: Foreign key (${fk.column}=${val}) references non-existent parent value in "${parentTable.name}"`);
        }
      }
    }
  }

  _checkDeleteReferentialIntegrity(parentTable, parentRow) {
    // Check all tables to ensure they do not reference the deleted keys
    for (const [tName, table] of this.tables.entries()) {
      // Check column inline references
      for (const col of table.columns) {
        if (col.references && col.references.table === parentTable.name) {
          const parentKeyVal = parentRow[col.references.column];
          for (const row of table.rows) {
            if (row[col.name] === parentKeyVal) {
              throw new Error(`ReferentialViolation: Cannot delete from "${parentTable.name}" because table "${tName}" has references to this key`);
            }
          }
        }
      }

      // Check table-level foreign keys
      for (const fk of table.foreignKeys) {
        if (fk.referencesTable === parentTable.name) {
          const parentKeyVal = parentRow[fk.referencesColumn];
          for (const row of table.rows) {
            if (row[fk.column] === parentKeyVal) {
              throw new Error(`ReferentialViolation: Cannot delete from "${parentTable.name}" because table "${tName}" has references to this key`);
            }
          }
        }
      }
    }
  }
}
