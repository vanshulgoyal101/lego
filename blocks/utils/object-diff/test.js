import { describe, it, expect } from '../../../test/test-harness.js';
import {diff, applyPatch, reversePatch, deepEqual} from './index.js';

  await describe('utils/object-diff', async () => {
    await it('should detect added keys', () => {
      const changes = diff({ a: 1 }, { a: 1, b: 2 });
      const added = changes.find(c => c.type === 'added' && c.path === 'b');
      expect(added).toBeTruthy();
      expect(added.value).toBe(2);
    });

    await it('should detect removed keys', () => {
      const changes = diff({ a: 1, b: 2 }, { a: 1 });
      const removed = changes.find(c => c.type === 'removed' && c.path === 'b');
      expect(removed).toBeTruthy();
    });

    await it('should detect modified values', () => {
      const changes = diff({ x: 'old' }, { x: 'new' });
      const mod = changes.find(c => c.type === 'modified' && c.path === 'x');
      expect(mod.from).toBe('old');
      expect(mod.to).toBe('new');
    });

    await it('should detect nested changes with dot paths', () => {
      const changes = diff({ user: { name: 'Alice', age: 30 } }, { user: { name: 'Bob', age: 30 } });
      const mod = changes.find(c => c.path === 'user.name');
      expect(mod.from).toBe('Alice');
      expect(mod.to).toBe('Bob');
    });

    await it('should apply a patch to produce the after state', () => {
      const before = { a: 1, b: 'old' };
      const after = { a: 1, b: 'new', c: 3 };
      const changes = diff(before, after);
      const patched = applyPatch(before, changes);
      expect(patched.b).toBe('new');
      expect(patched.c).toBe(3);
    });

    await it('should reverse a patch to undo changes', () => {
      const before = { x: 1 };
      const after = { x: 2 };
      const changes = diff(before, after);
      const reversed = reversePatch(changes);
      const undone = applyPatch(after, reversed);
      expect(undone.x).toBe(1);
    });

    await it('should return empty array for identical objects', () => {
      const changes = diff({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2] });
      expect(changes.length).toBe(0);
    });
  });
