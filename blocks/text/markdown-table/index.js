export class MarkdownTable {
  /**
   * Formats tabular data into an aligned Markdown table string.
   * @param {Object[]|any[][]} data - Array of objects or array of arrays
   * @param {Object} [options={}]
   * @param {string[]} [options.headers] - Custom header names
   * @param {string[]} [options.keys] - Object keys to output (if data is Array of Objects)
   * @param {('left'|'center'|'right')[]} [options.align] - Alignment per column
   * @returns {string} Formatted Markdown table
   */
  static format(data, options = {}) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    let headers = options.headers || [];
    let rows = [];

    // 1. Normalize data format
    const isArrayOfObjects = typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0]);

    if (isArrayOfObjects) {
      const keys = options.keys || Object.keys(data[0]);
      if (headers.length === 0) {
        headers = keys;
      }
      rows = data.map(item => keys.map(k => String(item[k] !== undefined && item[k] !== null ? item[k] : '')));
    } else {
      // Array of Arrays
      if (headers.length === 0) {
        // Assume first row is header if not provided
        headers = data[0].map(String);
        rows = data.slice(1).map(row => row.map(String));
      } else {
        rows = data.map(row => row.map(String));
      }
    }

    const colCount = headers.length;
    const colWidths = headers.map(h => h.length);

    // Calculate maximum widths dynamically
    for (const row of rows) {
      for (let i = 0; i < colCount; i++) {
        if (row[i]) {
          colWidths[i] = Math.max(colWidths[i], row[i].length);
        }
      }
    }

    // 2. Build header row
    let headerStr = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |';

    // 3. Build delimiter row based on alignment options
    const alignments = options.align || [];
    const delimiterRow = '| ' + colWidths.map((w, i) => {
      const align = alignments[i];
      const minDashes = Math.max(3, w);
      if (align === 'center') {
        return ':' + '-'.repeat(minDashes - 2) + ':';
      }
      if (align === 'right') {
        return '-'.repeat(minDashes - 1) + ':';
      }
      // Left / Default
      return ':' + '-'.repeat(minDashes - 1);
    }).join(' | ') + ' |';

    // 4. Build data rows
    const dataRows = rows.map(row => {
      return '| ' + row.map((cell, i) => {
        const str = cell || '';
        const align = alignments[i];
        if (align === 'right') {
          return str.padStart(colWidths[i]);
        }
        if (align === 'center') {
          const totalPadding = colWidths[i] - str.length;
          const leftPadding = Math.floor(totalPadding / 2);
          const rightPadding = totalPadding - leftPadding;
          return ' '.repeat(leftPadding) + str + ' '.repeat(rightPadding);
        }
        // Left
        return str.padEnd(colWidths[i]);
      }).join(' | ') + ' |';
    });

    return [headerStr, delimiterRow, ...dataRows].join('\n');
  }
}
