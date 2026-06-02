import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const BLOCKS_DIR = path.join(ROOT_DIR, 'blocks');

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

// Generate runtime compatibility matrix based on category
function getCompatibility(category) {
  if (category === 'web' || category === 'ui') {
    return {
      browser: '✅ Supported',
      node: '✅ Supported',
      deno: '✅ Supported',
      bun: '✅ Supported'
    };
  }
  return {
    browser: '✅ Supported',
    node: '✅ Supported',
    deno: '✅ Supported',
    bun: '✅ Supported'
  };
}

// Map categories to complexity estimations for documentation
function getComplexity(name) {
  switch (name) {
    case 'debounce':
      return { time: 'O(1)', space: 'O(1)' };
    case 'fetch-retry':
      return { time: 'O(1) per request', space: 'O(1)' };
    case 'fsm':
      return { time: 'O(1) transition lookup', space: 'O(V + E) for states storage' };
    case 'json-db':
      return { time: 'O(N) for read/write file transactions', space: 'O(N) table data in memory' };
    case 'jwt-helper':
      return { time: 'O(1) hashing speed', space: 'O(1)' };
    case 'hash':
      return { time: 'O(1) digest execution', space: 'O(1)' };
    case 'priority-queue':
      return { time: 'O(log N) enqueue/dequeue', space: 'O(N) size' };
    case 'trie':
      return { time: 'O(L) insert/search (L = string length)', space: 'O(N * L) space' };
    case 'api-client':
      return { time: 'O(1) routing intercept', space: 'O(1)' };
    case 'websocket-client':
      return { time: 'O(1) message send', space: 'O(M) buffered offline outbox queue' };
    case 'vector2d':
      return { time: 'O(1) vector arithmetic', space: 'O(1)' };
    case 'matrix':
      return { time: 'O(R * C) operations speed', space: 'O(R * C)' };
    case 'semaphore':
      return { time: 'O(1)', space: 'O(Q) where Q is queued lock tasks size' };
    case 'event-emitter':
      return { time: 'O(L) listeners iterate', space: 'O(E * L) registered event mappings' };
    case 'lru-cache':
      return { time: 'O(1) get/set Map access', space: 'O(C) max capacity storage limit' };
    case 'bloom-filter':
      return { time: 'O(K) hash runs (K = hash functions)', space: 'O(M) bits memory width allocation' };
    case 'markdown-parser':
      return { time: 'O(L * R) regex checks (L = string, R = rules)', space: 'O(L)' };
    case 'csv-parser':
      return { time: 'O(L) linear parser lookup (L = string)', space: 'O(L)' };
    case 'color-converter':
      return { time: 'O(1) conversion arithmetic', space: 'O(1)' };
    case 'query-builder':
      return { time: 'O(C) columns building (C = condition criteria count)', space: 'O(C)' };
    case 'router':
      return { time: 'O(R * P) route patterns iterate (R = routes, P = path parts)', space: 'O(R)' };
    case 'cookie-helper':
      return { time: 'O(1)', space: 'O(1)' };
    case 'schema-validator':
      return { time: 'O(P) properties validate (P = schema fields)', space: 'O(P)' };
    default:
      return { time: 'O(1)', space: 'O(1)' };
  }
}

async function generateReadmes() {
  try {
    console.log('Generating Lego Block README files...');
    const metadataPaths = await findMetadataFiles(BLOCKS_DIR);

    for (const metaPath of metadataPaths) {
      const dirPath = path.dirname(metaPath);
      const relativeDir = path.relative(BLOCKS_DIR, dirPath);
      const parts = relativeDir.split(path.sep);
      
      const category = parts[0];
      const name = parts.slice(1).join('/');
      const blockKey = `${category}/${name}`;

      const content = await fs.readFile(metaPath, 'utf8');
      const metadata = JSON.parse(content);

      const comp = getCompatibility(category);
      const compl = getComplexity(metadata.name);

      let paramsMarkdown = '*None*';
      if (metadata.parameters && metadata.parameters.length > 0) {
        paramsMarkdown = `| Parameter | Type | Required | Default | Description |\n|---|---|---|---|---|\n`;
        metadata.parameters.forEach(p => {
          const req = p.required ? '⚠️ Yes' : 'No';
          const def = p.default !== undefined ? `\`${p.default}\`` : '*-*';
          paramsMarkdown += `| \`${p.name}\` | \`${p.type}\` | ${req} | ${def} | ${p.description} |\n`;
        });
      }

      const readmeContent = `# Lego Block: \`${blockKey}\`

${metadata.description}

> [!NOTE]
> **AI Agent Context:** ${metadata.aiPromptContext || 'Use this block as a modular dependency.'}

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
\`\`\`bash
npx lego-cli add ${blockKey}
\`\`\`

---

## API Specifications

### Parameters

${paramsMarkdown}

---

## System Compatibility

| Runtime Environment | Status |
|---|---|
| **Browsers (Chrome, Safari, Firefox, Edge)** | ${comp.browser} |
| **Node.js** | ${comp.node} |
| **Deno** | ${comp.deno} |
| **Bun** | ${comp.bun} |

---

## Computational Complexity

* **Time Complexity:** \`${compl.time}\`
* **Space Complexity:** \`${compl.space}\`

---

## Production Usage Example

Refer to \`index.js\` inside this folder for full API details.
`;

      const readmePath = path.join(dirPath, 'README.md');
      await fs.writeFile(readmePath, readmeContent, 'utf8');
      console.log(`  + Created: ${path.relative(ROOT_DIR, readmePath)}`);
    }

    console.log('All README files generated successfully!');
  } catch (error) {
    console.error('Error generating README files:', error);
    process.exit(1);
  }
}

generateReadmes();
