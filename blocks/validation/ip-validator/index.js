/**
 * IP Validator providing robust cross-runtime IPv4/IPv6 syntax checks,
 * CIDR subnet matches, routing scope (public vs private/local) checks, and loopbacks.
 */

// Regex patterns
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Matches standard and shorthand IPv6 patterns (excluding hybrid IPv4-mapped addresses for simplicity and safety)
const IPV6_REGEX = /^(?:(?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

export function isV4(ip) {
  return typeof ip === 'string' && IPV4_REGEX.test(ip);
}

export function isV6(ip) {
  return typeof ip === 'string' && IPV6_REGEX.test(ip);
}

export function isIP(ip) {
  if (isV4(ip)) return 4;
  if (isV6(ip)) return 6;
  return 0;
}

/**
 * Returns true if the IP is in a private network range.
 */
export function isPrivate(ip) {
  const version = isIP(ip);
  if (version === 4) {
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    return (
      cidrMatch(ip, '10.0.0.0/8') ||
      cidrMatch(ip, '172.16.0.0/12') ||
      cidrMatch(ip, '192.168.0.0/16')
    );
  } else if (version === 6) {
    // Unique Local Addresses: fc00::/7
    // Link Local: fe80::/10
    return (
      cidrMatch(ip, 'fc00::/7') ||
      cidrMatch(ip, 'fe80::/10')
    );
  }
  return false;
}

/**
 * Returns true if the IP is a loopback address.
 */
export function isLoopback(ip) {
  const version = isIP(ip);
  if (version === 4) {
    // 127.0.0.0/8
    return cidrMatch(ip, '127.0.0.0/8');
  } else if (version === 6) {
    // ::1/128
    return ip === '::1' || cidrMatch(ip, '::1/128');
  }
  return false;
}

/**
 * Parses an IPv4 address to a 32-bit integer.
 */
function ipv4ToInt(ip) {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/**
 * Parses an IPv6 address to an array of 8 x 16-bit integers.
 */
function ipv6ToParts(ip) {
  // Normalize double colons "::"
  let formatted = ip;
  if (ip.includes('::')) {
    const parts = ip.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const needed = 8 - (left.length + right.length);
    const middle = Array(needed).fill('0');
    formatted = [...left, ...middle, ...right].join(':');
  }

  return formatted.split(':').map(part => parseInt(part || '0', 16));
}

/**
 * Checks if a given IP is contained within a specific CIDR range.
 * Supports both IPv4 and IPv6 comparisons.
 */
export function cidrMatch(ip, cidr) {
  if (typeof ip !== 'string' || typeof cidr !== 'string') return false;

  const [rangeIp, prefixStr] = cidr.split('/');
  const prefix = prefixStr !== undefined ? parseInt(prefixStr, 10) : null;

  const ipVersion = isIP(ip);
  const rangeVersion = isIP(rangeIp);

  if (ipVersion === 0 || ipVersion !== rangeVersion) {
    return false;
  }

  if (ipVersion === 4) {
    const ipInt = ipv4ToInt(ip);
    const rangeInt = ipv4ToInt(rangeIp);
    const maskLen = prefix !== null ? prefix : 32;

    if (maskLen < 0 || maskLen > 32) return false;
    if (maskLen === 0) return true;

    // Shift in JS works on signed 32-bit ints, use unsigned conversion >>>
    const mask = (~(0xffffffff >>> maskLen)) >>> 0;
    return (ipInt & mask) === (rangeInt & mask);
  } else {
    // IPv6
    const ipParts = ipv6ToParts(ip);
    const rangeParts = ipv6ToParts(rangeIp);
    const maskLen = prefix !== null ? prefix : 128;

    if (maskLen < 0 || maskLen > 128) return false;
    if (maskLen === 0) return true;

    let remainingBits = maskLen;
    for (let i = 0; i < 8; i++) {
      if (remainingBits >= 16) {
        if (ipParts[i] !== rangeParts[i]) return false;
        remainingBits -= 16;
      } else if (remainingBits > 0) {
        const mask = (0xffff << (16 - remainingBits)) & 0xffff;
        if ((ipParts[i] & mask) !== (rangeParts[i] & mask)) return false;
        break;
      } else {
        break;
      }
    }
    return true;
  }
}
