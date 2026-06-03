/**
 * Cross-platform Path Resolver Utility.
 */

/**
 * Normalizes a path string, resolving '.' and '..' segments.
 * @param {string} path - Path to normalize
 * @returns {string} Normalized path
 */
export function normalize(path) {
  if (typeof path !== 'string') {
    throw new Error('InvalidInput: Path must be a string');
  }
  if (path.length === 0) return '.';

  // Standardize separators to POSIX
  const standardized = path.replace(/\\/g, '/');
  const isAbsolute = standardized.startsWith('/');
  const isTrailing = standardized.endsWith('/');

  const parts = standardized.split('/').filter(Boolean);
  const stack = [];

  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      if (stack.length > 0 && stack[stack.length - 1] !== '..') {
        stack.pop();
      } else if (!isAbsolute) {
        stack.push('..');
      }
    } else {
      stack.push(part);
    }
  }

  let result = (isAbsolute ? '/' : '') + stack.join('/');
  if (isTrailing && result !== '/' && result !== '') {
    result += '/';
  }
  return result || '.';
}

/**
 * Joins path segments into a single normalized path.
 * @param {...string} segments - Path segments to join
 * @returns {string} Joined and normalized path
 */
export function join(...segments) {
  const parts = segments.filter(s => typeof s === 'string' && s !== '').join('/');
  return normalize(parts);
}

/**
 * Resolves a sequence of paths or path segments into an absolute path.
 * @param {...string} segments - Path segments to resolve
 * @returns {string} Resolved absolute path
 */
export function resolve(...segments) {
  let resolvedPath = '';
  let resolvedAbsolute = false;

  for (let i = segments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? segments[i] : '/';
    if (!path) continue;

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.startsWith('/') || path.startsWith('\\');
  }

  resolvedPath = normalize(resolvedPath);

  if (resolvedAbsolute) {
    const absPath = resolvedPath.startsWith('/') ? resolvedPath : '/' + resolvedPath;
    if (absPath.length > 1 && absPath.endsWith('/')) {
      return absPath.substring(0, absPath.length - 1);
    }
    return absPath;
  }
  return resolvedPath;
}

/**
 * Returns the directory name of a path.
 * @param {string} path - Path to evaluate
 * @returns {string} Directory name
 */
export function dirname(path) {
  const normalized = normalize(path);
  if (normalized === '/' || normalized === '.') return normalized;
  const idx = normalized.lastIndexOf('/');
  if (idx === -1) return '.';
  if (idx === 0) return '/';
  return normalized.substring(0, idx);
}

/**
 * Returns the last portion of a path.
 * @param {string} path - Path to evaluate
 * @param {string} [ext] - Optional extension to strip
 * @returns {string} Basename
 */
export function basename(path, ext) {
  let normalized = normalize(path);
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.substring(0, normalized.length - 1);
  }
  const idx = normalized.lastIndexOf('/');
  let base = idx === -1 ? normalized : normalized.substring(idx + 1);
  if (ext && base.endsWith(ext)) {
    base = base.substring(0, base.length - ext.length);
  }
  return base;
}

/**
 * Returns the extension of the path.
 * @param {string} path - Path to evaluate
 * @returns {string} Extension (e.g. '.js') or empty string
 */
export function extname(path) {
  const base = basename(path);
  const idx = base.lastIndexOf('.');
  if (idx === -1 || idx === 0) return '';
  return base.substring(idx);
}

export default {
  normalize,
  join,
  resolve,
  dirname,
  basename,
  extname
};
