import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

export class PluginManager {
  constructor(context = {}) {
    this.context = context;
    this.plugins = new Map(); // name -> pluginInstance
    this.sortedPlugins = [];
  }

  /**
   * Registers a plugin object directly.
   */
  register(plugin) {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }
    this.plugins.set(plugin.name, plugin);
    return this;
  }

  /**
   * Dynamically imports a plugin from a file path and registers it.
   */
  async loadPlugin(filePath) {
    const absolutePath = path.resolve(filePath);
    const fileUrl = pathToFileURL(absolutePath).href;
    
    const module = await import(fileUrl);
    const plugin = module.default || module;
    
    return this.register(plugin);
  }

  /**
   * Scans a directory and loads all ES module files as plugins.
   */
  async loadPluginsFromDir(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    // Sort entries to make loading deterministic
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
        await this.loadPlugin(path.join(dirPath, entry.name));
      }
    }
    return this;
  }

  /**
   * Sorts registered plugins topologically according to their declared dependencies.
   */
  sort() {
    const pluginsList = Array.from(this.plugins.values());
    const sorted = [];
    const visited = new Map(); // name -> 'visiting' | 'visited'

    const visit = (plugin) => {
      const name = plugin.name;
      if (visited.get(name) === 'visiting') {
        throw new Error(`Circular dependency detected involving plugin "${name}"`);
      }

      if (!visited.has(name)) {
        visited.set(name, 'visiting');

        if (plugin.dependencies && Array.isArray(plugin.dependencies)) {
          for (const depName of plugin.dependencies) {
            const depPlugin = this.plugins.get(depName);
            if (!depPlugin) {
              throw new Error(`Plugin "${name}" requires missing dependency "${depName}"`);
            }
            visit(depPlugin);
          }
        }

        visited.set(name, 'visited');
        sorted.push(plugin);
      }
    };

    for (const plugin of pluginsList) {
      visit(plugin);
    }

    this.sortedPlugins = sorted;
    return this.sortedPlugins;
  }

  /**
   * Runs a specified lifecycle hook on all sorted plugins.
   */
  async triggerHook(hookName, ...args) {
    // If not sorted yet, perform sorting
    if (this.sortedPlugins.length !== this.plugins.size) {
      this.sort();
    }

    // Determine execution order based on hook name (e.g. stop/cleanup runs in reverse)
    const list = hookName === 'stop' || hookName === 'cleanup'
      ? [...this.sortedPlugins].reverse()
      : this.sortedPlugins;

    for (const plugin of list) {
      if (typeof plugin[hookName] === 'function') {
        await plugin[hookName](this.context, ...args);
      }
    }
  }
}
