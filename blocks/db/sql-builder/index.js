/**
 * Chainable SQL Query String Builder
 */
export class SQLBuilder {
  constructor() {
    this.reset();
  }

  /**
   * Reset the builder state
   * @returns {SQLBuilder}
   */
  reset() {
    this.type = 'SELECT';
    this.table = '';
    this.columns = ['*'];
    this.wheres = [];
    this.joins = [];
    this.orderBys = [];
    this.limitVal = null;
    this.insertData = null;
    this.updateData = null;
    return this;
  }

  /**
   * Set columns for SELECT query
   * @param {...string} columns
   * @returns {SQLBuilder}
   */
  select(...columns) {
    this.type = 'SELECT';
    this.columns = columns.length > 0 ? columns : ['*'];
    return this;
  }

  /**
   * Set main table name
   * @param {string} table
   * @returns {SQLBuilder}
   */
  from(table) {
    this.table = table;
    return this;
  }

  /**
   * Add a WHERE condition
   *
   * @param {string} column
   * @param {string|*} operator - Operator (e.g. '>', '<>') or value if operator omitted
   * @param {*} [value] - Value parameter
   * @returns {SQLBuilder}
   */
  where(column, operator, value) {
    if (value === undefined) {
      this.wheres.push({ column, operator: '=', value: operator });
    } else {
      this.wheres.push({ column, operator, value });
    }
    return this;
  }

  /**
   * Add a join table clause
   *
   * @param {string} table - Join table
   * @param {string} onCondition - Match logic ('a.id = b.a_id')
   * @param {string} [type='INNER'] - Join type ('INNER' | 'LEFT' | 'RIGHT')
   * @returns {SQLBuilder}
   */
  join(table, onCondition, type = 'INNER') {
    this.joins.push({ table, onCondition, type });
    return this;
  }

  /**
   * Build INSERT query
   *
   * @param {string} table
   * @param {Object} data - Key value pairs to insert
   * @returns {SQLBuilder}
   */
  insert(table, data) {
    this.type = 'INSERT';
    this.table = table;
    this.insertData = data;
    return this;
  }

  /**
   * Build UPDATE query
   *
   * @param {string} table
   * @param {Object} data - Key value pairs to update
   * @returns {SQLBuilder}
   */
  update(table, data) {
    this.type = 'UPDATE';
    this.table = table;
    this.updateData = data;
    return this;
  }

  /**
   * Build DELETE query
   *
   * @param {string} table
   * @returns {SQLBuilder}
   */
  delete(table) {
    this.type = 'DELETE';
    this.table = table;
    return this;
  }

  /**
   * Set order by
   * @param {string} column
   * @param {string} [direction='ASC']
   * @returns {SQLBuilder}
   */
  orderBy(column, direction = 'ASC') {
    this.orderBys.push(`${column} ${direction}`);
    return this;
  }

  /**
   * Set limits
   * @param {number} limitVal
   * @returns {SQLBuilder}
   */
  limit(limitVal) {
    this.limitVal = limitVal;
    return this;
  }

  _escapeValue(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
    if (typeof val === 'boolean') return val ? '1' : '0';
    return String(val);
  }

  /**
   * Assemble state variables to construct the query string
   * @returns {string} Fully formatted SQL string
   */
  build() {
    if (!this.table) {
      throw new Error('InvalidQuery: Target table is not defined.');
    }

    if (this.type === 'SELECT') {
      let sql = `SELECT ${this.columns.join(', ')} FROM ${this.table}`;
      if (this.joins.length > 0) {
        for (const j of this.joins) {
          sql += ` ${j.type} JOIN ${j.table} ON ${j.onCondition}`;
        }
      }
      if (this.wheres.length > 0) {
        const whereClauses = this.wheres.map(w => `${w.column} ${w.operator} ${this._escapeValue(w.value)}`);
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
      }
      if (this.orderBys.length > 0) {
        sql += ` ORDER BY ${this.orderBys.join(', ')}`;
      }
      if (this.limitVal !== null) {
        sql += ` LIMIT ${this.limitVal}`;
      }
      return sql;
    }

    if (this.type === 'INSERT') {
      const keys = Object.keys(this.insertData);
      const vals = keys.map(k => this._escapeValue(this.insertData[k]));
      return `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${vals.join(', ')})`;
    }

    if (this.type === 'UPDATE') {
      const sets = Object.keys(this.updateData).map(k => `${k} = ${this._escapeValue(this.updateData[k])}`);
      let sql = `UPDATE ${this.table} SET ${sets.join(', ')}`;
      if (this.wheres.length > 0) {
        const whereClauses = this.wheres.map(w => `${w.column} ${w.operator} ${this._escapeValue(w.value)}`);
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
      }
      return sql;
    }

    if (this.type === 'DELETE') {
      let sql = `DELETE FROM ${this.table}`;
      if (this.wheres.length > 0) {
        const whereClauses = this.wheres.map(w => `${w.column} ${w.operator} ${this._escapeValue(w.value)}`);
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
      }
      return sql;
    }

    throw new Error('UnknownQueryType');
  }
}
export default SQLBuilder;
