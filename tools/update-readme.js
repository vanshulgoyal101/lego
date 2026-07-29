import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const REGISTRY_FILE = path.join(ROOT_DIR, 'registry.json');
const README_FILE = path.join(ROOT_DIR, 'README.md');

const CATEGORY_NAMES = {
  agent: 'Agent',
  app: 'Application Helpers',
  algo: 'Algorithms',
  async: 'Asynchronous & Concurrency',
  compiler: 'Compiler & Parsing Primitives',
  crypto: 'Cryptography & Security',
  db: 'Database Engine Internals',
  ds: 'Data Structures',
  encoding: 'Compression & Encodings',
  math: 'Mathematics & Calculations',
  media: 'Media',
  ml: 'Machine Learning Primitives',
  observability: 'Observability',
  protocol: 'Network Protocols',
  security: 'Security',
  state: 'State Management',
  stream: 'Stream Processing',
  sys: 'System Utilities',
  text: 'Text Processing & Formatter',
  ui: 'UI & Layout Mechanics',
  utils: 'Utility Helper Functions',
  validation: 'Validation & Security Guards',
  web: 'Web & Networking Middleware'
};

function findSectionBounds(content, startHeading, endHeading) {
  const startPattern = new RegExp(`^##\\s+${startHeading}\\s*$`, 'm');
  const endPattern = new RegExp(`^##\\s+${endHeading}\\s*$`, 'm');
  const startMatch = content.match(startPattern);
  const endMatch = content.match(endPattern);

  if (!startMatch || !endMatch || startMatch.index === undefined || endMatch.index === undefined) {
    throw new Error(`Could not find required README headings: "## ${startHeading}" and "## ${endHeading}".`);
  }

  if (startMatch.index >= endMatch.index) {
    throw new Error(`README heading order is invalid: "## ${startHeading}" must appear before "## ${endHeading}".`);
  }

  const startLineEnd = content.indexOf('\n', startMatch.index);
  if (startLineEnd === -1) {
    throw new Error(`Invalid README format near heading: "## ${startHeading}".`);
  }

  return {
    sectionStart: startLineEnd + 1,
    sectionEnd: endMatch.index
  };
}

async function updateReadme() {
  try {
    console.log('Updating README.md Block Catalog...');
    
    // 1. Read registry
    const registryData = await fs.readFile(REGISTRY_FILE, 'utf8');
    const registry = JSON.parse(registryData);
    
    const blocks = registry.blocks || {};
    const categories = {};

    // Group blocks by category
    for (const [key, block] of Object.entries(blocks)) {
      const cat = block.category || 'other';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push({ key, ...block });
    }

    // Generate Catalog markdown
    let catalogMd = '';
    const sortedCategories = Object.keys(categories).sort();
    
    catalogMd += `We have developed **${Object.keys(blocks).length} production-grade blocks** organized across ${sortedCategories.length} categories:\n\n`;

    let catIndex = 1;
    for (const cat of sortedCategories) {
      const displayName = CATEGORY_NAMES[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
      catalogMd += `### ${catIndex}. ${displayName}\n`;
      
      // Sort blocks alphabetically by key
      const catBlocks = categories[cat].sort((a, b) => a.key.localeCompare(b.key));
      for (const block of catBlocks) {
        catalogMd += `* [\`${block.key}\`](blocks/${block.key}): ${block.description}\n`;
      }
      catalogMd += '\n';
      catIndex++;
    }

    // 2. Read existing README.md
    const readmeContent = await fs.readFile(README_FILE, 'utf8');

    const { sectionStart, sectionEnd } = findSectionBounds(
      readmeContent,
      'Categorized Block Catalog',
      'Automated Verification Suite'
    );

    // Build new README content
    const newReadmeContent =
      `${readmeContent.substring(0, sectionStart)}\n${catalogMd.trim()}\n\n---\n\n${readmeContent.substring(sectionEnd)}`;

    await fs.writeFile(README_FILE, newReadmeContent, 'utf8');
    console.log('README.md updated successfully with the latest block catalog!');
  } catch (error) {
    console.error('Error updating README:', error);
    process.exit(1);
  }
}

updateReadme();
