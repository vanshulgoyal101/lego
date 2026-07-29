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
  const useCaseFilter = document.getElementById('usecase-filter');
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
  let currentUseCase = 'all';
  let searchQuery = '';
  let activeBlockKey = null;

  // Extract Categories
  const categories = new Set(['all']);
  const useCases = new Set(['all']);
  blockKeys.forEach(key => {
    if (database[key].category) {
      categories.add(database[key].category);
    }
    if (Array.isArray(database[key].useCases)) {
      database[key].useCases.forEach((useCase) => useCases.add(useCase));
    }
  });

  function renderUseCaseOptions() {
    useCaseFilter.innerHTML = '';
    Array.from(useCases).sort().forEach((useCase) => {
      const option = document.createElement('option');
      option.value = useCase;
      option.textContent = useCase === 'all' ? 'All use cases' : useCase;
      useCaseFilter.appendChild(option);
    });
    useCaseFilter.value = currentUseCase;
  }

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
      const blockTags = Array.isArray(block.tags) ? block.tags : [];
      const blockUseCases = Array.isArray(block.useCases) ? block.useCases : [];
      const matchesUseCase = currentUseCase === 'all' || blockUseCases.includes(currentUseCase);
      const matchesSearch = key.toLowerCase().includes(searchQuery) ||
                            block.name.toLowerCase().includes(searchQuery) ||
                            block.description.toLowerCase().includes(searchQuery) ||
                            block.category.toLowerCase().includes(searchQuery) ||
                            blockTags.some((tag) => tag.toLowerCase().includes(searchQuery)) ||
                            blockUseCases.some((useCase) => useCase.toLowerCase().includes(searchQuery));

      if (matchesCategory && matchesUseCase && matchesSearch) {
        count++;
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = `block-item ${activeBlockKey === key ? 'active' : ''}`;
        
        btn.innerHTML = `
          <span class="block-item-name">${key}</span>
          <span class="block-item-desc">${block.description}</span>
          <span class="block-item-cat">${block.category}</span>
          <span class="block-item-cat">${blockUseCases[0] || 'general'}</span>
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

  function getComplexity(block) {
    if (block.complexity && block.complexity.time && block.complexity.space) {
      return block.complexity;
    }
    return { time: 'Unknown', space: 'Unknown' };
  }

  function renderCompatibilityBadges(block) {
    const compatibility = block.compatibility || {};
    const envs = [
      ['Browsers', 'Browser'],
      ['Node.js', 'Node'],
      ['Deno', 'Deno'],
      ['Bun', 'Bun']
    ];

    compatibilityBadges.innerHTML = envs.map(([key, label]) => {
      const status = compatibility[key] || 'Unknown';
      return `<span class="badge" style="background-color: var(--success-bg); color: var(--success-color);">${label} ${status === '✅ Supported' ? '✅' : status}</span>`;
    }).join('');
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
    const comp = getComplexity(block);
    statTime.textContent = comp.time;
    statSpace.textContent = comp.space;

    // CLI text
    cliCommandText.textContent = `node bin/cli.js add ${key}`;

    renderCompatibilityBadges(block);

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

  useCaseFilter.addEventListener('change', (e) => {
    currentUseCase = e.target.value;
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
  renderUseCaseOptions();
  renderBlocksList();
});
