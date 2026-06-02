/**
 * Date Validator
 * Validates date strings, checks ranges, classifies weekday/weekend,
 * and provides calendar utilities like leap year and days-in-month.
 */

/**
 * Supported format tokens and their regex equivalents.
 * @type {Array<[string, string, string]>} [token, regex, part]
 */
const FORMAT_TOKENS = [
  ['YYYY', '(\\d{4})', 'year'],
  ['MM',   '(\\d{2})', 'month'],
  ['DD',   '(\\d{2})', 'day'],
];

/**
 * Parses a date string according to an optional format hint.
 * Falls back to native Date parsing (ISO 8601 and common browser-parseable formats).
 *
 * @param {string} str - Date string.
 * @param {string} [format] - Format string using YYYY, MM, DD tokens (e.g. 'DD/MM/YYYY').
 * @returns {Date|null} Parsed Date object, or null if parsing fails.
 */
function parseDate(str, format) {
  if (typeof str !== 'string' || !str.trim()) return null;

  if (format) {
    // Rebuild pattern properly
    let patternStr = format;
    // Map of token key to replacement name
    const matches = [
      { token: 'YYYY', name: 'year' },
      { token: 'MM', name: 'month' },
      { token: 'DD', name: 'day' }
    ];
    
    // Replace tokens in pattern with placeholders
    for (const m of matches) {
      patternStr = patternStr.replace(m.token, `__${m.name}__`);
    }
    
    patternStr = patternStr.replace(/[-/.]/g, '\\$&');
    
    // Determine the order in which they appear in patternStr to map regex captures
    const captureOrder = [];
    const partsIndex = [];
    for (const m of matches) {
      const idx = patternStr.indexOf(`__${m.name}__`);
      if (idx !== -1) {
        partsIndex.push({ name: m.name, index: idx });
      }
    }
    partsIndex.sort((a, b) => a.index - b.index);
    for (const p of partsIndex) {
      captureOrder.push(p.name);
      if (p.name === 'year') {
        patternStr = patternStr.replace(`__${p.name}__`, '(\\d{4})');
      } else {
        patternStr = patternStr.replace(`__${p.name}__`, '(\\d{2})');
      }
    }

    const match = new RegExp(`^${patternStr}$`).exec(str.trim());
    if (!match) return null;

    const extracted = {};
    captureOrder.forEach((name, i) => {
      extracted[name] = parseInt(match[i + 1], 10);
    });

    const { year, month, day } = extracted;
    if (year === undefined || month === undefined || day === undefined) return null;

    const d = new Date(year, month - 1, day);
    // Validate that the date didn't roll over (e.g. Feb 31 → Mar)
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
      return null;
    }
    return d;
  }

  // Handle ISO 8601 dates (e.g., YYYY-MM-DD) explicitly to prevent timezone shifting
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str.trim());
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
      return null;
    }
    return d;
  }

  // No format — try native parsing
  const d = new Date(str.trim());
  if (isNaN(d.getTime())) return null;
  // Guard against bare years being parsed as Jan 1 of that year
  if (/^\d{4}$/.test(str.trim())) return null;
  return d;
}

/**
 * Returns true if `year` is a leap year.
 *
 * @param {number} year - Full 4-digit year.
 * @returns {boolean}
 *
 * @example
 * isLeapYear(2000) // true
 * isLeapYear(1900) // false
 * isLeapYear(2024) // true
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns the number of days in a given month of a given year.
 *
 * @param {number} year - Full 4-digit year.
 * @param {number} month - Month number (1–12).
 * @returns {number} Number of days in the month.
 *
 * @example
 * daysInMonth(2024, 2) // 29 (leap year)
 * daysInMonth(2023, 2) // 28
 * daysInMonth(2024, 1) // 31
 */
export function daysInMonth(year, month) {
  // Day 0 of next month = last day of current month
  return new Date(year, month, 0).getDate();
}

/**
 * Validates a date string. Returns true if it represents a real calendar date.
 *
 * @param {string} str - Date string to validate.
 * @param {string} [format] - Optional format (e.g. 'YYYY-MM-DD', 'DD/MM/YYYY', 'MM-DD-YYYY').
 * @returns {boolean}
 *
 * @example
 * isValidDate('2024-02-29')             // true (2024 is leap year)
 * isValidDate('2023-02-29')             // false
 * isValidDate('29/02/2024', 'DD/MM/YYYY') // true
 */
export function isValidDate(str, format) {
  return parseDate(str, format) !== null;
}

/**
 * Checks whether a date falls within an inclusive range [min, max].
 *
 * @param {string|Date} date - The date to check (string or Date object).
 * @param {string|Date} min - Minimum date (inclusive).
 * @param {string|Date} max - Maximum date (inclusive).
 * @returns {boolean}
 *
 * @example
 * isInRange('2024-06-15', '2024-01-01', '2024-12-31') // true
 * isInRange('2025-01-01', '2024-01-01', '2024-12-31') // false
 */
export function isInRange(date, min, max) {
  const d = date instanceof Date ? date : parseDate(date);
  const lo = min instanceof Date ? min : parseDate(min);
  const hi = max instanceof Date ? max : parseDate(max);
  if (!d || !lo || !hi) return false;
  return d >= lo && d <= hi;
}

/**
 * Returns true if the date falls on a weekday (Monday–Friday).
 *
 * @param {string|Date} date - Date string or Date object.
 * @returns {boolean}
 *
 * @example
 * isWeekday('2024-01-15') // true (Monday)
 * isWeekday('2024-01-14') // false (Sunday)
 */
export function isWeekday(date) {
  const d = date instanceof Date ? date : parseDate(date);
  if (!d) return false;
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  return day >= 1 && day <= 5;
}

/**
 * Returns true if the date falls on a weekend (Saturday or Sunday).
 *
 * @param {string|Date} date - Date string or Date object.
 * @returns {boolean}
 *
 * @example
 * isWeekend('2024-01-14') // true (Sunday)
 * isWeekend('2024-01-15') // false (Monday)
 */
export function isWeekend(date) {
  const d = date instanceof Date ? date : parseDate(date);
  if (!d) return false;
  const day = d.getDay();
  return day === 0 || day === 6;
}
