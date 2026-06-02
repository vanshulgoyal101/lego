import { describe, it, expect } from '../../../test/test-harness.js';
import { parseMultipart } from './index.js';

await describe('web/multipart-parser', async () => {
  await it('should parse simple form fields and files correctly', () => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    
    // Construct raw mock payload bytes
    const bodyStr = 
      `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n` +
      `Content-Disposition: form-data; name="username"\r\n\r\n` +
      `alice\r\n` +
      `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n` +
      `Content-Disposition: form-data; name="avatar"; filename="face.png"\r\n` +
      `Content-Type: image/png\r\n\r\n` +
      `PNG_BINARY_DATA\r\n` +
      `------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n`;

    const bodyBuffer = new TextEncoder().encode(bodyStr);
    const { fields, files } = parseMultipart(bodyBuffer, boundary);

    expect(fields.username).toBe('alice');
    expect(files.avatar !== undefined).toBe(true);
    expect(files.avatar.filename).toBe('face.png');
    expect(files.avatar.contentType).toBe('image/png');
    
    const contentStr = new TextDecoder().decode(files.avatar.data);
    expect(contentStr).toBe('PNG_BINARY_DATA');
  });
});
