import { describe, it, expect } from '../../../test/test-harness.js';
import {validateSchema} from './index.js';

  await describe('compiler/json-schema-validator', async () => {
    await it('should validate draft-07 types, properties, and constraints', () => {
      const schema = {
        type: 'object',
        required: ['name', 'age'],
        properties: {
          name: { type: 'string', minLength: 2 },
          age: { type: 'integer', minimum: 18 },
          roles: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      };

      const validObj = { name: 'Vansh', age: 25, roles: ['admin', 'user'] };
      const invalidObj = { name: 'V', age: 17 };

      expect(validateSchema(validObj, schema).valid).toBe(true);
      
      const res = validateSchema(invalidObj, schema);
      expect(res.valid).toBe(false);
      expect(res.errors.length).toBe(2);
    });
  });
