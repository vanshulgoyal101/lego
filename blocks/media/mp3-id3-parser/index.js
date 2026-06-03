const ID3V1_GENRES = [
  "Blues", "Classic Rock", "Country", "Dance", "Disco", "Funk", "Grunge",
  "Hip-Hop", "Jazz", "Metal", "New Age", "Oldies", "Other", "Pop", "R&B",
  "Rap", "Reggae", "Rock", "Techno", "Industrial", "Alternative", "Ska",
  "Death Metal", "Pranks", "Soundtrack", "Euro-Techno", "Ambient",
  "Trip-Hop", "Vocal", "Jazz+Funk", "Fusion", "Trance", "Classical",
  "Instrumental", "Acid", "House", "Game", "Sound Clip", "Gospel",
  "Noise", "AlternRock", "Bass", "Soul", "Punk", "Space", "Meditative",
  "Instrumental Pop", "Instrumental Rock", "Ethnic", "Gothic",
  "Darkwave", "Techno-Industrial", "Electronic", "Pop-Folk",
  "Eurodance", "Dream", "Southern Rock", "Comedy", "Cult", "Gangsta",
  "Top 40", "Christian Rap", "Pop/Funk", "Jungle", "Keyboard",
  "Novelty", "Classical", "Rhythm", "Art Rock", "Speech", "Chanson",
  "Opera", "Chamber Music", "Sonata", "Symphony", "Bootleg", "Satire",
  "Slow Rock", "Club", "Hardcore", "Rhythmic Soul", "Freestyle",
  "Duet", "Punk Rock", "Drum Solo", "A capella", "Acid Jazz", "Trip-Hop",
  "Rapid Share", "Goth Rock", "Industrial Rock", "Street/Alternative",
  "Metal/Goth", "Metal/Alternative", "Metal/Soundtrack", "Death/Black Metal",
  "Industrial Metal", "Death Grind", "Heavy Metal", "Death", "Grindcore",
  "Thrash", "Speed Metal", "Power Metal", "Progressive Metal",
  "Gothic Metal", "Symphonic Metal", "Doom Metal", "Black Metal",
  "Avantgarde", "Gothic/Darkwave"
];

function decodeText(bytes, encodingByte) {
  if (bytes.length === 0) return '';
  if (encodingByte === 0) {
    // Latin-1 (ISO-8859-1)
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) break;
      str += String.fromCharCode(bytes[i]);
    }
    return str.trim();
  } else if (encodingByte === 3) {
    // UTF-8
    try {
      const decoded = new TextDecoder('utf-8').decode(bytes);
      return decoded.replace(/\0+$/, '').trim();
    } catch {
      return decodeText(bytes, 0);
    }
  } else if (encodingByte === 1 || encodingByte === 2) {
    // UTF-16
    try {
      const decoded = new TextDecoder('utf-16').decode(bytes);
      return decoded.replace(/\0+$/, '').trim();
    } catch {
      return decodeText(bytes, 0);
    }
  }
  // Fallback to Latin-1
  return decodeText(bytes, 0);
}

function parseSynchsafe(bytes) {
  return (
    ((bytes[0] & 0x7F) << 21) |
    ((bytes[1] & 0x7F) << 14) |
    ((bytes[2] & 0x7F) << 7) |
    (bytes[3] & 0x7F)
  );
}

function parseStandard32(bytes) {
  return (
    (bytes[0] << 24) |
    (bytes[1] << 16) |
    (bytes[2] << 8) |
    bytes[3]
  );
}

function parseStandard24(bytes) {
  return (
    (bytes[0] << 16) |
    (bytes[1] << 8) |
    bytes[2]
  );
}

/**
 * Extracts ID3v1 and ID3v2 tags from an MP3 binary buffer.
 * @param {Uint8Array|ArrayBuffer|Buffer} buffer - The MP3 file buffer.
 * @returns {Object} Extracted tags (title, artist, album, year, genre).
 */
export function parseMp3Metadata(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  const tags = {
    title: null,
    artist: null,
    album: null,
    year: null,
    genre: null
  };

  // 1. Try parsing ID3v2 at the beginning
  if (bytes.length >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const majorVersion = bytes[3];
    const sizeBytes = bytes.subarray(6, 10);
    const id3Size = parseSynchsafe(sizeBytes);

    let offset = 10;
    const endOffset = Math.min(id3Size + 10, bytes.length);

    while (offset < endOffset) {
      let frameId = '';
      let frameSize = 0;
      let headerSize = 0;

      if (majorVersion === 2) {
        // ID3v2.2
        if (offset + 6 > endOffset) break;
        frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2]);
        frameSize = parseStandard24(bytes.subarray(offset + 3, offset + 6));
        headerSize = 6;
      } else {
        // ID3v2.3 or ID3v2.4
        if (offset + 10 > endOffset) break;
        frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
        
        const rawFrameSize = bytes.subarray(offset + 4, offset + 8);
        if (majorVersion === 4) {
          frameSize = parseSynchsafe(rawFrameSize);
        } else {
          frameSize = parseStandard32(rawFrameSize);
        }
        headerSize = 10;
      }

      if (!frameId || frameId.charCodeAt(0) === 0 || frameSize <= 0 || offset + headerSize + frameSize > endOffset) {
        break;
      }

      const dataStart = offset + headerSize;
      const frameData = bytes.subarray(dataStart, dataStart + frameSize);

      let key = null;
      if (frameId === 'TIT2' || frameId === 'TT2') key = 'title';
      else if (frameId === 'TPE1' || frameId === 'TP1') key = 'artist';
      else if (frameId === 'TALB' || frameId === 'TAL') key = 'album';
      else if (frameId === 'TYER' || frameId === 'TDRC' || frameId === 'TYE') key = 'year';
      else if (frameId === 'TCON' || frameId === 'TCO') key = 'genre';

      if (key && frameData.length > 1) {
        const encoding = frameData[0];
        const textValue = decodeText(frameData.subarray(1), encoding);
        
        // Handle parentheses or genre mappings in ID3v2 genre tags, e.g. "(13)" -> "Pop"
        if (key === 'genre' && textValue.startsWith('(') && textValue.endsWith(')')) {
          const genreId = parseInt(textValue.slice(1, -1), 10);
          if (!isNaN(genreId) && ID3V1_GENRES[genreId]) {
            tags.genre = ID3V1_GENRES[genreId];
          } else {
            tags.genre = textValue;
          }
        } else {
          tags[key] = textValue;
        }
      }

      offset += headerSize + frameSize;
    }
  }

  // 2. Try parsing ID3v1 at the end if we have enough bytes
  if (bytes.length >= 128) {
    const v1Offset = bytes.length - 128;
    if (bytes[v1Offset] === 0x54 && bytes[v1Offset + 1] === 0x41 && bytes[v1Offset + 2] === 0x47) {
      // "TAG"
      const readString = (start, length) => {
        let str = '';
        for (let i = 0; i < length; i++) {
          const charCode = bytes[v1Offset + start + i];
          if (charCode === 0) break;
          str += String.fromCharCode(charCode);
        }
        return str.trim();
      };

      if (!tags.title) tags.title = readString(3, 30);
      if (!tags.artist) tags.artist = readString(33, 30);
      if (!tags.album) tags.album = readString(63, 30);
      if (!tags.year) tags.year = readString(93, 4);
      if (!tags.genre) {
        const genreId = bytes[v1Offset + 127];
        if (ID3V1_GENRES[genreId]) {
          tags.genre = ID3V1_GENRES[genreId];
        }
      }
    }
  }

  return tags;
}
