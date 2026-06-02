import { describe, it, expect } from '../../../test/test-harness.js';
import { CronParser } from './index.js';

await describe('validation/cron-parser', async () => {
  await it('should correctly compute next execution times for intervals and ranges', () => {
    // 1. Every 5 minutes: */5 * * * *
    const parser = new CronParser('*/5 * * * *');
    const baseDate = new Date(2026, 5, 2, 12, 0, 0); // local June 2, 2026 12:00:00
    
    // next trigger should be 12:05
    let nextDate = parser.next(baseDate);
    expect(nextDate.getMinutes()).toBe(5);
    expect(nextDate.getHours()).toBe(12);

    // from 12:03 should trigger at 12:05
    nextDate = parser.next(new Date(2026, 5, 2, 12, 3, 0));
    expect(nextDate.getMinutes()).toBe(5);

    // 2. Specific hour and day of week: 0 12 * * 1 (Every Monday at 12:00)
    // 2026-06-02 is a Tuesday (getDay() = 2)
    // Next Monday is 2026-06-08 (getDay() = 1)
    const parserMon = new CronParser('0 12 * * 1');
    const nextMon = parserMon.next(baseDate);
    expect(nextMon.getDay()).toBe(1); // Monday
    expect(nextMon.getHours()).toBe(12);
    expect(nextMon.getMinutes()).toBe(0);
    expect(nextMon.getDate()).toBe(8);
  });
});
