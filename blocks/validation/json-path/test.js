import { describe, it, expect } from '../../../test/test-harness.js';
import { query, get, set, exists } from './index.js';

const STORE = {
  store: {
    books: [
      { title: 'The Hobbit', author: 'Tolkien', price: 9.99 },
      { title: 'Harry Potter', author: 'Rowling', price: 12.99 },
      { title: 'Dune', author: 'Herbert', price: 7.99 },
    ],
    owner: { name: 'Alice' },
  },
};

await describe('validation/json-path', async () => {
  await it('should query a simple dot-notation path', async () => {
    expect(query(STORE, '$.store.owner.name')).toEqual(['Alice']);
  });

  await it('should query array elements by index', async () => {
    expect(query(STORE, '$.store.books[0].title')).toEqual(['The Hobbit']);
    expect(query(STORE, '$.store.books[2].price')).toEqual([7.99]);
  });

  await it('should query all children with wildcard *', async () => {
    const titles = query(STORE, '$.store.books[*].title');
    expect(titles).toEqual(['The Hobbit', 'Harry Potter', 'Dune']);
  });

  await it('should support bracket notation for keys', async () => {
    expect(query(STORE, "$['store']['owner']['name']")).toEqual(['Alice']);
  });

  await it('should support recursive descent (..)', async () => {
    const authors = query(STORE, '$..author');
    expect(authors.length).toBe(3);
    expect(authors).toContain('Tolkien');
    expect(authors).toContain('Rowling');
  });

  await it('get() should return first match or undefined', async () => {
    expect(get(STORE, '$.store.books[1].title')).toBe('Harry Potter');
    expect(get(STORE, '$.nonexistent')).toBe(undefined);
  });

  await it('set() should mutate the object at the given path', async () => {
    const obj = { a: { b: 1 } };
    const result = set(obj, '$.a.b', 99);
    expect(result).toBe(true);
    expect(obj.a.b).toBe(99);
  });

  await it('set() should create intermediate keys if needed', async () => {
    const obj = { a: {} };
    set(obj, '$.a.c', 'hello');
    expect(obj.a.c).toBe('hello');
  });

  await it('set() should block unsafe prototype mutation paths', async () => {
    const obj = {};
    const result = set(obj, '$.__proto__.polluted', 'yes');
    expect(result).toBe(false);
    expect({}.polluted).toBe(undefined);
  });

  await it('exists() should return true for matching paths', async () => {
    expect(exists(STORE, '$.store.owner.name')).toBe(true);
    expect(exists(STORE, '$.store.nonexistent')).toBe(false);
    expect(exists(STORE, '$.store.books[0].author')).toBe(true);
  });

  await it('should throw on invalid path format', async () => {
    let threw = false;
    try { query({}, 'store.name'); } catch { threw = true; }
    expect(threw).toBe(true);
  });

  await it('should return empty array for non-matching path', async () => {
    expect(query({ a: 1 }, '$.b.c.d')).toEqual([]);
  });
});
