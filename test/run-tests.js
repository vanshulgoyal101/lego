import fs from 'fs/promises';
import path from 'path';
import { stats, Colors } from './test-harness.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BLOCKS_DIR = path.join(__dirname, '../blocks');

async function findTestFiles(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });

  for (const file of list) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await findTestFiles(res));
    } else if (file.name === 'test.js' || file.name === 'index.test.js') {
      results.push(res);
    }
  }
  return results;
}

async function runAllTests() {
  console.log(`\n${Colors.bright}${Colors.yellow}========================================`);
  console.log(`       RUNNING LEGO LIBRARY TESTS       `);
  console.log(`========================================${Colors.reset}`);

  try {
    const testFiles = await findTestFiles(BLOCKS_DIR);
    testFiles.sort();

    for (const testFile of testFiles) {
      await import(testFile);
    }

    console.log(`\n${Colors.bright}${Colors.yellow}========================================`);
    console.log(`             TESTING COMPLETE            `);
    console.log(`========================================${Colors.reset}`);
    console.log(`  Total Suites: ${stats.suites}`);
    console.log(`  Passed Tests: ${Colors.green}${stats.passed}${Colors.reset}`);
    console.log(`  Failed Tests: ${stats.failed > 0 ? Colors.red : Colors.green}${stats.failed}${Colors.reset}`);
    console.log(`========================================\n`);

    if (stats.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Testing harness crashed:', err);
    process.exit(1);
  }
}

runAllTests();
