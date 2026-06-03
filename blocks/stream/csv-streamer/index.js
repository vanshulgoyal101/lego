/**
 * CSV Streamer (Parser and Stringifier)
 * High-performance, zero-dependency streaming CSV parsing and formatting.
 */

export class CSVParser {
  /**
   * @param {Object} options
   * @param {string} [options.delimiter] Default: ','
   * @param {string} [options.quote] Default: '"'
   * @param {boolean|string[]} [options.headers] Default: true.
   *        - true: Uses the first line as headers and returns objects.
   *        - Array: Custom headers array, returns objects.
   *        - false: Returns raw array of fields.
   * @param {boolean} [options.skipEmptyLines] Default: true.
   */
  constructor(options = {}) {
    this.delimiter = options.delimiter || ',';
    this.quote = options.quote || '"';
    this.headersConfig = options.headers !== undefined ? options.headers : true;
    this.skipEmptyLines = options.skipEmptyLines !== false;

    this.headers = Array.isArray(this.headersConfig) ? this.headersConfig : null;
    this.reset();
  }

  reset() {
    this.inQuote = false;
    this.currentField = '';
    this.currentRow = [];
    this.pendingLF = false;
  }

  /**
   * Parse an AsyncIterable or Iterable of text chunks.
   * @param {AsyncIterable<string>|Iterable<string>} chunkStream
   * @returns {AsyncGenerator<Object|string[]>}
   */
  async *parse(chunkStream) {
    this.reset();

    for await (const chunk of chunkStream) {
      if (typeof chunk !== 'string') continue;

      for (let i = 0; i < chunk.length; i++) {
        const char = chunk[i];
        const nextChar = chunk[i + 1];

        if (this.pendingLF) {
          this.pendingLF = false;
          if (char === '\n') {
            continue;
          }
        }

        if (char === this.quote) {
          if (this.inQuote && nextChar === this.quote) {
            // Escaped quote character (e.g. "")
            this.currentField += this.quote;
            i++; // skip next quote
          } else {
            // Toggle quoted state
            this.inQuote = !this.inQuote;
          }
        } else if (char === this.delimiter && !this.inQuote) {
          this.currentRow.push(this.currentField);
          this.currentField = '';
        } else if ((char === '\r' || char === '\n') && !this.inQuote) {
          this.currentRow.push(this.currentField);
          this.currentField = '';

          if (char === '\r') {
            if (nextChar === '\n') {
              i++; // skip line feed in current chunk
            } else {
              this.pendingLF = true; // wait for LF in subsequent chunks
            }
          }

          const rowToYield = this._finalizeRow();
          if (rowToYield) {
            yield rowToYield;
          }
        } else {
          this.currentField += char;
        }
      }
    }

    // Flush any remaining data at the end of stream
    if (this.currentField !== '' || this.currentRow.length > 0) {
      this.currentRow.push(this.currentField);
      const rowToYield = this._finalizeRow();
      if (rowToYield) {
        yield rowToYield;
      }
    }
  }

  /**
   * @private
   */
  _finalizeRow() {
    const row = this.currentRow;
    this.currentRow = [];

    if (this.skipEmptyLines && row.length === 1 && row[0] === '') {
      return null;
    }

    if (this.headersConfig === true && !this.headers) {
      this.headers = row;
      return null;
    }

    if (this.headers) {
      const obj = {};
      for (let i = 0; i < this.headers.length; i++) {
        obj[this.headers[i]] = row[i] !== undefined ? row[i] : '';
      }
      return obj;
    }

    return row;
  }
}

export class CSVStringifier {
  /**
   * @param {Object} options
   * @param {string} [options.delimiter] Default: ','
   * @param {string} [options.quote] Default: '"'
   * @param {string[]} [options.headers] Ordered headers to output or extract.
   * @param {boolean} [options.alwaysQuote] Quote every field. Default: false.
   */
  constructor(options = {}) {
    this.delimiter = options.delimiter || ',';
    this.quote = options.quote || '"';
    this.headers = options.headers || null;
    this.alwaysQuote = options.alwaysQuote === true;
  }

  /**
   * Formats a single value for CSV output.
   * @private
   */
  _formatValue(val) {
    if (val === null || val === undefined) return '';
    const str = String(val);
    const needsQuote =
      this.alwaysQuote ||
      str.includes(this.delimiter) ||
      str.includes(this.quote) ||
      str.includes('\n') ||
      str.includes('\r') ||
      str.includes(' ');

    if (needsQuote) {
      // Escape internal quotes by doubling them
      const escaped = str.replace(new RegExp(this.quote, 'g'), this.quote + this.quote);
      return this.quote + escaped + this.quote;
    }

    return str;
  }

  /**
   * Stringifies a stream of objects or arrays into lines of CSV text.
   * @param {Iterable|AsyncIterable} rowsStream
   * @returns {AsyncGenerator<string>}
   */
  async *stringify(rowsStream) {
    let headerSent = false;

    for await (const row of rowsStream) {
      if (!row) continue;

      if (Array.isArray(row)) {
        if (this.headers && !headerSent) {
          yield this.headers.map(h => this._formatValue(h)).join(this.delimiter) + '\n';
          headerSent = true;
        }
        yield row.map(v => this._formatValue(v)).join(this.delimiter) + '\n';
      } else if (typeof row === 'object') {
        if (!this.headers) {
          this.headers = Object.keys(row);
        }

        if (!headerSent) {
          yield this.headers.map(h => this._formatValue(h)).join(this.delimiter) + '\n';
          headerSent = true;
        }

        const line = this.headers
          .map(header => this._formatValue(row[header]))
          .join(this.delimiter);
        yield line + '\n';
      }
    }
  }
}
