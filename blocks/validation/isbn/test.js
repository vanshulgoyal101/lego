import { describe, it, expect } from '../../../test/test-harness.js';
import { validate } from './index.js';

await describe('validation/isbn', async () => {
  await it('should correctly validate standard ISBN-10 and ISBN-13 codes, including X characters, space and dash formatting', () => {
    // Valid ISBN-10
    expect(validate('0-306-40615-2')).toBe(true);
    expect(validate('0306406152')).toBe(true);
    expect(validate('0-9752298-0-X')).toBe(true); // check digit is X

    // Valid ISBN-13
    expect(validate('978-3-16-148410-0')).toBe(true);
    expect(validate('9783161484100')).toBe(true);

    // Invalid formatting or checksums
    expect(validate('0-306-40615-5')).toBe(false); // invalid checksum
    expect(validate('978-3-16-148410-5')).toBe(false); // invalid checksum
    expect(validate('12345')).toBe(false); // invalid length
    expect(validate('')).toBe(false);
  });
});
