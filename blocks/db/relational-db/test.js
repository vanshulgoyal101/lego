import { describe, it, expect } from '../../../test/test-harness.js';
import {RelationalDb} from './index.js';

  await describe('db/relational-db', async () => {
    await it('should execute table creation, row insertion, constraint validation, queries, joins, and transaction rollbacks', () => {
      const db = new RelationalDb();

      // 1. Create tables
      db.execute('CREATE TABLE users (id INT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE)');
      db.execute('CREATE TABLE orders (id INT PRIMARY KEY, user_id INT, status TEXT)');

      // 2. Insert values
      db.execute('INSERT INTO users (id, name, email) VALUES (1, "Vansh", "vansh@mail.com")');
      db.execute('INSERT INTO users (id, name, email) VALUES (2, "John", "john@mail.com")');
      db.execute('INSERT INTO orders (id, user_id, status) VALUES (10, 1, "completed")');

      // 3. Test unique constraint violation
      expect(() => {
        db.execute('INSERT INTO users (id, name, email) VALUES (3, "Duplicate", "vansh@mail.com")');
      }).toThrow('ConstraintViolation');

      // 4. Test NOT NULL constraint violation
      expect(() => {
        db.execute('INSERT INTO users (id, name, email) VALUES (4, NULL, "other@mail.com")');
      }).toThrow('ConstraintViolation');

      // 5. Test Select Query with JOIN
      const query = 'SELECT name, status FROM users INNER JOIN orders ON users.id = orders.user_id WHERE users.id = 1';
      const results = db.execute(query);
      expect(results.length).toBe(1);
      expect(results[0]).toEqual({ name: 'Vansh', status: 'completed' });

      // 6. Test Transactions Rollback
      db.execute('BEGIN TRANSACTION');
      db.execute('UPDATE users SET email = "updated@mail.com" WHERE id = 1');
      expect(db.execute('SELECT email FROM users WHERE id = 1')[0].email).toBe('updated@mail.com');
      
      db.execute('ROLLBACK');
      expect(db.execute('SELECT email FROM users WHERE id = 1')[0].email).toBe('vansh@mail.com');

      // 7. Test Transactions Commit
      db.execute('BEGIN TRANSACTION');
      db.execute('UPDATE users SET email = "committed@mail.com" WHERE id = 1');
      db.execute('COMMIT');
      expect(db.execute('SELECT email FROM users WHERE id = 1')[0].email).toBe('committed@mail.com');

      // 8. Test Foreign Key Constraints (Inline & Table-level)
      db.execute('CREATE TABLE products (id INT PRIMARY KEY, name TEXT, price INT)');
      db.execute('CREATE TABLE order_items (id INT PRIMARY KEY, order_id INT REFERENCES orders(id), product_id INT, FOREIGN KEY (product_id) REFERENCES products(id))');

      db.execute('INSERT INTO products (id, name, price) VALUES (100, "Lego Set", 50)');
      db.execute('INSERT INTO products (id, name, price) VALUES (200, "Toy Car", 15)');

      // Valid FK insert
      db.execute('INSERT INTO order_items (id, order_id, product_id) VALUES (500, 10, 100)');

      // Invalid order_id FK insert
      expect(() => {
        db.execute('INSERT INTO order_items (id, order_id, product_id) VALUES (501, 999, 100)');
      }).toThrow('ReferentialViolation');

      // Invalid product_id FK insert
      expect(() => {
        db.execute('INSERT INTO order_items (id, order_id, product_id) VALUES (502, 10, 999)');
      }).toThrow('ReferentialViolation');

      // Prevent parent delete due to active child reference
      expect(() => {
        db.execute('DELETE FROM products WHERE id = 100');
      }).toThrow('ReferentialViolation');

      // 9. Test Multiple Joins
      db.execute('INSERT INTO order_items (id, order_id, product_id) VALUES (501, 10, 200)');
      const multiJoinQuery = 'SELECT users.name AS uName, products.name AS pName, products.price FROM users INNER JOIN orders ON users.id = orders.user_id INNER JOIN order_items ON orders.id = order_items.order_id INNER JOIN products ON order_items.product_id = products.id';
      const multiJoinResults = db.execute(multiJoinQuery);
      expect(multiJoinResults.length).toBe(2);
      expect(multiJoinResults[0].uName).toBe('Vansh');
      expect(multiJoinResults[0].pName).toBe('Lego Set');
      expect(multiJoinResults[1].pName).toBe('Toy Car');

      // 10. Test Subqueries (IN)
      const subquerySql = 'SELECT name FROM products WHERE id IN (SELECT product_id FROM order_items)';
      const subqueryRes = db.execute(subquerySql);
      expect(subqueryRes.length).toBe(2);
      expect(subqueryRes[0].name).toBe('Lego Set');
      expect(subqueryRes[1].name).toBe('Toy Car');

      // 11. Test Aggregates, GROUP BY and HAVING
      db.execute('INSERT INTO products (id, name, price) VALUES (300, "Lego Bricks", 50)');
      const aggQuery = 'SELECT COUNT(id) AS cnt, SUM(price) AS total, AVG(price) AS average, MIN(price) AS minPrice, MAX(price) AS maxPrice FROM products';
      const aggRes = db.execute(aggQuery);
      expect(aggRes[0]).toEqual({
        cnt: 3,
        total: 115,
        average: 38.333333333333336,
        minPrice: 15,
        maxPrice: 50
      });

      const groupQuery = 'SELECT price, COUNT(id) AS qty FROM products GROUP BY price ORDER BY price DESC';
      const groupRes = db.execute(groupQuery);
      expect(groupRes.length).toBe(2);
      expect(groupRes[0]).toEqual({ price: 50, qty: 2 });
      expect(groupRes[1]).toEqual({ price: 15, qty: 1 });

      const havingQuery = 'SELECT price, COUNT(id) AS qty FROM products GROUP BY price HAVING COUNT(id) > 1';
      const havingRes = db.execute(havingQuery);
      expect(havingRes.length).toBe(1);
      expect(havingRes[0]).toEqual({ price: 50, qty: 2 });
    });
  });
