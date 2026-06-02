import { describe, it, expect } from '../../../test/test-harness.js';
import {formatDate, addTime, isBetween} from './index.js';

  await describe('utils/date-formatter', async () => {
    await it('should format, shift, and check date ranges', async () => {
      const date = new Date('2026-06-02T12:00:00.000Z');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-06-02');
      
      const newDate = addTime(date, 2, 'days');
      expect(formatDate(newDate, 'YYYY-MM-DD')).toBe('2026-06-04');

      expect(isBetween(date, '2026-06-01', '2026-06-03')).toBe(true);
    });
  });
