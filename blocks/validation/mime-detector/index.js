/**
 * Detect the MIME type of a file buffer using magic byte signatures and heuristics
 *
 * @param {Uint8Array|Buffer|number[]} buffer - The file binary content
 * @returns {string} Guessed MIME type string (defaults to 'application/octet-stream')
 */
export function detectMime(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length === 0) return 'application/octet-stream';

  const match = (sig) => {
    const sigBytes = sig.split(' ').map(h => parseInt(h, 16));
    if (bytes.length < sigBytes.length) return false;
    for (let i = 0; i < sigBytes.length; i++) {
      if (bytes[i] !== sigBytes[i]) return false;
    }
    return true;
  };

  // Magic byte checks
  if (match('89 50 4E 47 0D 0A 1A 0A')) return 'image/png';
  if (match('FF D8 FF')) return 'image/jpeg';
  if (match('47 49 46 38 37 61') || match('47 49 46 38 39 61')) return 'image/gif';
  if (match('25 50 44 46')) return 'application/pdf';
  if (match('50 4B 03 04')) return 'application/zip';
  if (match('1F 8B')) return 'application/gzip';
  if (match('49 44 33')) return 'audio/mpeg';

  // WebP signature check (RIFF .... WEBP)
  if (bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }

  // Text-based heuristics
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes.slice(0, 1000)).trim();
    if (text.startsWith('{') || text.startsWith('[')) {
      return 'application/json';
    }
    if (text.startsWith('<?xml') || (text.startsWith('<') && text.endsWith('>'))) {
      return 'application/xml';
    }
    if (text.startsWith('<html') || text.startsWith('<!DOCTYPE html') || text.startsWith('<!doctype html')) {
      return 'text/html';
    }
    return 'text/plain';
  } catch {
    // Binary fallback
  }

  return 'application/octet-stream';
}
export default detectMime;
