/**
 * A lightweight regex-based Markdown to HTML parser.
 * Handles headers, bold, italic, code blocks, lists, links, and paragraphs.
 */
export function parseMarkdown(markdown) {
  let html = markdown
    // 1. Normalize line endings
    .replace(/\r\n/g, '\n')
    // 2. Escape HTML special characters to prevent XSS in content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. Fenced Code Blocks (```lang ... ```)
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // 4. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 5. Headers (# to ######)
  html = html.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // 6. Unordered Lists (- or *)
  // Wrap list items in <ul>
  html = html.replace(/^[\s]*[\-\*] (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // 7. Bold (**text** or __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // 8. Italic (*text* or _text_)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // 9. Links ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 10. Paragraphs (lines separated by double newlines, ignoring existing tag blocks)
  const lines = html.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed === '') {
      return '';
    }
    // If it already looks like a block tag, leave it alone
    if (/^<\/?(h\d|pre|code|ul|li|a|strong|em)/i.test(trimmed)) {
      return line;
    }
    return `<p>${trimmed}</p>`;
  });

  return processedLines.filter(l => l !== '').join('\n');
}
