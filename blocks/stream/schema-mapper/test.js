import { describe, it, expect } from '../../../test/test-harness.js';
import { SchemaMapper } from './index.js';

await describe('stream/schema-mapper', async () => {
  const schemaConfig = {
    fields: {
      id: { type: 'number', required: true, from: 'user_id' },
      email: { type: 'string', required: true, validate: (v) => v.includes('@') },
      active: { type: 'boolean', default: true },
      createdAt: { type: 'date', from: 'created_at' }
    }
  };

  await it('should successfully map and coerce valid records', async () => {
    const mapper = new SchemaMapper(schemaConfig);
    const raw = {
      user_id: '123',
      email: 'user@example.com',
      created_at: '2026-06-03T12:00:00Z'
    };

    const res = mapper.process(raw);
    expect(res.success).toBe(true);
    expect(res.data.id).toBe(123);
    expect(res.data.email).toBe('user@example.com');
    expect(res.data.active).toBe(true); // Default injected
    expect(res.data.createdAt instanceof Date).toBe(true);
    expect(res.data.createdAt.toISOString()).toBe('2026-06-03T12:00:00.000Z');
  });

  await it('should capture validation and missing required errors', async () => {
    const mapper = new SchemaMapper(schemaConfig);
    const raw = {
      user_id: 'abc', // invalid number coercion
      // missing email
      created_at: 'not-a-date' // invalid date coercion
    };

    const res = mapper.process(raw);
    expect(res.success).toBe(false);
    expect(res.errors.length).toBe(3);
    expect(res.errors.some(e => e.includes('id'))).toBe(true);
    expect(res.errors.some(e => e.includes('email'))).toBe(true);
    expect(res.errors.some(e => e.includes('createdAt'))).toBe(true);
  });

  await it('should transform an async iterable with dropInvalid option', async () => {
    const mapper = new SchemaMapper(schemaConfig);
    const records = [
      { user_id: 1, email: 'a@b.com' },
      { user_id: 2, email: 'bad-email' }, // fails validation
      { user_id: 3, email: 'c@d.com' }
    ];

    const errors = [];
    const output = [];

    const stream = mapper.transform(records, {
      dropInvalid: true,
      onError: (errs, rec) => {
        errors.push({ rec, errs });
      }
    });

    for await (const rec of stream) {
      output.push(rec);
    }

    expect(output.length).toBe(2);
    expect(output[0].id).toBe(1);
    expect(output[1].id).toBe(3);
    expect(errors.length).toBe(1);
    expect(errors[0].rec.user_id).toBe(2);
  });
});
