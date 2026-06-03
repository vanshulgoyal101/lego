import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const BLOCKS_DIR = path.join(ROOT_DIR, 'blocks');
const OUTPUT_FILE = path.join(ROOT_DIR, 'registry.json');

async function findMetadataFiles(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });

  for (const file of list) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await findMetadataFiles(res));
    } else if (file.name === 'metadata.json') {
      results.push(res);
    }
  }
  return results;
}

async function buildRegistry() {
  try {
    console.log('Building Lego Registry...');
    const metadataPaths = await findMetadataFiles(BLOCKS_DIR);
    const registry = {
      blocks: {}
    };

    for (const metaPath of metadataPaths) {
      const dirPath = path.dirname(metaPath);
      const content = await fs.readFile(metaPath, 'utf8');
      const metadata = JSON.parse(content);

      // Category and Block Name
      const relativeDir = path.relative(BLOCKS_DIR, dirPath);
      const parts = relativeDir.split(path.sep); // e.g. ['web', 'fetch-retry']
      
      if (parts.length < 2) {
        console.warn(`Skipping invalid block structure: ${relativeDir}`);
        continue;
      }

      const category = parts[0];
      const name = parts.slice(1).join('/'); // fetch-retry
      const blockKey = `${category}/${name}`;

      // List all files in the block folder relative to the root or block folder itself
      const files = await fs.readdir(dirPath);
      const codeFiles = files.filter(f => f.endsWith('.js') && f !== 'test.js' && f !== 'index.test.js');

      registry.blocks[blockKey] = {
        ...metadata,
        path: `blocks/${relativeDir}`,
        files: codeFiles
      };
    }

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(registry, null, 2), 'utf8');
    console.log(`Registry built successfully! Output written to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error building registry:', error);
    process.exit(1);
  }
}

buildRegistry();
