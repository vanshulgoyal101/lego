import { describe, it, expect } from '../../../test/test-harness.js';
import { LogFormatter } from './index.js';

describe('observability/log-formatter – LogFormatter', () => {
  it('should format logs with service name and level', () => {
    const logger = new LogFormatter({ service: 'auth-service', level: 'INFO' });
    const logStr = logger.info('user logged in');
    expect(typeof logStr).toBe('string');
    
    const parsed = JSON.parse(logStr);
    expect(parsed.level).toBe('INFO');
    expect(parsed.service).toBe('auth-service');
    expect(parsed.message).toBe('user logged in');
    expect(typeof parsed.timestamp).toBe('string');
  });

  it('should filter logs below threshold level', () => {
    const logger = new LogFormatter({ level: 'WARN' });
    expect(logger.debug('debug message')).toBe(null);
    expect(logger.info('info message')).toBe(null);
    expect(typeof logger.warn('warn message')).toBe('string');
    expect(typeof logger.error('error message')).toBe('string');
  });

  it('should include correlationId if provided', () => {
    const logger = new LogFormatter();
    const logStr = logger.info('processing request', {}, 'req-abc-123');
    const parsed = JSON.parse(logStr);
    expect(parsed.correlationId).toBe('req-abc-123');
  });

  it('should redact sensitive keys in meta object', () => {
    const logger = new LogFormatter({
      redactKeys: ['password', 'secretToken']
    });

    const meta = {
      user: 'alice',
      password: 'super-secret-password',
      nested: {
        secretToken: 'xyz-token',
        valid: true
      }
    };

    const logStr = logger.info('payload test', meta);
    const parsed = JSON.parse(logStr);

    expect(parsed.meta.user).toBe('alice');
    expect(parsed.meta.password).toBe('[REDACTED]');
    expect(parsed.meta.nested.secretToken).toBe('[REDACTED]');
    expect(parsed.meta.nested.valid).toBe(true);
  });

  it('should handle circular references gracefully during redaction', () => {
    const logger = new LogFormatter();
    const obj = { a: 1 };
    obj.self = obj;

    const logStr = logger.info('circular', { obj });
    const parsed = JSON.parse(logStr);
    expect(parsed.meta.obj.a).toBe(1);
    expect(parsed.meta.obj.self).toBe('[Circular]');
  });
});
