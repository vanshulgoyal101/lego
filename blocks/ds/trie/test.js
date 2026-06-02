import { describe, it, expect } from '../../../test/test-harness.js';
import {Trie} from './index.js';

  await describe('ds/trie', async () => {
    await it('should support autocomplete checks', async () => {
      const trie = new Trie();
      trie.insert('cat');
      trie.insert('car');
      trie.insert('dog');
      expect(trie.startsWith('ca')).toBe(true);
      expect(trie.startsWith('do')).toBe(true);
      expect(trie.startsWith('co')).toBe(false);
      
      const suggestions = trie.autocomplete('ca').map(item => item.word);
      expect(suggestions.includes('cat')).toBe(true);
      expect(suggestions.includes('car')).toBe(true);
      expect(suggestions.includes('dog')).toBe(false);
    });
  });
