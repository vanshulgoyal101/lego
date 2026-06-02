import { describe, it, expect } from '../../../test/test-harness.js';
import {parseCsv, stringifyCsv} from './index.js';

  await describe('text/csv-parser', async () => {
    await it('should parse and serialize CSV content correctly', async () => {
      const csv = 'col1,col2\n"val,1",val2';
      const parsed = parseCsv(csv);
      expect(parsed[1][0]).toBe('val,1');
      expect(parsed[1][1]).toBe('val2');
      
      const stringified = stringifyCsv(parsed);
      expect(stringified.includes('"val,1"')).toBe(true);
    });
  });
