import { describe, it, expect } from '../../../test/test-harness.js';
import { BBCodeParser } from './index.js';

await describe('text/bbcode-parser', async () => {
  await it('should correctly parse standard BBCode tags', () => {
    const input = 'Hello [b]World[/b]! Join us at [url=https://example.com]Example[/url].';
    const html = BBCodeParser.parse(input);

    expect(html).toBe('Hello <strong>World</strong>! Join us at <a href="https://example.com">Example</a>.');
  });

  await it('should handle nested tags and escaping', () => {
    const input = '[b]Bold and [i]Italic[/i][/b] with <html> injection check';
    const html = BBCodeParser.parse(input);

    expect(html).toBe('<strong>Bold and <em>Italic</em></strong> with &lt;html&gt; injection check');
  });
});
