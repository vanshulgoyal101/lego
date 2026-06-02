/**
 * POSIX ustar Tar Archiver and Extractor
 * Pure JS, zero-dependency implementation of the ustar tar format.
 * Works across Node.js, Deno, Bun, and Browser environments using standard Uint8Array and TextEncoder/TextDecoder.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Helper to write a string into a Uint8Array slice with null padding
function writeString(buffer, offset, str, maxLength) {
  const bytes = encoder.encode(str);
  const writeLength = Math.min(bytes.length, maxLength);
  buffer.set(bytes.subarray(0, writeLength), offset);
  // Null padding is already there if buffer was zero-initialized, but let's be explicit
  for (let i = writeLength; i < maxLength; i++) {
    buffer[offset + i] = 0;
  }
}

// Helper to read a null-terminated string from a buffer slice
function readString(buffer, offset, maxLength) {
  let end = offset;
  const limit = offset + maxLength;
  while (end < limit && buffer[end] !== 0) {
    end++;
  }
  return decoder.decode(buffer.subarray(offset, end)).trim();
}

// Helper to format an octal number in tar style (padded with spaces/nulls)
function writeOctal(buffer, offset, value, size) {
  // Tar format octal numbers are padded with leading zeroes and terminated with a space or null.
  // Standard ustar writes (size - 1) octal digits, followed by a null or space.
  const octalStr = value.toString(8).padStart(size - 1, '0');
  writeString(buffer, offset, octalStr, size - 1);
  buffer[offset + size - 1] = 0; // null terminator
}

// Helper to parse a tar style octal number
function readOctal(buffer, offset, size) {
  let valStr = '';
  const limit = offset + size;
  for (let i = offset; i < limit; i++) {
    const charCode = buffer[i];
    if (charCode === 0 || charCode === 32) { // Null or space termination
      break;
    }
    valStr += String.fromCharCode(charCode);
  }
  return parseInt(valStr.trim() || '0', 8);
}

// Calculate the checksum of a 512-byte header block
function computeChecksum(header) {
  let sum = 0;
  for (let i = 0; i < 512; i++) {
    // During checksum calculation, the 8 bytes at 148-155 (checksum field) are treated as spaces (ASCII 32)
    if (i >= 148 && i < 156) {
      sum += 32;
    } else {
      sum += header[i];
    }
  }
  return sum;
}

/**
 * Encodes a list of file records into a tar archive.
 * @param {Array<Object>} files - Array of files to archive.
 * @param {string} files[].name - File path/name.
 * @param {Uint8Array|string} files[].content - Content of the file.
 * @param {number} [files[].mode=0o644] - Octal permissions.
 * @param {number} [files[].uid=0] - User ID.
 * @param {number} [files[].gid=0] - Group ID.
 * @param {number} [files[].mtime] - Modification time (defaults to current time).
 * @param {string} [files[].typeflag='0'] - Typeflag ('0' = file, '5' = dir, etc.).
 * @returns {Uint8Array} - The packed tar archive byte array.
 */
export function pack(files) {
  const blocks = [];
  
  for (const file of files) {
    const header = new Uint8Array(512);
    const content = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const mode = file.mode !== undefined ? file.mode : 0o644;
    const uid = file.uid !== undefined ? file.uid : 0;
    const gid = file.gid !== undefined ? file.gid : 0;
    const mtime = file.mtime !== undefined ? file.mtime : Math.floor(Date.now() / 1000);
    const typeflag = file.typeflag !== undefined ? file.typeflag : '0';
    
    // 1. Write Header Fields
    writeString(header, 0, file.name, 100);       // name
    writeOctal(header, 100, mode, 8);             // mode
    writeOctal(header, 108, uid, 8);              // uid
    writeOctal(header, 116, gid, 8);              // gid
    writeOctal(header, 124, content.byteLength, 12); // size
    writeOctal(header, 136, mtime, 12);           // mtime
    
    header[156] = typeflag.charCodeAt(0);          // typeflag
    
    writeString(header, 257, 'ustar', 6);         // magic
    writeString(header, 263, '00', 2);            // version
    writeString(header, 265, 'root', 32);         // uname
    writeString(header, 297, 'root', 32);         // gname
    
    // Compute & Write Checksum
    const checksum = computeChecksum(header);
    writeOctal(header, 148, checksum, 8);
    
    // Add header block
    blocks.push(header);
    
    // Add file content blocks (padded to 512-byte blocks)
    const contentBlocks = Math.ceil(content.byteLength / 512);
    const paddedContent = new Uint8Array(contentBlocks * 512);
    paddedContent.set(content);
    
    blocks.push(paddedContent);
  }
  
  // Tar archive terminates with at least two zero blocks (1024 zero bytes)
  blocks.push(new Uint8Array(1024));
  
  // Concatenate all blocks into a single Uint8Array
  const totalLength = blocks.reduce((acc, block) => acc + block.byteLength, 0);
  const tarBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const block of blocks) {
    tarBuffer.set(block, offset);
    offset += block.byteLength;
  }
  
  return tarBuffer;
}

/**
 * Extracts files from a tar archive.
 * @param {Uint8Array} tarBuffer - The raw tar archive byte array.
 * @returns {Array<Object>} - Decoded files array with metadata and contents.
 */
export function unpack(tarBuffer) {
  const files = [];
  let offset = 0;
  
  while (offset + 512 <= tarBuffer.byteLength) {
    const header = tarBuffer.subarray(offset, offset + 512);
    
    // Tar end sequence is represented by two zero blocks
    const isZeroHeader = header.every(byte => byte === 0);
    if (isZeroHeader) {
      offset += 512;
      continue;
    }
    
    // Validate checksum if block has content
    const recordedChecksum = readOctal(header, 148, 8);
    const calculatedChecksum = computeChecksum(header);
    if (recordedChecksum !== calculatedChecksum) {
      throw new Error(`Invalid tar header checksum at offset ${offset}: got ${calculatedChecksum}, recorded ${recordedChecksum}`);
    }
    
    const name = readString(header, 0, 100);
    const mode = readOctal(header, 100, 8);
    const uid = readOctal(header, 108, 8);
    const gid = readOctal(header, 116, 8);
    const size = readOctal(header, 124, 12);
    const mtime = readOctal(header, 136, 12);
    const typeflag = String.fromCharCode(header[156]);
    
    offset += 512; // Advance past header
    
    // Read content
    const contentBlocks = Math.ceil(size / 512);
    const rawContent = tarBuffer.subarray(offset, offset + size);
    
    // Copy content to avoid holding on to large parent buffers
    const content = new Uint8Array(size);
    content.set(rawContent);
    
    files.push({
      name,
      mode,
      uid,
      gid,
      size,
      mtime,
      typeflag,
      content
    });
    
    offset += contentBlocks * 512; // Advance past content blocks
  }
  
  return files;
}
