import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { findMetadataFiles, readBlockMetadata } from './lib/blocks-index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const BLOCKS_DIR = path.join(ROOT_DIR, 'blocks');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'docs-data.js');

function extractComplexity(readme) {
  const timeMatch = readme.match(/\*\s+\*\*Time Complexity:\*\*\s+`([^`]+)`/);
  const spaceMatch = readme.match(/\*\s+\*\*Space Complexity:\*\*\s+`([^`]+)`/);
  return {
    time: timeMatch ? timeMatch[1] : 'Unknown',
    space: spaceMatch ? spaceMatch[1] : 'Unknown'
  };
}

function extractCompatibility(readme) {
  const environments = ['Browsers', 'Node.js', 'Deno', 'Bun'];
  const compatibility = {};
  for (const environment of environments) {
    const pattern = new RegExp(`\\|\\s*\\*\\*${environment.replace('.', '\\\\.')}[^|]*\\*\\*\\s*\\|\\s*([^|]+)\\|`);
    const match = readme.match(pattern);
    compatibility[environment] = match ? match[1].trim() : 'Unknown';
  }
  return compatibility;
}

function resolveComplexity(metadata, readme) {
  if (metadata.complexity && metadata.complexity.time && metadata.complexity.space) {
    return metadata.complexity;
  }
  return extractComplexity(readme);
}

function resolveCompatibility(metadata, readme) {
  if (metadata.compatibility && metadata.compatibility.browser && metadata.compatibility.node &&
      metadata.compatibility.deno && metadata.compatibility.bun) {
    return {
      Browsers: metadata.compatibility.browser,
      'Node.js': metadata.compatibility.node,
      Deno: metadata.compatibility.deno,
      Bun: metadata.compatibility.bun
    };
  }
  return extractCompatibility(readme);
}

async function buildDocsData() {
  try {
    console.log('Compiling Docs Data Payload...');
    
    // Ensure docs directory exists
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

    const metadataPaths = await findMetadataFiles(BLOCKS_DIR);
    const blocks = {};

    for (const metaPath of metadataPaths) {
      const block = await readBlockMetadata(metaPath, BLOCKS_DIR);
      if (!block) {
        console.warn(`Skipping invalid block structure for metadata file: ${metaPath}`);
        continue;
      }

      // Read index.js
      let code = '';
      try {
        code = await fs.readFile(path.join(block.dirPath, 'index.js'), 'utf8');
      } catch (err) {
        console.warn(`Warning: Could not read index.js for ${block.blockKey}`);
      }

      // Read README.md
      let readme = '';
      try {
        readme = await fs.readFile(path.join(block.dirPath, 'README.md'), 'utf8');
      } catch (err) {
        console.warn(`Warning: Could not read README.md for ${block.blockKey}`);
      }

      blocks[block.blockKey] = {
        name: block.metadata.name,
        category: block.category,
        description: block.metadata.description,
        dependencies: block.metadata.dependencies || [],
        aiPromptContext: block.metadata.aiPromptContext || '',
        parameters: block.metadata.parameters || [],
        tags: block.metadata.tags || [],
        useCases: block.metadata.useCases || [],
        complexity: resolveComplexity(block.metadata, readme),
        compatibility: resolveCompatibility(block.metadata, readme),
        code,
        readme,
        path: `blocks/${block.relativeDir}`
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
