import { describe, it, expect } from '../../../test/test-harness.js';
import { isValidDate, isInRange, isWeekday, isWeekend, isLeapYear, daysInMonth } from './index.js';

await describe('validation/date-validator', async () => {
  await it('should validate ISO 8601 dates', async () => {
    expect(isValidDate('2024-01-15')).toBe(true);
    expect(isValidDate('2024-02-29')).toBe(true);  // leap year
    expect(isValidDate('2023-02-29')).toBe(false); // not leap year
    expect(isValidDate('2024-13-01')).toBe(false); // invalid month
  });

  await it('should validate custom formats', async () => {
    expect(isValidDate('15/01/2024', 'DD/MM/YYYY')).toBe(true);
    expect(isValidDate('01-15-2024', 'MM-DD-YYYY')).toBe(true);
    expect(isValidDate('31/02/2024', 'DD/MM/YYYY')).toBe(false); // Feb has no 31st
  });

  await it('should reject garbage strings', async () => {
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('not-a-date')).toBe(false);
    expect(isValidDate('2024/99/99')).toBe(false);
  });

  await it('isInRange should correctly classify dates within range', async () => {
    expect(isInRange('2024-06-15', '2024-01-01', '2024-12-31')).toBe(true);
    expect(isInRange('2025-01-01', '2024-01-01', '2024-12-31')).toBe(false);
    expect(isInRange('2024-01-01', '2024-01-01', '2024-12-31')).toBe(true); // boundary
    expect(isInRange('2024-12-31', '2024-01-01', '2024-12-31')).toBe(true); // boundary
  });

  await it('isWeekday should correctly classify weekdays', async () => {
    expect(isWeekday('2024-01-15')).toBe(true);  // Monday
    expect(isWeekday('2024-01-16')).toBe(true);  // Tuesday
    expect(isWeekday('2024-01-19')).toBe(true);  // Friday
    expect(isWeekday('2024-01-20')).toBe(false); // Saturday
    expect(isWeekday('2024-01-21')).toBe(false); // Sunday
  });

  await it('isWeekend should correctly classify weekends', async () => {
    expect(isWeekend('2024-01-20')).toBe(true);  // Saturday
    expect(isWeekend('2024-01-21')).toBe(true);  // Sunday
    expect(isWeekend('2024-01-15')).toBe(false); // Monday
  });

  await it('isLeapYear should detect leap years correctly', async () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(1600)).toBe(true);
  });

  await it('daysInMonth should return correct day counts', async () => {
    expect(daysInMonth(2024, 1)).toBe(31);  // January
    expect(daysInMonth(2024, 2)).toBe(29);  // February leap
    expect(daysInMonth(2023, 2)).toBe(28);  // February non-leap
    expect(daysInMonth(2024, 4)).toBe(30);  // April
    expect(daysInMonth(2024, 12)).toBe(31); // December
  });
});
