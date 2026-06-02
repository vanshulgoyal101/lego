/**
 * AST-Based Markdown Compiler in pure JavaScript.
 * Parses block-level syntax (headings, quotes, tables, lists, codeblocks)
 * and inline syntax (bold, italic, links, images, inline code) into an AST,
 * and renders it to sanitized HTML.
 */

// Helper to escape HTML tags to protect against XSS injection
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Simple link/image URL sanitizer
function sanitizeUrl(url) {
  if (!url) return '';
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return '#';
  }
  return url;
}

/**
 * Parses inline markdown tokens (bold, italic, links, images, inline code).
 */
export function parseInline(text) {
  const tokens = [];
  let index = 0;

  while (index < text.length) {
    const remaining = text.slice(index);

    // 1. Image: ![alt](url)
    const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      tokens.push({
        type: 'image',
        alt: imgMatch[1],
        url: imgMatch[2]
      });
      index += imgMatch[0].length;
      continue;
    }

    // 2. Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      tokens.push({
        type: 'link',
        text: linkMatch[1],
        url: linkMatch[2],
        children: parseInline(linkMatch[1])
      });
      index += linkMatch[0].length;
      continue;
    }

    // 3. Bold/Italic mixed: ***text***
    const boldItalicMatch = remaining.match(/^\*\*\*([^*]+)\*\*\*/);
    if (boldItalicMatch) {
      tokens.push({
        type: 'bolditalic',
        children: parseInline(boldItalicMatch[1])
      });
      index += boldItalicMatch[0].length;
      continue;
    }

    // 4. Bold: **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      tokens.push({
        type: 'bold',
        children: parseInline(boldMatch[1])
      });
      index += boldMatch[0].length;
      continue;
    }

    // 5. Italic: *text*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      tokens.push({
        type: 'italic',
        children: parseInline(italicMatch[1])
      });
      index += italicMatch[0].length;
      continue;
    }

    // 6. Inline Code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push({
        type: 'code',
        value: codeMatch[1]
      });
      index += codeMatch[0].length;
      continue;
    }

    // 7. Plain Text (until next special char)
    const nextSpecial = remaining.search(/[!*`\[]/);
    if (nextSpecial === -1) {
      tokens.push({ type: 'text', value: remaining });
      break;
    } else if (nextSpecial === 0) {
      // Handles lone characters like ! or * that didn't form tags
      tokens.push({ type: 'text', value: remaining[0] });
      index++;
    } else {
      tokens.push({ type: 'text', value: remaining.slice(0, nextSpecial) });
      index += nextSpecial;
    }
  }

  return tokens;
}

/**
 * Parses block-level markdown structures.
 */
export function compileMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const ast = [];
  let index = 0;

  while (index < lines.length) {
    let line = lines[index];

    // 1. Blank Line
    if (line.trim() === '') {
      index++;
      continue;
    }

    // 2. Fenced Code Block: ```lang
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index++;
      }
      index++; // Skip closing tag
      ast.push({
        type: 'codeblock',
        lang,
        value: codeLines.join('\n')
      });
      continue;
    }

    // 3. Heading: # Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      ast.push({
        type: 'heading',
        depth,
        children: parseInline(headingMatch[2])
      });
      index++;
      continue;
    }

    // 4. Blockquote: > text
    if (line.trim().startsWith('>')) {
      const quoteLines = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        // Strip the > and optional space
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
        index++;
      }
      ast.push({
        type: 'blockquote',
        children: compileMarkdown(quoteLines.join('\n'))
      });
      continue;
    }

    // 5. Table Rows Check
    if (line.includes('|') && index + 1 < lines.length && lines[index + 1].includes('-|-')) {
      const headerParts = line.split('|').map(x => x.trim()).filter((x, i, arr) => i > 0 && i < arr.length - 1);
      index += 2; // skip header and delimiter separator line
      const rows = [];
      while (index < lines.length && lines[index].includes('|')) {
        const cells = lines[index].split('|').map(x => x.trim()).filter((x, i, arr) => i > 0 && i < arr.length - 1);
        rows.push(cells.map(c => parseInline(c)));
        index++;
      }
      ast.push({
        type: 'table',
        headers: headerParts.map(h => parseInline(h)),
        rows
      });
      continue;
    }

    // 6. Unordered Lists: - item or * item
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const items = [];
      while (index < lines.length && (lines[index].trim().startsWith('- ') || lines[index].trim().startsWith('* '))) {
        const itemText = lines[index].trim().slice(2);
        items.push({
          type: 'listitem',
          children: parseInline(itemText)
        });
        index++;
      }
      ast.push({
        type: 'list',
        ordered: false,
        items
      });
      continue;
    }

    // 7. Ordered Lists: 1. item
    if (/^\d+\.\s+/.test(line.trim())) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        const match = lines[index].trim().match(/^\d+\.\s+(.*)/);
        items.push({
          type: 'listitem',
          children: parseInline(match[1])
        });
        index++;
      }
      ast.push({
        type: 'list',
        ordered: true,
        items
      });
      continue;
    }

    // 8. Default Paragraph
    const paragraphLines = [];
    while (index < lines.length && 
           lines[index].trim() !== '' && 
           !lines[index].trim().startsWith('```') && 
           !lines[index].match(/^(#{1,6})\s+/) && 
           !lines[index].trim().startsWith('>') && 
           !lines[index].trim().startsWith('- ') && 
           !lines[index].trim().startsWith('* ') && 
           !/^\d+\.\s+/.test(lines[index].trim())) {
      paragraphLines.push(lines[index]);
      index++;
    }
    ast.push({
      type: 'paragraph',
      children: parseInline(paragraphLines.join('\n'))
    });
  }

  return ast;
}

