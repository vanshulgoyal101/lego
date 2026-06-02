import { describe, it, expect } from '../../../test/test-harness.js';
import {slugify} from './index.js';

  await describe('text/slugify', async () => {
    await it('should convert string to url path slugs', () => {
      expect(slugify('Hello World, this is Lego!')).toBe('hello-world-this-is-lego');
      expect(slugify('Café & Restaurant')).toBe('cafe-restaurant');
    });
  });
