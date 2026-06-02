/**
 * A robust, lightweight CSV parser and stringifier.
 * Correctly handles double-quoted cells containing commas or newlines.
 */

/**
 * Parse a CSV string into a 2D array of cells.
 * @param {string} text - The raw CSV content.
 * @param {string} [delimiter=","] - Cell separator character.
 * @returns {Array<Array<string>>}
 */
export function parseCsv(text, delimiter = ',') {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote ("")
          cell += '"';
          i++; // Skip next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        // Opening quote
        inQuotes = true;
      } else if (char === delimiter) {
        // End of cell
        row.push(cell);
        cell = '';
      } else if (char === '\n' || char === '\r') {
        // End of row (handling CRLF correctly)
        row.push(cell);
        if (row.length > 1 || row[0] !== '') {
          result.push(row);
        }
        row = [];
        cell = '';
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n
        }
      } else {
        cell += char;
      }
    }
  }

  // Handle final cell / row
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    result.push(row);
  }

  return result;
}

/**
 * Helper to convert parsed 2D CSV array to an array of objects based on header row.
 * @param {Array<Array<string>>} csvData
 * @returns {Array<Object>}
 */
export function csvToObjects(csvData) {
  if (csvData.length < 2) return [];
  const headers = csvData[0];
  return csvData.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] !== undefined ? row[idx] : '';
    });
    return obj;
  });
}

/**
 * Convert an array of objects or 2D array back to a CSV string.
 * @param {Array<Object>|Array<Array<*>>} data
 * @param {string} [delimiter=","]
 * @returns {string}
 */
export function stringifyCsv(data, delimiter = ',') {
  let rows = [];

  if (Array.isArray(data[0])) {
    // 2D Array format
    rows = data;
  } else {
    // Array of objects format
    const headers = Object.keys(data[0] || {});
    rows.push(headers);
    data.forEach(item => {
      rows.push(headers.map(h => item[h]));
    });
  }

  return rows.map(row => 
    row.map(cell => {
      const cellStr = cell === null || cell === undefined ? '' : String(cell);
      // If cell contains commas, quotes, or newlines, wrap it in double quotes and escape internal quotes
      if (cellStr.includes(delimiter) || cellStr.includes('"') || cellStr.includes('\n') || cellStr.includes('\r')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(delimiter)
  ).join('\n');
}
