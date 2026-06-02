/**
 * Multipart Form Data Parser
 * Zero-dependency parser for parsing multipart/form-data payloads.
 *
 * @param {Buffer|Uint8Array} bodyBuffer - Raw HTTP body payload bytes
 * @param {string} boundary - Boundary divider token extracted from Content-Type
 * @returns {Object} { fields: { [name]: val }, files: { [name]: { filename, contentType, data: Uint8Array } } }
 */
export function parseMultipart(bodyBuffer, boundary) {
  const fields = {};
  const files = {};

  const delimiter = `--${boundary}`;
  const endDelimiter = `--${boundary}--`;

  // Convert buffer to Uint8Array if needed
  const arr = bodyBuffer instanceof Uint8Array ? bodyBuffer : new Uint8Array(bodyBuffer);

  // Simple parser: find indices of boundary separators
  const parts = splitBuffer(arr, delimiter);

  for (const part of parts) {
    if (part.length === 0) continue;

    // Check if it's the end boundary segment
    if (part.length >= 2 && part[0] === 45 && part[1] === 45) { // '--'
      break;
    }

    // Split headers and body at CRLFCRLF
    const splitIndex = findSubArray(part, new Uint8Array([13, 10, 13, 10])); // \r\n\r\n
    if (splitIndex === -1) continue;

    const headersRaw = new TextDecoder('utf-8').decode(part.subarray(0, splitIndex));
    // The data body content: skip the CRLFCRLF and strip the trailing CRLF (added by boundary format)
    const content = part.subarray(splitIndex + 4, part.length - 2);

    // Parse headers
    const headers = parseHeaders(headersRaw);
    const contentDisposition = headers['content-disposition'] || '';

    const nameMatch = /name="([^"]+)"/.exec(contentDisposition);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);

    if (filenameMatch) {
      const filename = filenameMatch[1];
      const contentType = headers['content-type'] || 'application/octet-stream';
      files[name] = {
        filename,
        contentType,
        data: content
      };
    } else {
      fields[name] = new TextDecoder('utf-8').decode(content);
    }
  }

  return { fields, files };
}

function parseHeaders(headersRaw) {
  const headers = {};
  const lines = headersRaw.split('\r\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const name = line.slice(0, colonIdx).trim().toLowerCase();
      const val = line.slice(colonIdx + 1).trim();
      headers[name] = val;
    }
  }
  return headers;
}

function splitBuffer(arr, delimiterStr) {
  const delimiter = new TextEncoder().encode(delimiterStr);
  const parts = [];
  let start = 0;

  while (true) {
    const index = findSubArray(arr.subarray(start), delimiter);
    if (index === -1) {
      // Push remaining bytes if any
      if (start < arr.length) {
        parts.push(arr.subarray(start));
      }
      break;
    }
    const boundaryPos = start + index;
    if (boundaryPos > start) {
      parts.push(arr.subarray(start, boundaryPos));
    }
    start = boundaryPos + delimiter.length;
    // Skip optional preceding \r\n
    if (start < arr.length && arr[start] === 13 && arr[start + 1] === 10) {
      start += 2;
    }
  }
  return parts;
}

function findSubArray(arr, sub) {
  if (sub.length === 0 || arr.length < sub.length) return -1;
  for (let i = 0; i <= arr.length - sub.length; i++) {
    let match = true;
    for (let j = 0; j < sub.length; j++) {
      if (arr[i + j] !== sub[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}
