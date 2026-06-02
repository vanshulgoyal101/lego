/**
 * Size Formatter Utility
 * Converts byte counts to human-readable strings and parses them back.
 * Supports both decimal (SI) units: KB, MB, GB, TB, PB
 * and binary (IEC) units: KiB, MiB, GiB, TiB, PiB.
 */

/** @typedef {'si' | 'iec'} UnitSystem */

/**
 * Formats a byte count into a human-readable string.
 *
 * @param {number} bytes - The number of bytes to format. Must be >= 0.
 * @param {number} [decimals=2] - Number of decimal places (0–20).
 * @param {'si'|'iec'} [system='si'] - Unit system: 'si' (1 KB = 1000 B) or 'iec' (1 KiB = 1024 B).
 * @returns {string} Human-readable size string, e.g. '1.23 MB' or '1.18 MiB'.
 * @example
 * formatBytes(1536);          // '1.50 KB'
 * formatBytes(1048576, 0);    // '1 MB'
 * formatBytes(1048576, 2, 'iec'); // '1.00 MiB'
 */
export function formatBytes(bytes, decimals = 2, system = 'si') {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    throw new TypeError('bytes must be a non-negative number');
  }

  const dm = Math.max(0, Math.floor(decimals));
  const base = system === 'iec' ? 1024 : 1000;
  const units =
    system === 'iec'
      ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB']
      : ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

  if (bytes === 0) return `0 ${units[0]}`;

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  );
  const value = bytes / Math.pow(base, exponent);
  return `${value.toFixed(dm)} ${units[exponent]}`;
}

/**
 * Parses a human-readable size string back into a byte count.
 * Understands both SI units (KB, MB, GB, TB, PB) and
 * IEC units (KiB, MiB, GiB, TiB, PiB).
 *
 * @param {string} str - The size string to parse, e.g. '1.5 MB', '512KB', '2 GiB'.
 * @returns {number} The number of bytes represented by the string.
 * @throws {Error} If the string format is unrecognised.
 * @example
 * parseBytes('1.50 KB');   // 1500
 * parseBytes('1 MiB');     // 1048576
 * parseBytes('512B');      // 512
 */
export function parseBytes(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string');
  }

  const trimmed = str.trim();

  // Match: optional sign, numeric part (int or float), optional whitespace, unit
  const match = trimmed.match(
    /^([+-]?\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB|PB|EB|KiB|MiB|GiB|TiB|PiB|EiB)$/i
  );

  if (!match) {
    throw new Error(`Cannot parse size string: "${str}"`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  const siMap = {
    B: 1,
    KB: 1e3,
    MB: 1e6,
    GB: 1e9,
    TB: 1e12,
    PB: 1e15,
    EB: 1e18
  };

  const iecMap = {
    B: 1,
    KIB: 1024,
    MIB: 1024 ** 2,
    GIB: 1024 ** 3,
    TIB: 1024 ** 4,
    PIB: 1024 ** 5,
    EIB: 1024 ** 6
  };

  if (unit in siMap) return Math.round(value * siMap[unit]);
  if (unit in iecMap) return Math.round(value * iecMap[unit]);

  throw new Error(`Unknown unit: "${unit}"`);
}

/**
 * Returns an array of all supported unit labels for the given system.
 *
 * @param {'si'|'iec'} [system='si'] - Unit system.
 * @returns {string[]} Ordered array of unit strings from smallest to largest.
 */
export function getSupportedUnits(system = 'si') {
  return system === 'iec'
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
}
