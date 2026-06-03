import { describe, it, expect } from '../../../test/test-harness.js';
import { parseMp3Metadata } from './index.js';

await describe('media/mp3-id3-parser', async () => {
  it('should parse ID3v2.3 metadata correctly', () => {
    // Construct mock ID3v2.3 header + frames
    // Header: "ID3" (3 bytes), version 3.0 (2 bytes), flags 0 (1 byte), size 38 (4 bytes synchsafe)
    const header = [
      0x49, 0x44, 0x33, // "ID3"
      0x03, 0x00,       // v2.3.0
      0x00,             // No flags
      0x00, 0x00, 0x00, 0x26 // Synchsafe size: 38 bytes
    ];

    // TIT2 frame: ID: TIT2, size: 10 (4 bytes), flags: 0 (2 bytes), encoding: 0 (latin1), text: "Hello"
    const tit2Frame = [
      0x54, 0x49, 0x54, 0x32, // "TIT2"
      0x00, 0x00, 0x00, 0x06, // Size: 6 (1 encoding byte + 5 text bytes)
      0x00, 0x00,             // Flags
      0x00,                   // Latin-1
      0x48, 0x65, 0x6C, 0x6C, 0x6F // "Hello"
    ];

    // TPE1 frame: ID: TPE1, size: 11 (4 bytes), flags: 0 (2 bytes), encoding: 0 (latin1), text: "Artist"
    const tpe1Frame = [
      0x54, 0x50, 0x45, 0x31, // "TPE1"
      0x00, 0x00, 0x00, 0x07, // Size: 7 (1 encoding byte + 6 text bytes)
      0x00, 0x00,             // Flags
      0x00,                   // Latin-1
      0x41, 0x72, 0x74, 0x69, 0x73, 0x74 // "Artist"
    ];

    // Rest of MP3 mock data
    const mockMp3 = new Uint8Array([
      ...header,
      ...tit2Frame,
      ...tpe1Frame
    ]);

    const tags = parseMp3Metadata(mockMp3);

    expect(tags.title).toBe('Hello');
    expect(tags.artist).toBe('Artist');
    expect(tags.album).toBe(null);
  });

  it('should parse ID3v1 metadata correctly from the end of the file', () => {
    // Construct 128-byte ID3v1 tag
    const v1Tag = new Uint8Array(128);
    // Signature: "TAG"
    v1Tag[0] = 0x54; v1Tag[1] = 0x41; v1Tag[2] = 0x47;
    // Title: "World"
    const titleBytes = [0x57, 0x6F, 0x72, 0x6C, 0x64];
    v1Tag.set(titleBytes, 3);
    // Artist: "Foo"
    const artistBytes = [0x46, 0x6F, 0x6F];
    v1Tag.set(artistBytes, 33);
    // Album: "Bar"
    const albumBytes = [0x42, 0x61, 0x72];
    v1Tag.set(albumBytes, 63);
    // Year: "2026"
    const yearBytes = [0x32, 0x30, 0x32, 0x36];
    v1Tag.set(yearBytes, 93);
    // Genre: 13 (Pop)
    v1Tag[127] = 13;

    // Concat dummy MP3 audio payload + v1Tag
    const mockMp3 = new Uint8Array(200);
    mockMp3.set(v1Tag, 200 - 128);

    const tags = parseMp3Metadata(mockMp3);

    expect(tags.title).toBe('World');
    expect(tags.artist).toBe('Foo');
    expect(tags.album).toBe('Bar');
    expect(tags.year).toBe('2026');
    expect(tags.genre).toBe('Pop');
  });
});
