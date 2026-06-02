import { describe, it, expect } from '../../../test/test-harness.js';
import {JsonDatabase} from './index.js';
import path from 'path';
import fs from 'fs/promises';

  await describe('db/json-db', async () => {
    const dbFile = path.resolve('./temp-unit-db.json');
    
    await it('should insert and read data transactionally', async () => {
      await fs.unlink(dbFile).catch(() => {});
      const db = new JsonDatabase(dbFile);
      await db.insert('items', { val: 'A' });
      const items = await db.findMany('items');
      expect(items.length).toBe(1);
      expect(items[0].val).toBe('A');
    });

    await it('should handle JSON file corruption gracefully', async () => {
      await fs.writeFile(dbFile, '{invalid-json}', 'utf8');
      const db = new JsonDatabase(dbFile);
      const items = await db.findMany('items');
      expect(items).toEqual([]);
    });

    await it('cleanup DB file', async () => {
      await fs.unlink(dbFile).catch(() => {});
      const files = await fs.readdir('.');
      for (const file of files) {
        if (file.startsWith('temp-unit-db.json.')) {
          await fs.unlink(file).catch(() => {});
        }
      }
    });
  });
