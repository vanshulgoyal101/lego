import { describe, it, expect } from '../../../test/test-harness.js';
import { AuditLogger } from './index.js';

describe('security/audit-logger', () => {
  it('should create audit log entries with HMAC chain successfully', () => {
    const logger = new AuditLogger('super-secret-hmac-key');
    
    const entry1 = logger.log('admin', 'user.create', { userId: 1 });
    expect(entry1.index).toBe(0);
    expect(entry1.previousHash).toBe('0'.repeat(64));
    expect(entry1.hash).toBeTruthy();

    const entry2 = logger.log('system', 'user.update', { userId: 1 });
    expect(entry2.index).toBe(1);
    expect(entry2.previousHash).toBe(entry1.hash);
    expect(entry2.hash).toBeTruthy();

    const verification = logger.verify();
    expect(verification.valid).toBe(true);
  });

  it('should detect tampering if an entry payload is modified', () => {
    const logger = new AuditLogger('my-secret');
    logger.log('admin', 'delete.db');
    logger.log('user', 'read.db');

    const entries = logger.getEntries();
    
    // Attempt tampering: modify payload of the first entry
    entries[0].payload = { hacked: true };

    const verification = AuditLogger.verifyChain(entries, 'my-secret');
    expect(verification.valid).toBe(false);
    expect(verification.reason.includes('Tampering detected')).toBe(true);
  });

  it('should detect insertion/deletion/reordering of entries', () => {
    const logger = new AuditLogger('my-secret');
    logger.log('admin', 'action1');
    logger.log('admin', 'action2');
    logger.log('admin', 'action3');

    const entries = logger.getEntries();
    
    // Attempt tampering: swap second and third entry
    const temp = entries[1];
    entries[1] = entries[2];
    entries[2] = temp;

    const verification = AuditLogger.verifyChain(entries, 'my-secret');
    expect(verification.valid).toBe(false);
  });

  it('should fail verification if incorrect secret key is used', () => {
    const logger = new AuditLogger('correct-secret');
    logger.log('admin', 'action1');
    logger.log('admin', 'action2');

    const entries = logger.getEntries();
    const verification = AuditLogger.verifyChain(entries, 'wrong-secret');
    expect(verification.valid).toBe(false);
  });
});
