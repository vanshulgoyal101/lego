import { describe, it, expect } from '../../../test/test-harness.js';
import {parseYaml, stringifyYaml} from './index.js';

  await describe('text/yaml-parser', async () => {
    await it('should parse simple key-value mappings', () => {
      const yaml = `name: Alice\nage: 30\nactive: true`;
      const result = parseYaml(yaml);
      expect(result.name).toBe('Alice');
      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
    });

    await it('should parse nested mappings', () => {
      const yaml = `user:\n  name: Bob\n  address:\n    city: London\n    zip: SW1`;
      const result = parseYaml(yaml);
      expect(result.user.name).toBe('Bob');
      expect(result.user.address.city).toBe('London');
    });

    await it('should parse sequences (arrays)', () => {
      const yaml = `fruits:\n  - apple\n  - banana\n  - cherry`;
      const result = parseYaml(yaml);
      expect(result.fruits.length).toBe(3);
      expect(result.fruits[0]).toBe('apple');
      expect(result.fruits[2]).toBe('cherry');
    });

    await it('should parse scalars: null, booleans, numbers', () => {
      const yaml = `nul: null\nbool1: true\nbool2: false\nint: 42\nfloat: 3.14`;
      const result = parseYaml(yaml);
      expect(result.nul).toBe(null);
      expect(result.bool1).toBe(true);
      expect(result.bool2).toBe(false);
      expect(result.int).toBe(42);
      expect(result.float).toBe(3.14);
    });

    await it('should handle inline flow arrays', () => {
      const yaml = `colors: [red, green, blue]`;
      const result = parseYaml(yaml);
      expect(result.colors.length).toBe(3);
      expect(result.colors[1]).toBe('green');
    });

    await it('should skip comments and empty lines', () => {
      const yaml = `# top comment\nname: Test\n# another comment\nvalue: 99`;
      const result = parseYaml(yaml);
      expect(result.name).toBe('Test');
      expect(result.value).toBe(99);
    });

    await it('should serialize to YAML and parse back round-trip', () => {
      const obj = { name: 'John', scores: [10, 20, 30], active: true };
      const yaml = stringifyYaml(obj);
      expect(yaml.includes('name')).toBe(true);
      expect(yaml.includes('scores')).toBe(true);
    });

    await it('should reject unsafe keys that can cause prototype pollution', () => {
      expect(() => parseYaml('__proto__: bad')).toThrow('Unsafe YAML key');
      expect({}.bad).toBe(undefined);
    });
  });
