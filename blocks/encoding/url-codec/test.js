import { describe, it, expect } from '../../../test/test-harness.js';
import {parseQuery, stringifyQuery} from './index.js';

  await describe('encoding/url-codec', async () => {
    await it('should serialize and parse query variables correctly', async () => {
      const obj = { tags: ['admin', 'dev'], parent: { child: 'value' } };
      const query = stringifyQuery(obj);
      expect(query).toBe('tags[]=admin&tags[]=dev&parent%5Bchild%5D=value');
      expect(parseQuery(query)).toEqual(obj);
    });

    await it('should ignore unsafe keys to prevent prototype pollution', async () => {
      const parsed = parseQuery('__proto__[polluted]=yes&constructor[prototype]=oops&safe=value');
      expect(parsed.safe).toBe('value');
      expect({}.polluted).toBe(undefined);
    });

    await it('should preserve equals signs in values', async () => {
      const parsed = parseQuery('token=a=b=c');
      expect(parsed.token).toBe('a=b=c');
    });
  });
