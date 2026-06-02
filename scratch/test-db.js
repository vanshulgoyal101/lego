import { RelationalDb } from '../blocks/db/relational-db/index.js';

const db = new RelationalDb();
db.execute('CREATE TABLE users (id INT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE)');
db.execute('CREATE TABLE orders (id INT PRIMARY KEY, user_id INT, status TEXT)');

db.execute('INSERT INTO users (id, name, email) VALUES (1, "Vansh", "vansh@mail.com")');
db.execute('INSERT INTO users (id, name, email) VALUES (2, "John", "john@mail.com")');
db.execute('INSERT INTO orders (id, user_id, status) VALUES (10, 1, "completed")');

const query = 'SELECT name, status FROM users INNER JOIN orders ON users.id = orders.user_id WHERE users.id = 1';
console.log('ACTUAL DB RESULTS:', db.execute(query));
