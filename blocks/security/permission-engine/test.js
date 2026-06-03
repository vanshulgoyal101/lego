import { describe, it, expect } from '../../../test/test-harness.js';
import { PermissionEngine } from './index.js';

describe('security/permission-engine', () => {
  it('should support basic RBAC checks', () => {
    const pe = new PermissionEngine();
    pe.addPolicy({ role: 'user', action: 'read', resource: 'document' });
    
    expect(pe.check('user', 'read', 'document')).toBe(true);
    expect(pe.check('guest', 'read', 'document')).toBe(false);
  });

  it('should handle role hierarchies', () => {
    const pe = new PermissionEngine();
    // manager inherits user
    // admin inherits manager
    pe.addRole('manager', ['user']);
    pe.addRole('admin', ['manager']);

    pe.addPolicy({ role: 'user', action: 'read', resource: 'document' });
    pe.addPolicy({ role: 'manager', action: 'write', resource: 'document' });
    pe.addPolicy({ role: 'admin', action: 'delete', resource: 'document' });

    // User check
    expect(pe.check('user', 'read', 'document')).toBe(true);
    expect(pe.check('user', 'write', 'document')).toBe(false);

    // Manager check (inherits read)
    expect(pe.check('manager', 'read', 'document')).toBe(true);
    expect(pe.check('manager', 'write', 'document')).toBe(true);
    expect(pe.check('manager', 'delete', 'document')).toBe(false);

    // Admin check (inherits read, write, delete)
    expect(pe.check('admin', 'read', 'document')).toBe(true);
    expect(pe.check('admin', 'write', 'document')).toBe(true);
    expect(pe.check('admin', 'delete', 'document')).toBe(true);
  });

  it('should support action/resource wildcards', () => {
    const pe = new PermissionEngine();
    pe.addPolicy({ role: 'admin', action: '*', resource: 'server:*' });

    expect(pe.check('admin', 'reboot', 'server:us-east')).toBe(true);
    expect(pe.check('admin', 'shutdown', 'database:main')).toBe(false);
  });

  it('should enforce deny-precedence rules', () => {
    const pe = new PermissionEngine();
    // Allow admin to do anything
    pe.addPolicy({ role: 'admin', action: '*', resource: '*' });
    // Deny admin to delete prod DB explicitly
    pe.addPolicy({ role: 'admin', action: 'delete', resource: 'db:prod', effect: 'deny' });

    expect(pe.check('admin', 'read', 'db:prod')).toBe(true);
    expect(pe.check('admin', 'delete', 'db:test')).toBe(true);
    expect(pe.check('admin', 'delete', 'db:prod')).toBe(false); // Deny takes precedence
  });

  it('should support ABAC checks using context conditions', () => {
    const pe = new PermissionEngine();
    pe.addPolicy({
      role: 'user',
      action: 'edit',
      resource: 'document',
      condition: (ctx) => ctx.user.id === ctx.resource.ownerId
    });

    const contextMatch = {
      user: { id: 'u123' },
      resource: { ownerId: 'u123' }
    };

    const contextMismatch = {
      user: { id: 'u123' },
      resource: { ownerId: 'u456' }
    };

    expect(pe.check('user', 'edit', 'document', contextMatch)).toBe(true);
    expect(pe.check('user', 'edit', 'document', contextMismatch)).toBe(false);
  });
});
