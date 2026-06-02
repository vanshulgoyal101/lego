/**
 * RFC 5321/5322 Email Validator
 * Validates email address syntax including local-part, domain, and all edge cases.
 */

// Maximum lengths per RFC
const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 255;
const MAX_LABEL_LENGTH = 63;

// Characters allowed in unquoted local part per RFC 5321
const LOCAL_SPECIAL_CHARS = new Set("!#$%&'*+/=?^_`{|}~-.");
const PRINTABLE_ASCII = /^[\x21-\x7E]+$/;

/**
 * Validate a single domain label (part between dots).
 */
function isValidDomainLabel(label) {
  if (!label || label.length > MAX_LABEL_LENGTH) return false;
  if (label.startsWith('-') || label.endsWith('-')) return false;
  return /^[a-zA-Z0-9-]+$/.test(label);
}

/**
 * Validate a domain name (after @).
 */
function isValidDomain(domain) {
  if (!domain || domain.length > MAX_DOMAIN_LENGTH) return false;

  // IP address literal: [x.x.x.x]
  if (domain.startsWith('[') && domain.endsWith(']')) {
    const ip = domain.slice(1, -1);
    // IPv4
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      return ip.split('.').every(n => parseInt(n, 10) <= 255);
    }
    // IPv6 literal
    if (ip.startsWith('IPv6:')) {
      return /^IPv6:[0-9a-fA-F:]+$/.test(ip);
    }
    return false;
  }

  const labels = domain.split('.');
  if (labels.length < 2) return false;

  // TLD must be at least 2 chars, all alpha
  const tld = labels[labels.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld) && !/^xn--[a-zA-Z0-9]+$/.test(tld)) return false;

  return labels.every(label => isValidDomainLabel(label));
}

/**
 * Validate the local part (before @).
 */
function isValidLocalPart(local) {
  if (!local || local.length > MAX_LOCAL_LENGTH) return false;

  // Quoted string: "..."
  if (local.startsWith('"') && local.endsWith('"')) {
    const inner = local.slice(1, -1);
    // Must be printable ASCII, backslash escaping allowed
    for (let i = 0; i < inner.length; i++) {
      const code = inner.charCodeAt(i);
      if (inner[i] === '\\') {
        i++; // Skip escaped char
        if (i >= inner.length) return false;
        continue;
      }
      if (code < 32 || code > 126) return false; // Not printable ASCII
    }
    return true;
  }

  // Unquoted local part
  if (local.startsWith('.') || local.endsWith('.')) return false;
  if (local.includes('..')) return false;

  for (const char of local) {
    const code = char.charCodeAt(0);
    const isAlphaNum = (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
    if (!isAlphaNum && !LOCAL_SPECIAL_CHARS.has(char)) return false;
  }

  return true;
}

/**
 * Validate an email address per RFC 5321/5322.
 * @param {string} email - Email address to validate.
 * @returns {{ valid: boolean, error?: string }} Validation result.
 */
export function validateEmail(email) {
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: `Email exceeds maximum length of ${MAX_EMAIL_LENGTH} characters` };
  }

  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) {
    return { valid: false, error: 'Missing @ sign' };
  }
  if (atIndex === 0) {
    return { valid: false, error: 'Local part cannot be empty' };
  }
  if (atIndex === email.length - 1) {
    return { valid: false, error: 'Domain cannot be empty' };
  }

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (!isValidLocalPart(local)) {
    return { valid: false, error: `Invalid local part: "${local}"` };
  }

  if (!isValidDomain(domain)) {
    return { valid: false, error: `Invalid domain: "${domain}"` };
  }

  return { valid: true };
}

/**
 * Simple boolean check — whether an email is valid.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return validateEmail(email).valid;
}

/**
 * Extract parts of an email address.
 * @param {string} email
 * @returns {{ local: string, domain: string, tld: string } | null}
 */
export function parseEmail(email) {
  if (!isValidEmail(email)) return null;
  const atIdx = email.lastIndexOf('@');
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  return { local, domain, tld };
}
