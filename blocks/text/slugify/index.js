export function slugify(text, options = {}) {
  if (typeof text !== 'string') {
    return '';
  }

  const separator = options.separator || '-';
  const lowercase = options.lowercase !== undefined ? options.lowercase : true;

  let slug = text
    // Normalize unicode accents/diacritics to separate letters
    .normalize('NFD')
    // Remove diacritical marks
    .replace(/[\u0300-\u036f]/g, '');

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Replace non-alphanumeric chars with the separator
  slug = slug
    .replace(/[^a-z0-9]+/gi, separator)
    // Clean up duplicate separators
    .replace(new RegExp(`\\${separator}+`, 'g'), separator)
    // Trim leading/trailing separators
    .replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), '');

  return slug;
}
