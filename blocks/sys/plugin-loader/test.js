import { describe, it, expect } from '../../../test/test-harness.js';
import { PluginManager } from './index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempPluginsDir = path.join(__dirname, 'temp_plugins');

await describe('sys/plugin-loader', async () => {
  await it('should register and sort plugins based on dependencies', () => {
    const pm = new PluginManager();
    
    pm.register({ name: 'db', dependencies: [] });
    pm.register({ name: 'auth', dependencies: ['db'] });
    pm.register({ name: 'server', dependencies: ['auth', 'db'] });

    const sorted = pm.sort();
    
    expect(sorted[0].name).toBe('db');
    expect(sorted[1].name).toBe('auth');
    expect(sorted[2].name).toBe('server');
  });

  await it('should throw error on circular dependencies', () => {
    const pm = new PluginManager();
    
    pm.register({ name: 'a', dependencies: ['b'] });
    pm.register({ name: 'b', dependencies: ['a'] });

    expect(() => pm.sort()).toThrow('Circular dependency detected');
  });

  await it('should throw error on missing dependency', () => {
    const pm = new PluginManager();
    pm.register({ name: 'a', dependencies: ['missing'] });

    expect(() => pm.sort()).toThrow('requires missing dependency');
  });

  await it('should trigger lifecycle hooks in topological order and reverse on stop', async () => {
    const pm = new PluginManager({ log: [] });
    
    pm.register({
      name: 'db',
      init: async (ctx) => { ctx.log.push('db-init'); },
      stop: async (ctx) => { ctx.log.push('db-stop'); }
    });

    pm.register({
      name: 'auth',
      dependencies: ['db'],
      init: async (ctx) => { ctx.log.push('auth-init'); },
      stop: async (ctx) => { ctx.log.push('auth-stop'); }
    });

    await pm.triggerHook('init');
    expect(pm.context.log).toEqual(['db-init', 'auth-init']);

    await pm.triggerHook('stop');
    expect(pm.context.log).toEqual(['db-init', 'auth-init', 'auth-stop', 'db-stop']);
  });

  await it('should discover and load plugins from directory dynamically', async () => {
    try {
      await fs.mkdir(tempPluginsDir, { recursive: true });
      
      const pluginAContent = `
        export default {
          name: 'dyn-a',
          init: (ctx) => { ctx.loaded.push('a'); }
        };
      `;
      const pluginBContent = `
        export default {
          name: 'dyn-b',
          dependencies: ['dyn-a'],
          init: (ctx) => { ctx.loaded.push('b'); }
        };
      `;

      await fs.writeFile(path.join(tempPluginsDir, 'a.js'), pluginAContent);
      await fs.writeFile(path.join(tempPluginsDir, 'b.js'), pluginBContent);

      const pm = new PluginManager({ loaded: [] });
      await pm.loadPluginsFromDir(tempPluginsDir);
      await pm.triggerHook('init');

      expect(pm.context.loaded).toEqual(['a', 'b']);
    } finally {
      try {
        await fs.rm(tempPluginsDir, { recursive: true, force: true });
      } catch (err) {}
    }
  });
});
