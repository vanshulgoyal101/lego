import { describe, it, expect } from '../../../test/test-harness.js';
import { SessionManager } from './index.js';

await describe('web/session-manager', async () => {
  await it('should sign and unsign session cookies safely', () => {
    const sm = new SessionManager('super-secret-key-123');
    
    const sessionId = 'user_12345';
    const signed = sm.sign(sessionId);

    expect(signed.startsWith(sessionId)).toBe(true);

    const verified = sm.unsign(signed);
    expect(verified).toBe(sessionId);

    // Tamper attempt
    const tampered = signed + 'a';
    expect(sm.unsign(tampered)).toBe(null);
  });

  await it('should generate cookie headers correctly', () => {
    const sm = new SessionManager('secret', { maxAge: 3600 });
    const header = sm.getCookieHeader('123');
    expect(header.includes('session_id=')).toBe(true);
    expect(header.includes('Max-Age=3600')).toBe(true);
    expect(header.includes('HttpOnly')).toBe(true);
  });
});
