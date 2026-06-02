/**
 * Cron Expression Parser and Resolver (5-field format)
 */
export class CronParser {
  /**
   * @param {string} cronString - standard "min hour dom month dow" crontab string
   */
  constructor(cronString) {
    if (typeof cronString !== 'string') {
      throw new Error('InvalidInput: Cron expression must be a string.');
    }
    const parts = cronString.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error('InvalidCronExpression: Cron must have exactly 5 fields.');
    }

    this.minutes = this._parseField(parts[0], 0, 59);
    this.hours = this._parseField(parts[1], 0, 23);
    this.daysOfMonth = this._parseField(parts[2], 1, 31);
    this.months = this._parseField(parts[3], 1, 12);
    this.daysOfWeek = this._parseField(parts[4], 0, 6); // 0 = Sunday
  }

  _parseField(str, min, max) {
    const values = new Set();
    const parts = str.split(',');

    for (const part of parts) {
      if (part === '*') {
        for (let i = min; i <= max; i++) values.add(i);
      } else if (part.includes('/')) {
        const [range, stepStr] = part.split('/');
        const step = parseInt(stepStr, 10);
        if (isNaN(step) || step <= 0) {
          throw new Error(`InvalidCronExpression: Invalid step value "${stepStr}"`);
        }
        let start = min;
        let end = max;
        if (range !== '*') {
          if (range.includes('-')) {
            const [s, e] = range.split('-').map(Number);
            start = s;
            end = e;
          } else {
            start = parseInt(range, 10);
          }
        }
        for (let i = start; i <= end; i += step) {
          if (i >= min && i <= max) values.add(i);
        }
      } else if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
          throw new Error(`InvalidCronExpression: Invalid range "${part}"`);
        }
        for (let i = start; i <= end; i++) {
          values.add(i);
        }
      } else {
        const val = parseInt(part, 10);
        if (isNaN(val) || val < min || val > max) {
          throw new Error(`InvalidCronExpression: Invalid field value "${part}"`);
        }
        values.add(val);
      }
    }

    return Array.from(values).sort((a, b) => a - b);
  }

  /**
   * Resolve the next Date when the cron schedule is triggered
   *
   * @param {Date} [fromDate=new Date()]
   * @returns {Date} The next matching Date object
   */
  next(fromDate = new Date()) {
    let current = new Date(fromDate.getTime() + 60000); // Start searching at next minute
    current.setSeconds(0);
    current.setMilliseconds(0);

    const limitTime = fromDate.getTime() + 2 * 365 * 24 * 60 * 60 * 1000; // Search limit 2 years

    while (current.getTime() < limitTime) {
      if (!this.months.includes(current.getMonth() + 1)) {
        current.setMonth(current.getMonth() + 1);
        current.setDate(1);
        current.setHours(0, 0);
        continue;
      }

      const domMatch = this.daysOfMonth.includes(current.getDate());
      const dowMatch = this.daysOfWeek.includes(current.getDay());
      if (!domMatch || !dowMatch) {
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0);
        continue;
      }

      if (!this.hours.includes(current.getHours())) {
        current.setHours(current.getHours() + 1);
        current.setMinutes(0);
        continue;
      }

      if (!this.minutes.includes(current.getMinutes())) {
        current.setMinutes(current.getMinutes() + 1);
        continue;
      }

      return current;
    }

    throw new Error('NoMatchFound: No execution time found within 2 years.');
  }
}
