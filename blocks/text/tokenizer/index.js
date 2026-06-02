/**
 * Simple Whitespace/Punctuation Tokenizer
 *
 * Provides basic NLP preprocessing: general tokenization, word-only
 * tokenization, sentence splitting, and n-gram generation.
 * Zero external dependencies.
 */

/** Default punctuation characters that form their own tokens. */
const PUNCTUATION_RE = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g;

/**
 * Tokenize text into an array of tokens (words and optionally punctuation).
 *
 * @param {string} text - Input text
 * @param {object} [options]
 * @param {boolean} [options.lowercase=false]          - Convert tokens to lowercase
 * @param {boolean} [options.removePunctuation=false]  - Strip punctuation tokens
 * @param {string[]} [options.stopWords=[]]            - Words to remove
 * @returns {string[]}
 *
 * @example
 * tokenize("Hello, world!"); // ["Hello", ",", "world", "!"]
 * tokenize("Hello, world!", { lowercase: true, removePunctuation: true }); // ["hello", "world"]
 */
export function tokenize(text, options = {}) {
  if (typeof text !== 'string') throw new TypeError('tokenize: text must be a string');
  const {
    lowercase = false,
    removePunctuation = false,
    stopWords = []
  } = options;

  const stopSet = new Set(stopWords.map(w => w.toLowerCase()));

  // Split on whitespace, keeping punctuation as separate tokens
  const raw = text
    .replace(/([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, ' $1 ')
    .split(/\s+/)
    .filter(t => t.length > 0);

  return raw
    .map(t => lowercase ? t.toLowerCase() : t)
    .filter(t => {
      if (removePunctuation && /^[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/.test(t)) return false;
      if (stopSet.size && stopSet.has(t.toLowerCase())) return false;
      return true;
    });
}

/**
 * Tokenize text into words only, discarding all punctuation and whitespace.
 *
 * @param {string} text - Input text
 * @returns {string[]}
 *
 * @example
 * tokenizeWords("It's a test."); // ["It's", "a", "test"]
 */
export function tokenizeWords(text) {
  if (typeof text !== 'string') throw new TypeError('tokenizeWords: text must be a string');
  return text.match(/\b[\w']+\b/g) ?? [];
}

/**
 * Split text into sentences using common sentence boundary heuristics.
 * Handles ., !, ? followed by whitespace and an uppercase letter or end-of-string.
 *
 * @param {string} text - Input text
 * @returns {string[]}
 *
 * @example
 * tokenizeSentences("Hello world. How are you? Fine!");
 * // ["Hello world.", "How are you?", "Fine!"]
 */
export function tokenizeSentences(text) {
  if (typeof text !== 'string') throw new TypeError('tokenizeSentences: text must be a string');
  // Split at sentence-ending punctuation followed by space + uppercase or end
  const sentences = text
    .replace(/([.!?])\s+(?=[A-Z])/g, '$1\x00')
    .split('\x00')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return sentences;
}

/**
 * Generate n-grams from an array of tokens.
 *
 * @param {string[]} tokens - Array of tokens
 * @param {number} n - Size of each n-gram (e.g. 2 = bigrams)
 * @returns {string[][]}
 *
 * @example
 * ngrams(["a", "b", "c", "d"], 2); // [["a","b"],["b","c"],["c","d"]]
 */
export function ngrams(tokens, n) {
  if (!Array.isArray(tokens)) throw new TypeError('ngrams: tokens must be an array');
  if (!Number.isInteger(n) || n < 1) throw new RangeError('ngrams: n must be a positive integer');
  const result = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n));
  }
  return result;
}
