import { describe, it, expect } from '../../../test/test-harness.js';
import {KeyValueStore} from './index.js';

  await describe('db/key-value', async () => {
    await it('should handle basic map storage, updates, deletion, and TTL keys pruning', async () => {
      const kv = new KeyValueStore({ ttlCheckInterval: 0 }); // Disable scanner
      kv.set('session', 'secret-val', 5000);
      expect(kv.get('session')).toBe('secret-val');

      kv.set('expired-key', 'old-val', -100); // Already expired
      expect(kv.get('expired-key')).toBe(undefined);

      kv.delete('session');
      expect(kv.get('session')).toBe(undefined);
      kv.destroy();
    });
  });
