import { describe, it, expect } from '../../../test/test-harness.js';
import { SqlInjectionDetector } from './index.js';

await describe('validation/sql-injection-detector', async () => {
  await it('should recognize common SQL injection payloads', () => {
    const payloads = [
      "1' OR '1'='1",
      "admin' --",
      "1; DROP TABLE users;",
      "1 UNION SELECT null, username, password FROM users",
      "1' OR 2=2 --",
      "1' AND pg_sleep(5) --"
    ];

    for (const payload of payloads) {
      const res = SqlInjectionDetector.detect(payload);
      expect(res.isInjection).toBe(true);
    }
  });

  await it('should allow safe, normal inputs', () => {
    const safeInputs = [
      "john.doe@example.com",
      "my_secure_password123!",
      "Hello World, this is normal text.",
      "12345",
      "SELECT * FROM matches in a regular story" // contains SELECT but no injection structure
    ];

    for (const input of safeInputs) {
      const res = SqlInjectionDetector.detect(input);
      expect(res.isInjection).toBe(false);
      expect(res.score < 0.5).toBe(true);
    }
  });
});
