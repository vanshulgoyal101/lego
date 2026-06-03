import { describe, it, expect } from '../../../test/test-harness.js';
import { parse } from './index.js';

await describe('sys/env-parser', async () => {
  await it('should parse simple variables, skipping comments and empty lines', () => {
    const env = `
      PORT=8080
      # Database config
      DB_HOST=localhost
      DB_PORT=5432
      
      EMPTY_VAL=
    `;
    const result = parse(env);
    expect(result.PORT).toBe('8080');
    expect(result.DB_HOST).toBe('localhost');
    expect(result.DB_PORT).toBe('5432');
    expect(result.EMPTY_VAL).toBe('');
  });

  await it('should parse quoted values and strip quotes', () => {
    const env = `
      STR1="double quoted value"
      STR2='single quoted value'
      STR3="value with # hash symbol"
    `;
    const result = parse(env);
    expect(result.STR1).toBe('double quoted value');
    expect(result.STR2).toBe('single quoted value');
    expect(result.STR3).toBe('value with # hash symbol');
  });

  await it('should strip inline comments for unquoted values only', () => {
    const env = `
      UNQUOTED=value # inline comment
      QUOTED="value # inline comment"
    `;
    const result = parse(env);
    expect(result.UNQUOTED).toBe('value');
    expect(result.QUOTED).toBe('value # inline comment');
  });

  await it('should handle escaped sequences', () => {
    const env = `
      ESCAPED="line1\\nline2\\ttabbed"
    `;
    const result = parse(env);
    expect(result.ESCAPED).toBe('line1\nline2\ttabbed');
  });

  await it('should parse multiline quoted variables correctly', () => {
    const env = `
      CERT="-----BEGIN CERT-----
      MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A
      -----END CERT-----"
      PORT=80
    `;
    const result = parse(env);
    expect(result.CERT.includes('-----BEGIN CERT-----')).toBe(true);
    expect(result.CERT.includes('-----END CERT-----')).toBe(true);
    expect(result.PORT).toBe('80');
  });
});
