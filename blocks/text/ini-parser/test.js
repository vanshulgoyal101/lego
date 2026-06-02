import { describe, it, expect } from '../../../test/test-harness.js';
import {parseIni, stringifyIni} from './index.js';

  await describe('text/ini-parser', async () => {
    await it('should parse global key-value pairs', () => {
      const result = parseIni('name=Alice\nversion=1.0');
      expect(result.name).toBe('Alice');
      expect(result.version).toBe(1.0);
    });

    await it('should parse sections', () => {
      const ini = '[database]\nhost=localhost\nport=5432\n[app]\nname=MyApp';
      const result = parseIni(ini);
      expect(result.database.host).toBe('localhost');
      expect(result.database.port).toBe(5432);
      expect(result.app.name).toBe('MyApp');
    });

    await it('should skip comments', () => {
      const ini = '# This is a comment\nkey=value ; inline comment\n; another comment';
      const result = parseIni(ini);
      expect(result.key).toBe('value');
      expect(Object.keys(result).length).toBe(1);
    });

    await it('should handle booleans and numbers', () => {
      const ini = 'enabled=true\ncount=42\nratio=3.14';
      const result = parseIni(ini);
      expect(result.enabled).toBe(true);
      expect(result.count).toBe(42);
      expect(result.ratio).toBe(3.14);
    });

    await it('should serialize back to INI format', () => {
      const obj = { host: 'localhost', database: { name: 'mydb', port: 5432 } };
      const ini = stringifyIni(obj);
      expect(ini.includes('[database]')).toBe(true);
      expect(ini.includes('host = localhost')).toBe(true);
    });
  });
