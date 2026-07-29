import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { findMetadataFiles, readBlockMetadata, listBlockRuntimeFiles } from './lib/blocks-index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const BLOCKS_DIR = path.join(ROOT_DIR, 'blocks');
const OUTPUT_FILE = path.join(ROOT_DIR, 'registry.json');

async function buildRegistry() {
  try {
    console.log('Building Lego Registry...');
    const metadataPaths = await findMetadataFiles(BLOCKS_DIR);
    const registry = {
      blocks: {}
    };

    for (const metaPath of metadataPaths) {
      const block = await readBlockMetadata(metaPath, BLOCKS_DIR);
      if (!block) {
        console.warn(`Skipping invalid block structure for metadata file: ${metaPath}`);
        continue;
      }

      const codeFiles = await listBlockRuntimeFiles(block.dirPath);

      registry.blocks[block.blockKey] = {
        ...block.metadata,
        category: block.category,
        path: `blocks/${block.relativeDir}`,
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
