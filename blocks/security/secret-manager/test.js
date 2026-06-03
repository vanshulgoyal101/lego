import { describe, it, expect } from '../../../test/test-harness.js';
import { SecretManager } from './index.js';

describe('security/secret-manager', () => {
  it('should store and retrieve secrets successfully', () => {
    const sm = new SecretManager({ masterKey: 'my-super-secret-key' });
    
    sm.set('db_password', 'admin123');
    expect(sm.get('db_password')).toBe('admin123');
    
    // Storing structured data
    sm.set('config', { host: 'localhost', port: 5432 });
    expect(sm.get('config')).toEqual({ host: 'localhost', port: 5432 });

    sm.destroy();
  });

  it('should support checking existence of keys', () => {
    const sm = new SecretManager();
    sm.set('api_key', 'xyz');
    
    expect(sm.has('api_key')).toBe(true);
    expect(sm.has('non_existent')).toBe(false);
    
    sm.destroy();
  });

  it('should delete keys and return success state', () => {
    const sm = new SecretManager();
    sm.set('temp', 'val');
    
    expect(sm.delete('temp')).toBe(true);
    expect(sm.get('temp')).toBe(undefined);
    expect(sm.delete('temp')).toBe(false);

    sm.destroy();
  });

  it('should expire keys after TTL duration', async () => {
    const sm = new SecretManager({ ttlCheckIntervalMs: 50 });
    sm.set('short_lived', 'value', 10);
    
    expect(sm.get('short_lived')).toBe('value');
    
    // Wait for key to expire
    await new Promise(resolve => setTimeout(resolve, 30));
    
    expect(sm.get('short_lived')).toBe(undefined);
    expect(sm.has('short_lived')).toBe(false);

    sm.destroy();
  });

  it('should maintain a secure audit log of all actions', () => {
    const sm = new SecretManager({ masterKey: 'test-key' });
    sm.set('key1', 'val1');
    sm.get('key1');
    sm.get('invalid_key');
    sm.delete('key1');

    const logs = sm.getAuditLog();
    
    expect(logs.length).toBe(5); // INITIALIZE, SET, GET, GET (fail), DELETE
    expect(logs[0].action).toBe('INITIALIZE');
    expect(logs[1].action).toBe('SET');
    expect(logs[1].key).toBe('key1');
    expect(logs[1].status).toBe('success');
    expect(logs[1].ttl).toBe(null);
    
    expect(logs[2].action).toBe('GET');
    expect(logs[2].status).toBe('success');
    
    expect(logs[3].action).toBe('GET');
    expect(logs[3].status).toBe('failure');

    expect(logs[4].action).toBe('DELETE');
    expect(logs[4].status).toBe('success');

    // Confirm that the logs do not leak values
    const logString = JSON.stringify(logs);
    expect(logString.includes('val1')).toBe(false);

    sm.destroy();
  });
});
