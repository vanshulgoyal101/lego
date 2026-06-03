import { describe, it, expect } from '../../../test/test-harness.js';
import { CliBuilder } from './index.js';

await describe('sys/cli-builder', async () => {
  await it('should parse global options correctly', () => {
    const cli = new CliBuilder({ name: 'myapp' });
    cli.flag('verbose', { alias: 'v', type: 'boolean' });
    cli.flag('port', { alias: 'p', type: 'number', default: 80 });

    const result = cli.parse(['-v', '--port', '3000']);
    expect(result.command).toBe(null);
    expect(result.options.verbose).toBe(true);
    expect(result.options.port).toBe(3000);
  });

  await it('should execute subcommands and map command-specific options', () => {
    const cli = new CliBuilder({ name: 'testapp' });
    let actionCalled = false;
    let actionArgs = null;
    let actionOpts = null;

    cli.command('run', {
      description: 'Run project',
      flags: {
        env: { alias: 'e', type: 'string', default: 'dev' }
      },
      action: (args, opts) => {
        actionCalled = true;
        actionArgs = args;
        actionOpts = opts;
      }
    });

    const result = cli.parse(['run', 'index.js', '-e', 'prod']);

    expect(result.command).toBe('run');
    expect(result.args[0]).toBe('index.js');
    expect(actionCalled).toBe(true);
    expect(actionArgs[0]).toBe('index.js');
    expect(actionOpts.env).toBe('prod');
  });

  await it('should automatically generate help and version outputs', () => {
    const cli = new CliBuilder({
      name: 'helpapp',
      description: 'A helpful app',
      version: '2.0.0'
    });

    cli.flag('verbose', { alias: 'v', description: 'Enable logs' });
    cli.command('test', { description: 'Run tests' });

    // Capture logs or verify result object
    const helpResult = cli.parse(['--help']);
    expect(helpResult.helpShown).toBe(true);
    expect(helpResult.output.includes('Usage: helpapp')).toBe(true);
    expect(helpResult.output.includes('verbose')).toBe(true);

    const versionResult = cli.parse(['--version']);
    expect(versionResult.versionShown).toBe(true);
    expect(versionResult.output).toBe('helpapp version 2.0.0');

    // Test alias version trigger when alias v is NOT registered as a flag
    const cliNoAlias = new CliBuilder({ name: 'app2', version: '3.0.0' });
    const versionAliasResult = cliNoAlias.parse(['-v']);
    expect(versionAliasResult.versionShown).toBe(true);
    expect(versionAliasResult.output).toBe('app2 version 3.0.0');
  });
});
