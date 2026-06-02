/**
 * Intelligent Text Wrapping
 *
 * Provides word-aware text wrapping that fits text into a given column width
 * while respecting word boundaries. Supports indentation, hard-cut mode for
 * long words, newline preservation, and center alignment.
 */

/**
 * Wrap text to a maximum line width.
 *
 * @param {string} text  - Text to wrap
 * @param {number} width - Maximum characters per line (including indent)
 * @param {object} [options]
 * @param {string}  [options.indent='']              - String prepended to every line
 * @param {boolean} [options.cut=false]              - Hard-cut words longer than width
 * @param {boolean} [options.preserveNewlines=true]  - Keep existing line breaks
 * @returns {string} Wrapped text with '\n' line separators
 *
 * @example
 * wrap("The quick brown fox jumps over the lazy dog", 20);
 * // "The quick brown fox\njumps over the lazy\ndog"
 */
export function wrap(text, width, options = {}) {
  if (typeof text !== 'string') throw new TypeError('wrap: text must be a string');
  if (!Number.isFinite(width) || width < 1) throw new RangeError('wrap: width must be a positive number');

  const {
    indent = '',
    cut = false,
    preserveNewlines = true,
  } = options;

  const effectiveWidth = width - indent.length;
  if (effectiveWidth < 1) throw new RangeError('wrap: indent is wider than total width');

  // Split on existing newlines if preserving them
  const paragraphs = preserveNewlines ? text.split('\n') : [text.replace(/\n/g, ' ')];

  const wrappedParagraphs = paragraphs.map(paragraph => {
    // Split paragraph into words
    const words = paragraph.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return indent; // preserve blank lines

    const lines = [];
    let currentLine = '';

    for (const word of words) {
      // Handle words longer than effectiveWidth
      if (cut && word.length > effectiveWidth) {
        // Flush current line first
        if (currentLine) { lines.push(indent + currentLine); currentLine = ''; }
        // Hard-cut the long word
        let remaining = word;
        while (remaining.length > effectiveWidth) {
          lines.push(indent + remaining.slice(0, effectiveWidth));
          remaining = remaining.slice(effectiveWidth);
        }
        currentLine = remaining;
        continue;
      }

      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (candidate.length <= effectiveWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) lines.push(indent + currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(indent + currentLine);
    return lines.join('\n');
  });

  return wrappedParagraphs.join('\n');
}

/**
 * Wrap text using simple word boundaries without additional options.
 * Convenience wrapper around `wrap()`.
 *
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
export function wrapWords(text, width) {
  return wrap(text, width);
}

/**
 * Center-align each line of text within a given width by padding with spaces.
 *
 * @param {string} text  - Text to center (may contain '\n')
 * @param {number} width - Total column width
 * @returns {string}
 *
 * @example
 * centerText("hi\nhello", 10);
 * // "    hi    \n  hello   "
 */
export function centerText(text, width) {
  if (typeof text !== 'string') throw new TypeError('centerText: text must be a string');
  if (!Number.isFinite(width) || width < 1) throw new RangeError('centerText: width must be a positive number');

  return text.split('\n').map(line => {
    const len = line.length;
    if (len >= width) return line;
    const totalPad = width - len;
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    return ' '.repeat(leftPad) + line + ' '.repeat(rightPad);
  }).join('\n');
}
