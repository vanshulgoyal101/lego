import { describe, it, expect } from '../../../test/test-harness.js';
import {DocumentDb} from './index.js';

  await describe('db/document-db', async () => {
    await it('should handle nested querying, sorting, indexing, and transactional ACID rollbacks', () => {
      const db = new DocumentDb();
      const users = db.collection('users');
      users.createIndex('profile.age');

      // Insert documents
      users.insert({ name: 'Alice', profile: { age: 30, city: 'NYC' } });
      users.insert({ name: 'Bob', profile: { age: 20, city: 'Boston' } });
      users.insert({ name: 'Charlie', profile: { age: 25, city: 'NYC' } });

      // Nested query match with operator
      const nycOver21 = users.find({
        'profile.city': 'NYC',
        'profile.age': { $gt: 21 }
      }).sort({ 'profile.age': 1 }).toArray();

      expect(nycOver21.length).toBe(2);
      expect(nycOver21[0].name).toBe('Charlie');
      expect(nycOver21[1].name).toBe('Alice');

      // Projection, skip and limit
      const projected = users.find({ 'profile.city': 'NYC' })
        .sort({ 'profile.age': -1 })
        .project({ name: 1, _id: 0 })
        .skip(1)
        .limit(1)
        .toArray();

      expect(projected.length).toBe(1);
      expect(projected[0]).toEqual({ name: 'Charlie' });

      // Transactions rollback
      db.beginTransaction();
      users.update({ name: 'Bob' }, { $set: { 'profile.city': 'SF' } });
      expect(users.findOne({ name: 'Bob' }).profile.city).toBe('SF');
      db.rollback();
      expect(users.findOne({ name: 'Bob' }).profile.city).toBe('Boston');

      // Transaction commit
      db.beginTransaction();
      users.update({ name: 'Bob' }, { $set: { 'profile.city': 'SF' } });
      db.commit();
      expect(users.findOne({ name: 'Bob' }).profile.city).toBe('SF');
    });
  });
