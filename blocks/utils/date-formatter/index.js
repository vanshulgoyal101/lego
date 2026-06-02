/**
 * A lightweight Date utility class.
 * Supports token formatting, adding/subtracting intervals, and range boundary comparisons.
 */

/**
 * Format a Date object or string using token strings.
 * Supported tokens: YYYY, MM, DD, HH, mm, ss.
 * @param {Date|string|number} dateVal - Target date.
 * @param {string} formatStr - Target pattern (e.g., 'YYYY-MM-DD HH:mm:ss').
 * @returns {string} Formatted output string.
 */
export function formatDate(dateVal, formatStr) {
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid Date input');
  }

  const pad = (num) => String(num).padStart(2, '0');

  const matches = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds())
  };

  return formatStr.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => matches[match]);
}

/**
 * Add an interval duration to a date.
 * @param {Date|string|number} dateVal
 * @param {number} amount - Amount to add (can be negative).
 * @param {'days'|'hours'|'minutes'|'seconds'} unit
 * @returns {Date} New shifted Date instance.
 */
export function addTime(dateVal, amount, unit) {
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid Date input');
  }

  switch (unit) {
    case 'days':
      date.setDate(date.getDate() + amount);
      break;
    case 'hours':
      date.setHours(date.getHours() + amount);
      break;
    case 'minutes':
      date.setMinutes(date.getMinutes() + amount);
      break;
    case 'seconds':
      date.setSeconds(date.getSeconds() + amount);
      break;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return date;
}

/**
 * Check if a date is within a boundary window range [start, end] (inclusive).
 * @param {Date|string|number} dateVal
 * @param {Date|string|number} start
 * @param {Date|string|number} end
 * @returns {boolean}
 */
export function isBetween(dateVal, start, end) {
  const target = new Date(dateVal).getTime();
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (isNaN(target) || isNaN(startTime) || isNaN(endTime)) {
    throw new Error('Invalid date parameters');
  }

  return target >= startTime && target <= endTime;
}
