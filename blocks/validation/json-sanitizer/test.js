import { describe, it, expect } from '../../../test/test-harness.js';
import { JsonSanitizer } from './index.js';

await describe('validation/json-sanitizer', async () => {
  await it('should sanitize relaxed JSON correctly', () => {
    const malformed = `
      // This is a comment
      {
        /* Multi-line
           comment */
        unquoted: "value",
        'singleQuotes': 'test',
        "array": [1, 2, 3, ], // trailing comma
      }
    `;

    const clean = JsonSanitizer.sanitize(malformed);
    
    // Should parse cleanly with native JSON.parse
    const parsed = JSON.parse(clean);
    
    expect(parsed.unquoted).toBe('value');
    expect(parsed.singleQuotes).toBe('test');
    expect(parsed.array.length).toBe(3);
    expect(parsed.array[2]).toBe(3);
  });
});