/**
 * Renders the Abstract Syntax Tree (AST) to sanitized HTML.
 */
export function renderHtml(ast) {
  let html = '';

  function renderInlineHtml(tokens) {
    return tokens.map(tok => {
      switch (tok.type) {
        case 'text':
          return escapeHtml(tok.value);
        case 'bold':
          return `<strong>${renderInlineHtml(tok.children)}</strong>`;
        case 'italic':
          return `<em>${renderInlineHtml(tok.children)}</em>`;
        case 'bolditalic':
          return `<strong><em>${renderInlineHtml(tok.children)}</em></strong>`;
        case 'code':
          return `<code>${escapeHtml(tok.value)}</code>`;
        case 'link':
          return `<a href="${escapeHtml(sanitizeUrl(tok.url))}">${renderInlineHtml(tok.children)}</a>`;
        case 'image':
          return `<img src="${escapeHtml(sanitizeUrl(tok.url))}" alt="${escapeHtml(tok.alt)}" />`;
        default:
          return '';
      }
    }).join('');
  }

  for (const block of ast) {
    switch (block.type) {
      case 'heading':
        html += `<h${block.depth}>${renderInlineHtml(block.children)}</h${block.depth}>\n`;
        break;
      case 'paragraph':
        html += `<p>${renderInlineHtml(block.children)}</p>\n`;
        break;
      case 'blockquote':
        html += `<blockquote>\n${renderHtml(block.children)}</blockquote>\n`;
        break;
      case 'codeblock':
        const langClass = block.lang ? ` class="language-${escapeHtml(block.lang)}"` : '';
        html += `<pre><code${langClass}>${escapeHtml(block.value)}</code></pre>\n`;
        break;
      case 'list':
        const tag = block.ordered ? 'ol' : 'ul';
        html += `<${tag}>\n`;
        for (const item of block.items) {
          html += `  <li>${renderInlineHtml(item.children)}</li>\n`;
        }
        html += `</${tag}>\n`;
        break;
      case 'table':
        html += `<table>\n  <thead>\n    <tr>\n`;
        for (const head of block.headers) {
          html += `      <th>${renderInlineHtml(head)}</th>\n`;
        }
        html += `    </tr>\n  </thead>\n  <tbody>\n`;
        for (const row of block.rows) {
          html += `    <tr>\n`;
          for (const cell of row) {
            html += `      <td>${renderInlineHtml(cell)}</td>\n`;
          }
          html += `    </tr>\n`;
        }
        html += `  </tbody>\n</table>\n`;
        break;
    }
  }

  return html;
}
