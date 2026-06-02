/**
 * A lightweight SQL query builder helper.
 * Generates SQL query strings and corresponding parameterized parameter bindings
 * to avoid SQL injection attacks.
 */
export class SqlQueryBuilder {
  constructor(table) {
    this.table = table;
    this.operation = 'SELECT';
    this.columnsList = ['*'];
    this.wheres = [];
    this.bindings = [];
    this.updatesMap = {};
    this.insertMap = {};
    this.limitVal = null;
    this.orderByVal = null;
  }

  /**
   * Set columns to fetch in SELECT.
   * @param {...string} columns
   * @returns {SqlQueryBuilder}
   */
  select(...columns) {
    this.operation = 'SELECT';
    this.columnsList = columns.length > 0 ? columns : ['*'];
    return this;
  }

  /**
   * Set WHERE query conditions.
   * @param {string} column
   * @param {*} value
   * @param {string} [operator="="]
   * @returns {SqlQueryBuilder}
   */
  where(column, value, operator = '=') {
    this.wheres.push({ column, operator, bindingIndex: this.bindings.length + 1 });
    this.bindings.push(value);
    return this;
  }

  /**
   * Build INSERT operation.
   * @param {Object} data - Key-value insert object.
   * @returns {SqlQueryBuilder}
   */
  insert(data) {
    this.operation = 'INSERT';
    this.insertMap = data;
    Object.entries(data).forEach(([_, val]) => {
      this.bindings.push(val);
    });
    return this;
  }

  /**
   * Build UPDATE operation.
   * @param {Object} data - Key-value update properties object.
   * @returns {SqlQueryBuilder}
   */
  update(data) {
    this.operation = 'UPDATE';
    this.updatesMap = data;
    Object.entries(data).forEach(([_, val]) => {
      this.bindings.push(val);
    });
    return this;
  }

  /**
   * Build DELETE operation.
   * @returns {SqlQueryBuilder}
   */
  delete() {
    this.operation = 'DELETE';
    return this;
  }

  /**
   * Set LIMIT criteria.
   * @param {number} count
   * @returns {SqlQueryBuilder}
   */
  limit(count) {
    this.limitVal = count;
    return this;
  }

  /**
   * Set ORDER BY criteria.
   * @param {string} column
   * @param {string} [direction="ASC"]
   * @returns {SqlQueryBuilder}
   */
  orderBy(column, direction = 'ASC') {
    this.orderByVal = `${column} ${direction}`;
    return this;
  }

  /**
   * Generates the SQL query execution structure.
   * @returns {{ sql: string, values: Array }}
   */
  build() {
    let sql = '';
    const values = [...this.bindings];

    switch (this.operation) {
      case 'SELECT':
        sql = `SELECT ${this.columnsList.join(', ')} FROM ${this.table}`;
        if (this.wheres.length > 0) {
          const conditions = this.wheres.map(w => `${w.column} ${w.operator} ?`);
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        if (this.orderByVal) {
          sql += ` ORDER BY ${this.orderByVal}`;
        }
        if (this.limitVal !== null) {
          sql += ` LIMIT ${this.limitVal}`;
        }
        break;

      case 'INSERT': {
        const columns = Object.keys(this.insertMap);
        const placeholders = columns.map(() => '?').join(', ');
        sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders})`;
        break;
      }

      case 'UPDATE': {
        const setStatements = Object.keys(this.updatesMap).map(k => `${k} = ?`);
        sql = `UPDATE ${this.table} SET ${setStatements.join(', ')}`;
        if (this.wheres.length > 0) {
          const conditions = this.wheres.map(w => `${w.column} ${w.operator} ?`);
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        break;
      }

      case 'DELETE':
        sql = `DELETE FROM ${this.table}`;
        if (this.wheres.length > 0) {
          const conditions = this.wheres.map(w => `${w.column} ${w.operator} ?`);
          sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        break;
    }

    return { sql, values };
  }
}
