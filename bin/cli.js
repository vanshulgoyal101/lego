#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const REGISTRY_FILE = path.join(ROOT_DIR, 'registry.json');

// ANSI Color Helpers
const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

async function loadRegistry() {
  try {
    const data = await fs.readFile(REGISTRY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`${Colors.red}Error: Could not read registry.json. Please run 'npm run build-registry' first.${Colors.reset}`);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
${Colors.bright}${Colors.cyan}Lego AI Code Library CLI${Colors.reset}
Usage:
  lego-cli <command> [arguments]

Commands:
  ${Colors.green}list${Colors.reset}                       List all available code blocks in the library
  ${Colors.green}view <block-key>${Colors.reset}           View detailed documentation and parameters for a block
  ${Colors.green}add <block-key> [options]${Colors.reset}  Copy a block to your project codebase

Options for 'add':
  ${Colors.yellow}--dest <path>${Colors.reset}          Target folder where the block code should be copied (default: ./lego_components)

Examples:
  node bin/cli.js list
  node bin/cli.js view web/fetch-retry
  node bin/cli.js add web/fetch-retry --dest ./src/utils
`);
}

async function listBlocks() {
  const registry = await loadRegistry();
  console.log(`\n${Colors.bright}${Colors.cyan}Available Lego Blocks:${Colors.reset}\n`);
  
  for (const [key, block] of Object.entries(registry.blocks)) {
    console.log(`  * ${Colors.bright}${Colors.green}${key}${Colors.reset}`);
    console.log(`    ${Colors.gray}${block.description}${Colors.reset}`);
    console.log(`    ${Colors.yellow}Category:${Colors.reset} ${block.category} | ${Colors.yellow}Files:${Colors.reset} ${block.files.join(', ')}\n`);
  }
}

async function viewBlock(blockKey) {
  const registry = await loadRegistry();
  const block = registry.blocks[blockKey];

  if (!block) {
    console.error(`${Colors.red}Error: Block '${blockKey}' not found in registry.${Colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${Colors.bright}${Colors.cyan}Block: ${blockKey}${Colors.reset}`);
  console.log(`${Colors.gray}${block.description}${Colors.reset}\n`);
  
  if (block.aiPromptContext) {
    console.log(`${Colors.bright}${Colors.yellow}AI Usage Prompt Context:${Colors.reset}`);
    console.log(`  ${block.aiPromptContext}\n`);
  }

  if (block.parameters && block.parameters.length > 0) {
    console.log(`${Colors.bright}${Colors.yellow}Parameters:${Colors.reset}`);
    block.parameters.forEach(p => {
      const req = p.required ? `${Colors.red}(required)${Colors.reset}` : `${Colors.gray}(optional)${Colors.reset}`;
      const def = p.default !== undefined ? ` [default: ${p.default}]` : '';
      console.log(`  - ${Colors.green}${p.name}${Colors.reset} ${Colors.cyan}<${p.type}>${Colors.reset} ${req}${def}`);
      console.log(`    ${p.description}`);
    });
    console.log();
  }

  console.log(`${Colors.yellow}Source Directory:${Colors.reset} ${block.path}`);
  console.log(`${Colors.yellow}Files:${Colors.reset} ${block.files.join(', ')}`);
}

async function addBlock(blockKey, destPath) {
  const registry = await loadRegistry();
  const block = registry.blocks[blockKey];

  if (!block) {
    console.error(`${Colors.red}Error: Block '${blockKey}' not found in registry.${Colors.reset}`);
    process.exit(1);
  }

  const srcDir = path.join(ROOT_DIR, block.path);
  const resolvedDest = path.resolve(destPath);

  console.log(`Installing ${Colors.green}${blockKey}${Colors.reset} into ${Colors.cyan}${resolvedDest}${Colors.reset}...`);

  // Ensure destination directory exists
  await fs.mkdir(resolvedDest, { recursive: true });

  for (const fileName of block.files) {
    const srcFile = path.join(srcDir, fileName);
    const destFile = path.join(resolvedDest, fileName);

    const content = await fs.readFile(srcFile, 'utf8');
    await fs.writeFile(destFile, content, 'utf8');
    console.log(`  + Created: ${Colors.green}${path.relative(process.cwd(), destFile)}${Colors.reset}`);
  }

  console.log(`\n${Colors.bright}${Colors.green}Successfully installed ${blockKey}!${Colors.reset}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    printHelp();
    return;
  }

  switch (command) {
    case 'list':
      await listBlocks();
      break;

    case 'view':
      if (!args[1]) {
        console.error(`${Colors.red}Error: Missing block key. Usage: lego-cli view <block-key>${Colors.reset}`);
        process.exit(1);
      }
      await viewBlock(args[1]);
      break;

    case 'add': {
      const blockKey = args[1];
      if (!blockKey) {
        console.error(`${Colors.red}Error: Missing block key. Usage: lego-cli add <block-key> [--dest <path>]${Colors.reset}`);
        process.exit(1);
      }

      // Simple argument parser for --dest
      let dest = './lego_components';
      const destIndex = args.indexOf('--dest');
      if (destIndex !== -1 && args[destIndex + 1]) {
        dest = args[destIndex + 1];
      }

      await addBlock(blockKey, dest);
      break;
    }

    default:
      console.error(`${Colors.red}Unknown command: ${command}${Colors.reset}`);
      printHelp();
      process.exit(1);
  }
}

main();
