import { describe, it, expect } from '../../../test/test-harness.js';
import {parseQuery, stringifyQuery} from './index.js';

  await describe('encoding/url-codec', async () => {
    await it('should serialize and parse query variables correctly', async () => {
      const obj = { tags: ['admin', 'dev'], parent: { child: 'value' } };
      const query = stringifyQuery(obj);
      expect(query).toBe('tags[]=admin&tags[]=dev&parent%5Bchild%5D=value');
      expect(parseQuery(query)).toEqual(obj);
    });
  });
