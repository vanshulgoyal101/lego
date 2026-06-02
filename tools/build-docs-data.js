import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const BLOCKS_DIR = path.join(ROOT_DIR, 'blocks');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'docs-data.js');

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

async function buildDocsData() {
  try {
    console.log('Compiling Docs Data Payload...');
    
    // Ensure docs directory exists
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

    const metadataPaths = await findMetadataFiles(BLOCKS_DIR);
    const blocks = {};

    for (const metaPath of metadataPaths) {
      const dirPath = path.dirname(metaPath);
      const content = await fs.readFile(metaPath, 'utf8');
      const metadata = JSON.parse(content);

      // Category and Block Name
      const relativeDir = path.relative(BLOCKS_DIR, dirPath);
      const parts = relativeDir.split(path.sep);
      
      if (parts.length < 2) continue;

      const category = parts[0];
      const name = parts.slice(1).join('/');
      const blockKey = `${category}/${name}`;

      // Read index.js
      let code = '';
      try {
        code = await fs.readFile(path.join(dirPath, 'index.js'), 'utf8');
      } catch (err) {
        console.warn(`Warning: Could not read index.js for ${blockKey}`);
      }

      // Read README.md
      let readme = '';
      try {
        readme = await fs.readFile(path.join(dirPath, 'README.md'), 'utf8');
      } catch (err) {
        console.warn(`Warning: Could not read README.md for ${blockKey}`);
      }

      blocks[blockKey] = {
        name: metadata.name,
        category,
        description: metadata.description,
        dependencies: metadata.dependencies || [],
        aiPromptContext: metadata.aiPromptContext || '',
        parameters: metadata.parameters || [],
        code,
        readme,
        path: `blocks/${relativeDir}`
      };
    }

    const payload = `// Auto-generated docs data database payload.
window.LEGO_REGISTRY = ${JSON.stringify({ blocks }, null, 2)};
`;

    await fs.writeFile(OUTPUT_FILE, payload, 'utf8');
    console.log(`Docs data successfully compiled to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error building docs data:', error);
    process.exit(1);
  }
}

buildDocsData();
