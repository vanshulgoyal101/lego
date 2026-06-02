/**
 * INI Configuration File Parser and Serializer
 * Supports sections, key=value, comments (#, ;), inline comments, quoted strings.
 */

function parseValue(raw) {
  const s = raw.trim();
  // Remove inline comments
  const commentIdx = s.search(/\s+[#;]/);
  const val = commentIdx === -1 ? s : s.slice(0, commentIdx).trim();

  // Quoted strings
  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }

  // Booleans
  if (val.toLowerCase() === 'true' || val.toLowerCase() === 'yes' || val.toLowerCase() === 'on') return true;
  if (val.toLowerCase() === 'false' || val.toLowerCase() === 'no' || val.toLowerCase() === 'off') return false;

  // Numbers
  if (/^-?[0-9]+$/.test(val)) return parseInt(val, 10);
  if (/^-?[0-9]*\.[0-9]+$/.test(val)) return parseFloat(val);

  return val;
}

/**
 * Parse an INI string into a JavaScript object.
 * Keys in the global (no-section) scope are placed on the root object.
 * Keys within sections are placed under that section's key.
 * @param {string} src - INI content string.
 * @returns {Object} Parsed configuration object.
 */
export function parseIni(src) {
  if (typeof src !== 'string') throw new TypeError('parseIni expects a string');

  const result = {};
  let currentSection = null;
  let currentTarget = result;

  const lines = src.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#') || line.startsWith(';')) continue;

    // Section header: [section] or [section.subsection]
    if (line.startsWith('[') && line.endsWith(']')) {
      const sectionName = line.slice(1, -1).trim();
      const parts = sectionName.split('.');
      let target = result;
      for (const part of parts) {
        if (!target[part]) target[part] = {};
        target = target[part];
      }
      currentTarget = target;
      currentSection = sectionName;
      continue;
    }

    // Key-value pair
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) {
      // Key with no value (treat as boolean true)
      currentTarget[line.trim()] = true;
      continue;
    }

    const key = line.slice(0, eqIdx).trim();
    const rawVal = line.slice(eqIdx + 1);
    const value = parseValue(rawVal);

    // Handle multi-value keys: if key already exists, convert to array
    if (key in currentTarget) {
      if (!Array.isArray(currentTarget[key])) {
        currentTarget[key] = [currentTarget[key]];
      }
      currentTarget[key].push(value);
    } else {
      currentTarget[key] = value;
    }
  }

  return result;
}

/**
 * Serialize a JavaScript object to INI format.
 * @param {Object} obj - Object to serialize.
 * @param {Object} [options] - Options.
 * @param {boolean} [options.comments=false] - Include section comments.
 * @returns {string} INI formatted string.
 */
export function stringifyIni(obj, options = {}) {
  const lines = [];

  function serializeValue(val) {
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'string') {
      if (/[\n=\[\]#;]/.test(val) || val !== val.trim()) {
        return `"${val.replace(/"/g, '\\"')}"`;
      }
      return val;
    }
    return String(val);
  }

  // Global keys (non-object values at root)
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
      if (Array.isArray(value)) {
        for (const v of value) lines.push(`${key} = ${serializeValue(v)}`);
      } else {
        lines.push(`${key} = ${serializeValue(value)}`);
      }
    }
  }

  // Sections (object values at root)
  for (const [sectionName, section] of Object.entries(obj)) {
    if (typeof section === 'object' && !Array.isArray(section) && section !== null) {
      if (lines.length > 0) lines.push('');
      lines.push(`[${sectionName}]`);
      for (const [key, value] of Object.entries(section)) {
        if (Array.isArray(value)) {
          for (const v of value) lines.push(`${key} = ${serializeValue(v)}`);
        } else {
          lines.push(`${key} = ${serializeValue(value)}`);
        }
      }
    }
  }

  return lines.join('\n');
}
