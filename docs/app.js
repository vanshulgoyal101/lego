document.addEventListener('DOMContentLoaded', () => {
  // Check that the data loaded
  if (!window.LEGO_REGISTRY || !window.LEGO_REGISTRY.blocks) {
    console.error('LEGO_REGISTRY not loaded!');
    return;
  }

  const database = window.LEGO_REGISTRY.blocks;
  const blockKeys = Object.keys(database).sort();
  
  // DOM Elements
  const welcomeScreen = document.getElementById('welcome-screen');
  const blockDetailScreen = document.getElementById('block-detail');
  const searchInput = document.getElementById('search-input');
  const categoryListContainer = document.getElementById('category-list');
  const blocksListContainer = document.getElementById('blocks-list');
  const blocksCountBadge = document.getElementById('blocks-count');
  
  const blockTitle = document.getElementById('block-title');
  const blockCategoryBadge = document.getElementById('block-category');
  const blockDescription = document.getElementById('block-description');
  const compatibilityBadges = document.getElementById('compatibility-badges');
  const statTime = document.getElementById('stat-time');
  const statSpace = document.getElementById('stat-space');
  const cliCommandText = document.getElementById('cli-command-text');
  
  const paramsTable = document.getElementById('params-table');
  const paramsTableBody = document.getElementById('params-table-body');
  const codeDisplay = document.getElementById('code-display');
  const aiPromptText = document.getElementById('ai-prompt-text');
  
  // Controls
  const themeToggle = document.getElementById('theme-toggle');
  const btnCopyCommand = document.getElementById('btn-copy-command');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnCopyAiPrompt = document.getElementById('btn-copy-ai-prompt');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const toast = document.getElementById('toast');

  let currentCategory = 'all';
  let searchQuery = '';
  let activeBlockKey = null;

  // Extract Categories
  const categories = new Set(['all']);
  blockKeys.forEach(key => {
    if (database[key].category) {
      categories.add(database[key].category);
    }
  });

  // Render Category Chips
  function renderCategories() {
    categoryListContainer.innerHTML = '';
    Array.from(categories).sort().forEach(cat => {
      const chip = document.createElement('button');
      chip.className = `category-chip ${currentCategory === cat ? 'active' : ''}`;
      chip.textContent = cat;
      chip.addEventListener('click', () => {
        currentCategory = cat;
        renderCategories();
        renderBlocksList();
      });
      categoryListContainer.appendChild(chip);
    });
  }

  // Render Blocks List (Filtered by Search and Category)
  function renderBlocksList() {
    blocksListContainer.innerHTML = '';
    let count = 0;

    blockKeys.forEach(key => {
      const block = database[key];
      const matchesCategory = currentCategory === 'all' || block.category === currentCategory;
      const matchesSearch = block.name.toLowerCase().includes(searchQuery) ||
                            block.description.toLowerCase().includes(searchQuery) ||
                            block.category.toLowerCase().includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        count++;
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = `block-item ${activeBlockKey === key ? 'active' : ''}`;
        
        btn.innerHTML = `
          <span class="block-item-name">${key}</span>
          <span class="block-item-desc">${block.description}</span>
          <span class="block-item-cat">${block.category}</span>
        `;
        
        btn.addEventListener('click', () => {
          selectBlock(key);
        });
        
        li.appendChild(btn);
        blocksListContainer.appendChild(li);
      }
    });

    blocksCountBadge.textContent = count;
  }

  // Map Category to Complexity (Fallback matches generate-readmes logic)
  function getComplexity(name) {
    const complexities = {
      'debounce': { time: 'O(1)', space: 'O(1)' },
      'fetch-retry': { time: 'O(1) per request', space: 'O(1)' },
      'fsm': { time: 'O(1) state transitions', space: 'O(V + E) memory states' },
      'priority-queue': { time: 'O(log N) enqueue/dequeue', space: 'O(N) items capacity' },
      'trie': { time: 'O(L) insert/lookup (L=len)', space: 'O(N * L) prefix nodes' },
      'api-client': { time: 'O(1) request routing', space: 'O(1)' },
      'websocket-client': { time: 'O(1) transmissions', space: 'O(M) outbox buffers' },
      'vector2d': { time: 'O(1) arithmetic', space: 'O(1)' },
      'matrix': { time: 'O(R * C) operations', space: 'O(R * C)' },
      'semaphore': { time: 'O(1)', space: 'O(Q) lock task queues' },
      'event-emitter': { time: 'O(L) triggers', space: 'O(E * L) listeners mapped' },
      'lru-cache': { time: 'O(1) fast maps access', space: 'O(C) max capacity limit' },
      'bloom-filter': { time: 'O(K) hash runs (K=functions)', space: 'O(M) memory bit width' },
      'markdown-parser': { time: 'O(L * R) matching rules', space: 'O(L) output buffer' },
      'csv-parser': { time: 'O(L) characters loop', space: 'O(L)' },
      'color-converter': { time: 'O(1)', space: 'O(1)' },
      'query-builder': { time: 'O(C) parameters parsing', space: 'O(C)' },
      'router': { time: 'O(R * P) patterns matching', space: 'O(R) routes array' },
      'cookie-helper': { time: 'O(1)', space: 'O(1)' },
      'schema-validator': { time: 'O(P) validate schemas', space: 'O(P)' },
      'promise-pool': { time: 'O(N) task queues mapping', space: 'O(C) concurrent execution' },
      'sse-client': { time: 'O(1) streams listener', space: 'O(1)' },
      'ip-validator': { time: 'O(1) checks', space: 'O(1)' },
      'msgpack': { time: 'O(N) encoding loop', space: 'O(N) buffers output' }
    };
    return complexities[name] || { time: 'O(1)', space: 'O(1)' };
  }

  // Handle Block Selection
  function selectBlock(key) {
    activeBlockKey = key;
    const block = database[key];

    // Highlight selected item in list
    const items = blocksListContainer.querySelectorAll('.block-item');
    items.forEach(el => {
      const elKey = el.querySelector('.block-item-name').textContent;
      if (elKey === key) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Populate Details
    blockTitle.textContent = key;
    blockCategoryBadge.textContent = block.category;
    blockDescription.textContent = block.description;
    
    // Complexities
    const comp = getComplexity(block.name);
    statTime.textContent = comp.time;
    statSpace.textContent = comp.space;

    // CLI text
    cliCommandText.textContent = `node bin/cli.js add ${key}`;

    // Compatibility Badges (Universal default)
    compatibilityBadges.innerHTML = `
      <span class="badge" style="background-color: var(--success-bg); color: var(--success-color);">Browser ✅</span>
      <span class="badge" style="background-color: var(--success-bg); color: var(--success-color);">Node ✅</span>
      <span class="badge" style="background-color: var(--success-bg); color: var(--success-color);">Deno ✅</span>
      <span class="badge" style="background-color: var(--success-bg); color: var(--success-color);">Bun ✅</span>
    `;

    // Parameters Table
    paramsTableBody.innerHTML = '';
    if (block.parameters && block.parameters.length > 0) {
      paramsTable.style.display = 'table';
      block.parameters.forEach(p => {
        const row = document.createElement('tr');
        const reqStr = p.required ? '⚠️ Yes' : 'No';
        const defStr = p.default !== undefined ? `<code>${p.default}</code>` : '-';
        
        row.innerHTML = `
          <td><code>${p.name}</code></td>
          <td><code>${p.type}</code></td>
          <td>${reqStr}</td>
          <td>${defStr}</td>
          <td>${p.description}</td>
        `;
        paramsTableBody.appendChild(row);
      });
    } else {
      paramsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No Parameters required.</td></tr>`;
    }

    // Code Display (Escaped)
    codeDisplay.textContent = block.code || '// Source code not found';

    // AI Instructions
    aiPromptText.textContent = block.aiPromptContext || `Use this block as a modular dependency. Key parameters: ${JSON.stringify(block.parameters || [])}`;

    // Show View
    welcomeScreen.style.display = 'none';
    blockDetailScreen.style.display = 'flex';
  }

  // Copy Helpers
  function triggerToast(message = 'Copied to clipboard!') {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
      triggerToast(message);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  // Theme Toggler
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', targetTheme);
  });

  // Search Logic
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderBlocksList();
  });

  // Tab Navigation Logic
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Copy Actions listeners
  btnCopyCommand.addEventListener('click', () => {
    if (activeBlockKey) {
      const cmdText = cliCommandText.textContent;
      copyToClipboard(cmdText, 'CLI Command copied!');
    }
  });

  btnCopyCode.addEventListener('click', () => {
    if (activeBlockKey) {
      copyToClipboard(database[activeBlockKey].code, 'Source code copied!');
    }
  });

  btnCopyAiPrompt.addEventListener('click', () => {
    if (activeBlockKey) {
      copyToClipboard(aiPromptText.textContent, 'AI Prompt instructions copied!');
    }
  });

  // Initial render
  renderCategories();
  renderBlocksList();
});
