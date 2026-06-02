import { describe, it, expect } from '../../../test/test-harness.js';
import {diffLines} from './index.js';

  await describe('text/diff-match', async () => {
    await it('should calculate diff arrays for lines comparison', async () => {
      const text1 = 'hello\nworld';
      const text2 = 'hello\nthere\nworld';
      const diff = diffLines(text1, text2);
      expect(diff[1].type).toBe('added');
      expect(diff[1].value).toBe('there');
    });
  });
