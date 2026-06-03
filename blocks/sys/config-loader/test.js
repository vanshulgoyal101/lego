import { describe, it, expect } from '../../../test/test-harness.js';
import { ConfigLoader, deepMerge, parseValue } from './index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempJson = path.join(__dirname, 'temp_config.json');

await describe('sys/config-loader', async () => {
  await it('should deep merge objects correctly', () => {
    const a = { port: 80, db: { host: 'localhost', user: 'root' } };
    const b = { db: { host: '127.0.0.1', pass: 'secret' }, debug: true };
    const merged = deepMerge({}, a, b);

    expect(merged.port).toBe(80);
    expect(merged.db.host).toBe('127.0.0.1');
    expect(merged.db.user).toBe('root');
    expect(merged.db.pass).toBe('secret');
    expect(merged.debug).toBe(true);
  });

  await it('should parse primitive values correctly', () => {
    expect(parseValue('true')).toBe(true);
    expect(parseValue('false')).toBe(false);
    expect(parseValue('123')).toBe(123);
    expect(parseValue('abc')).toBe('abc');
  });

  await it('should load default configuration', () => {
    const loader = new ConfigLoader({ port: 3000, db: { name: 'test' } });
    expect(loader.load()).toEqual({ port: 3000, db: { name: 'test' } });
  });

  await it('should load from JSON files', async () => {
    await fs.writeFile(tempJson, JSON.stringify({ port: 4000, db: { host: 'remote' } }));

    const loader = new ConfigLoader({ port: 3000, db: { name: 'test', host: 'local' } });
    loader.addJsonFile(tempJson);

    const config = loader.load();
    expect(config.port).toBe(4000);
    expect(config.db.name).toBe('test');
    expect(config.db.host).toBe('remote');

    await fs.unlink(tempJson);
  });

  await it('should load and map environment variables', () => {
    process.env.TESTAPP_PORT = '5000';
    process.env.TESTAPP_DB__PASSWORD = 'sql';
    process.env.TESTAPP_DEBUG_MODE = 'true';

    const loader = new ConfigLoader({ port: 3000, db: { password: 'none' } });
    loader.addEnv('TESTAPP_');

    const config = loader.load();
    expect(config.port).toBe(5000);
    expect(config.db.password).toBe('sql');
    expect(config.debugMode).toBe(true);

    delete process.env.TESTAPP_PORT;
    delete process.env.TESTAPP_DB__PASSWORD;
    delete process.env.TESTAPP_DEBUG_MODE;
  });

  await it('should load and map CLI arguments', () => {
    const args = ['--port=8080', '--db.user', 'postgres', '-d'];
    const loader = new ConfigLoader({ port: 3000, db: { user: 'root' }, debug: false });
    
    loader.addCli(args, {
      '-d': 'debug'
    });

    const config = loader.load();
    expect(config.port).toBe(8080);
    expect(config.db.user).toBe('postgres');
    expect(config.debug).toBe(true);
  });
});
