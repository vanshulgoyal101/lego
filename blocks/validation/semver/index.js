/**
 * Semantic Versioning (SemVer 2.0.0)
 * Parse, validate, compare versions and match ranges (^, ~, >=, <=, <, >, =, ||)
 */

const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Parse a semver string.
 * @param {string} version
 * @returns {{ major, minor, patch, prerelease, build } | null}
 */
export function parse(version) {
  if (typeof version !== 'string') return null;
  const match = version.trim().match(SEMVER_RE);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] ? match[4].split('.') : [],
    build: match[5] ? match[5].split('.') : [],
    raw: version.trim()
  };
}

/**
 * Check if a string is a valid SemVer.
 * @param {string} version
 * @returns {boolean}
 */
export function isValid(version) {
  return parse(version) !== null;
}

/**
 * Compare two semver strings.
 * @param {string} a
 * @param {string} b
 * @returns {-1|0|1} -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compare(a, b) {
  const pa = parse(a);
  const pb = parse(b);
  if (!pa || !pb) throw new Error(`Invalid semver: ${!pa ? a : b}`);

  // Compare major, minor, patch
  for (const field of ['major', 'minor', 'patch']) {
    if (pa[field] > pb[field]) return 1;
    if (pa[field] < pb[field]) return -1;
  }

  // Handle pre-release: a version without pre-release is greater than one with it
  const aPre = pa.prerelease;
  const bPre = pb.prerelease;

  if (aPre.length === 0 && bPre.length === 0) return 0;
  if (aPre.length === 0) return 1; // no pre-release > has pre-release
  if (bPre.length === 0) return -1;

  const len = Math.min(aPre.length, bPre.length);
  for (let i = 0; i < len; i++) {
    const aId = aPre[i];
    const bId = bPre[i];
    const aNum = /^\d+$/.test(aId);
    const bNum = /^\d+$/.test(bId);

    if (aNum && bNum) {
      const diff = parseInt(aId, 10) - parseInt(bId, 10);
      if (diff !== 0) return diff > 0 ? 1 : -1;
    } else if (aNum) {
      return -1; // numeric pre-release < alphanumeric
    } else if (bNum) {
      return 1;
    } else {
      if (aId > bId) return 1;
      if (aId < bId) return -1;
    }
  }

  if (aPre.length > bPre.length) return 1;
  if (aPre.length < bPre.length) return -1;
  return 0;
}

export const gt = (a, b) => compare(a, b) > 0;
export const lt = (a, b) => compare(a, b) < 0;
export const gte = (a, b) => compare(a, b) >= 0;
export const lte = (a, b) => compare(a, b) <= 0;
export const eq = (a, b) => compare(a, b) === 0;

/**
 * Sort an array of version strings.
 * @param {string[]} versions
 * @param {'asc'|'desc'} [order='asc']
 * @returns {string[]}
 */
export function sort(versions, order = 'asc') {
  return [...versions].sort((a, b) => order === 'asc' ? compare(a, b) : compare(b, a));
}

/**
 * Get the highest version from an array.
 * @param {string[]} versions
 * @returns {string|null}
 */
export function maxVersion(versions) {
  if (!versions.length) return null;
  return sort(versions, 'desc')[0];
}

/**
 * Get the lowest version from an array.
 * @param {string[]} versions
 * @returns {string|null}
 */
export function minVersion(versions) {
  if (!versions.length) return null;
  return sort(versions, 'asc')[0];
}

/**
 * Check if a version satisfies a range constraint.
 * Supported: =1.0.0, >1.0.0, >=1.0.0, <2.0.0, <=2.0.0, ^1.0.0, ~1.0.0, 1.0.0 - 2.0.0
 * Combined with spaces (AND) or || (OR).
 * @param {string} version
 * @param {string} range
 * @returns {boolean}
 */
export function satisfies(version, range) {
  if (!isValid(version)) throw new Error(`Invalid version: ${version}`);

  // Handle OR: split by ||
  const orParts = range.split('||').map(s => s.trim());
  return orParts.some(orPart => satisfiesAnd(version, orPart));
}

function satisfiesAnd(version, range) {
  const parts = range.trim().split(/\s+/);
  return parts.every(part => satisfiesComparator(version, part));
}

function satisfiesComparator(version, comparator) {
  comparator = comparator.trim();

  // Hyphen range: 1.0.0 - 2.0.0
  const hyphenMatch = comparator.match(/^(.+)\s+-\s+(.+)$/);
  if (hyphenMatch) {
    return gte(version, hyphenMatch[1]) && lte(version, hyphenMatch[2]);
  }

  // Caret (^): compatible with given version (allows patch/minor updates)
  if (comparator.startsWith('^')) {
    const v = comparator.slice(1);
    const p = parse(v);
    if (!p) return false;
    if (p.major !== 0) {
      return gte(version, v) && lt(version, `${p.major + 1}.0.0`);
    } else if (p.minor !== 0) {
      return gte(version, v) && lt(version, `0.${p.minor + 1}.0`);
    } else {
      return gte(version, v) && lt(version, `0.0.${p.patch + 1}`);
    }
  }

  // Tilde (~): allows patch-level changes only
  if (comparator.startsWith('~')) {
    const v = comparator.slice(1);
    const p = parse(v);
    if (!p) return false;
    return gte(version, v) && lt(version, `${p.major}.${p.minor + 1}.0`);
  }

  if (comparator.startsWith('>=')) return gte(version, comparator.slice(2).trim());
  if (comparator.startsWith('<=')) return lte(version, comparator.slice(2).trim());
  if (comparator.startsWith('>')) return gt(version, comparator.slice(1).trim());
  if (comparator.startsWith('<')) return lt(version, comparator.slice(1).trim());
  if (comparator.startsWith('=')) return eq(version, comparator.slice(1).trim());

  // Bare version string: exact match
  return eq(version, comparator);
}

/**
 * Increment a version string.
 * @param {string} version
 * @param {'major'|'minor'|'patch'} release
 * @returns {string}
 */
export function increment(version, release) {
  const p = parse(version);
  if (!p) throw new Error(`Invalid version: ${version}`);
  switch (release) {
    case 'major': return `${p.major + 1}.0.0`;
    case 'minor': return `${p.major}.${p.minor + 1}.0`;
    case 'patch': return `${p.major}.${p.minor}.${p.patch + 1}`;
    default: throw new Error(`Invalid release type: ${release}`);
  }
}
