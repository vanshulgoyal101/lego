export class CliBuilder {
  constructor(options = {}) {
    this.name = options.name || 'cli';
    this.description = options.description || '';
    this.version = options.version || '1.0.0';
    this.globalFlags = {};
    this.commands = {};
  }

  flag(name, config = {}) {
    this.globalFlags[name] = {
      alias: config.alias || '',
      description: config.description || '',
      type: config.type || 'boolean',
      default: config.default
    };
    return this;
  }

  command(name, config = {}) {
    this.commands[name] = {
      description: config.description || '',
      flags: config.flags || {},
      action: config.action || (() => {})
    };
    return this;
  }

  parse(args = []) {
    // Check for help/version flags first
    const hasHelpFlag = Object.values(this.globalFlags).some(f => f.alias === 'h');
    const hasVersionFlag = Object.values(this.globalFlags).some(f => f.alias === 'v');

    const showHelp = args.includes('--help') || (args.includes('-h') && !hasHelpFlag);
    const showVersion = args.includes('--version') || (args.includes('-v') && !hasVersionFlag);

    if (showHelp) {
      const output = this.generateHelp();
      console.log(output);
      return { helpShown: true, output };
    }

    if (showVersion) {
      const output = `${this.name} version ${this.version}`;
      console.log(output);
      return { versionShown: true, output };
    }

    // Determine command vs global parse
    let commandName = null;
    let commandArgs = args;

    // Check if the first argument matches a command
    if (args.length > 0 && !args[0].startsWith('-') && this.commands[args[0]]) {
      commandName = args[0];
      commandArgs = args.slice(1);
    }

    const commandConfig = commandName ? this.commands[commandName] : null;
    const definedFlags = {
      ...this.globalFlags,
      ...(commandConfig ? commandConfig.flags : {})
    };

    const parsedOptions = {};
    const positionalArgs = [];

    // Initialize defaults
    for (const [key, details] of Object.entries(definedFlags)) {
      if (details.default !== undefined) {
        parsedOptions[key] = details.default;
      } else if (details.type === 'boolean') {
        parsedOptions[key] = false;
      } else {
        parsedOptions[key] = null;
      }
    }

    // Parse options & positionals
    for (let i = 0; i < commandArgs.length; i++) {
      const arg = commandArgs[i];

      if (arg.startsWith('-')) {
        let flagKey = arg;
        let value = null;

        if (arg.includes('=')) {
          const parts = arg.split('=');
          flagKey = parts[0];
          value = parts.slice(1).join('=');
        }

        // Find defined flag configuration (by full flag name or alias)
        let foundFlagName = null;
        let foundFlagConfig = null;

        const cleanFlag = flagKey.replace(/^-+/, '');
        for (const [name, config] of Object.entries(definedFlags)) {
          if (cleanFlag === name || cleanFlag === config.alias) {
            foundFlagName = name;
            foundFlagConfig = config;
            break;
          }
        }

        if (foundFlagConfig) {
          if (foundFlagConfig.type === 'boolean') {
            if (value !== null) {
              parsedOptions[foundFlagName] = value === 'true';
            } else {
              parsedOptions[foundFlagName] = true;
            }
          } else {
            if (value === null) {
              if (i + 1 < commandArgs.length && !commandArgs[i + 1].startsWith('-')) {
                value = commandArgs[i + 1];
                i++;
              }
            }
            if (foundFlagConfig.type === 'number') {
              parsedOptions[foundFlagName] = Number(value);
            } else {
              parsedOptions[foundFlagName] = value;
            }
          }
        } else {
          // Store raw unmapped flag
          const rawKey = cleanFlag;
          parsedOptions[rawKey] = value !== null ? value : true;
        }
      } else {
        positionalArgs.push(arg);
      }
    }

    const results = {
      command: commandName,
      args: positionalArgs,
      options: parsedOptions
    };

    if (commandConfig && commandConfig.action) {
      commandConfig.action(positionalArgs, parsedOptions);
    }

    return results;
  }

  generateHelp() {
    let output = '';
    output += `Usage: ${this.name} [command] [options]\n\n`;
    if (this.description) {
      output += `${this.description}\n\n`;
    }

    const globalFlagsList = Object.entries(this.globalFlags);
    if (globalFlagsList.length > 0) {
      output += `Options:\n`;
      for (const [name, config] of globalFlagsList) {
        const aliasPart = config.alias ? `-${config.alias}, ` : '    ';
        output += `  ${aliasPart}--${name.padEnd(16)} ${config.description}\n`;
      }
      output += `  -h, --help             Show help documentation\n`;
      output += `  -v, --version          Show version\n\n`;
    }

    const commandList = Object.entries(this.commands);
    if (commandList.length > 0) {
      output += `Commands:\n`;
      for (const [name, config] of commandList) {
        output += `  ${name.padEnd(23)} ${config.description}\n`;
        const cmdFlags = Object.entries(config.flags);
        if (cmdFlags.length > 0) {
          for (const [fName, fConfig] of cmdFlags) {
            const aliasPart = fConfig.alias ? `-${fConfig.alias}, ` : '    ';
            output += `    ${aliasPart}--${fName.padEnd(14)} ${fConfig.description}\n`;
          }
        }
      }
    }

    return output;
  }
}
