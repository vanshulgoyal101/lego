import fs from 'fs';

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return deepMerge(target, ...sources);
}

export function parseValue(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null') return null;
  if (val === 'undefined') return undefined;
  if (!isNaN(val) && val.trim() !== '') {
    return Number(val);
  }
  return val;
}

export function setPath(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || !isObject(current[part])) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

export class ConfigLoader {
  constructor(defaults = {}) {
    this.config = JSON.parse(JSON.stringify(defaults));
  }

  /**
   * Loads configuration from a JSON file.
   */
  addJsonFile(filePath, required = false) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        this.config = deepMerge(this.config, parsed);
      } else if (required) {
        throw new Error(`Config file not found: ${filePath}`);
      }
    } catch (err) {
      if (required) throw err;
    }
    return this;
  }

  /**
   * Loads configurations from environment variables.
   * Maps matching prefixed variables, converting `PREFIX_DB__HOST` to `db.host`.
   */
  addEnv(prefix = '', mapping = null) {
    const envObj = {};
    const envKeys = Object.keys(process.env);

    for (const key of envKeys) {
      if (prefix && !key.startsWith(prefix)) continue;

      const rawValue = process.env[key];
      const parsedVal = parseValue(rawValue);

      if (mapping && mapping[key]) {
        setPath(envObj, mapping[key], parsedVal);
      } else {
        // Automatic nested extraction
        // Remove prefix
        const cleanKey = prefix ? key.slice(prefix.length) : key;
        // Split by '__' for nesting, or '_' for normal casing transition
        const parts = cleanKey.split('__').map(part => {
          // Convert camelCase or lowercase
          return part.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        });
        
        setPath(envObj, parts.join('.'), parsedVal);
      }
    }

    this.config = deepMerge(this.config, envObj);
    return this;
  }

  /**
   * Loads configuration from CLI arguments.
   * Custom mapping matches: --flag name (e.g. --port -> db.port)
   */
  addCli(args = process.argv.slice(2), cliMapping = {}) {
    const cliObj = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('-')) {
        let key = arg;
        let value = null;

        if (arg.includes('=')) {
          const parts = arg.split('=');
          key = parts[0];
          value = parts.slice(1).join('=');
        } else {
          // Look at next argument if it doesn't start with '-'
          if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
            value = args[i + 1];
            i++;
          } else {
            value = 'true'; // Flag switch
          }
        }

        const cleanKey = key.replace(/^-+/, '');
        const targetPath = cliMapping[key] || cliMapping[cleanKey] || cleanKey;
        const parsedVal = parseValue(value);

        setPath(cliObj, targetPath, parsedVal);
      }
    }

    this.config = deepMerge(this.config, cliObj);
    return this;
  }

  load() {
    return this.config;
  }
}
