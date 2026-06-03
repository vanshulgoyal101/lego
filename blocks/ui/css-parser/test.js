import { describe, it, expect } from '../../../test/test-harness.js';
import { parse, stringify } from './index.js';

await describe('ui/css-parser', async () => {
  await it('should parse simple stylesheet rules correctly', () => {
    const css = `
      body {
        margin: 0;
        padding: 10px;
      }
      h1, h2 {
        color: #ff0000;
      }
    `;

    const rules = parse(css);
    expect(rules.length).toBe(2);

    expect(rules[0].selectors[0]).toBe('body');
    expect(rules[0].declarations['margin']).toBe('0');
    expect(rules[0].declarations['padding']).toBe('10px');

    expect(rules[1].selectors.length).toBe(2);
    expect(rules[1].selectors[0]).toBe('h1');
    expect(rules[1].selectors[1]).toBe('h2');
    expect(rules[1].declarations['color']).toBe('#ff0000');
  });

  await it('should ignore CSS comments', () => {
    const css = `
      /* Header styles */
      header {
        background-color: blue; /* main background */
      }
    `;
    const rules = parse(css);
    expect(rules.length).toBe(1);
    expect(rules[0].selectors[0]).toBe('header');
    expect(rules[0].declarations['background-color']).toBe('blue');
  });

  await it('should handle values with colons correctly (e.g. urls)', () => {
    const css = `
      .logo {
        background-image: url('http://example.com/logo.png');
      }
    `;
    const rules = parse(css);
    expect(rules[0].declarations['background-image']).toBe("url('http://example.com/logo.png')");
  });

  await it('should stringify structured rules back to CSS', () => {
    const rules = [
      {
        selectors: ['div', 'p'],
        declarations: {
          display: 'block',
          color: 'black'
        }
      }
    ];
    const css = stringify(rules);
    expect(css.includes('div, p')).toBe(true);
    expect(css.includes('display: block;')).toBe(true);
  });
});
