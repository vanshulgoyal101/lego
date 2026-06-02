import { describe, it, expect } from '../../../test/test-harness.js';
import { compile, render } from './index.js';

await describe('utils/template-engine', async () => {
  await it('should interpolate simple variables', () => {
    expect(render('Hello, {{name}}!', { name: 'World' })).toBe('Hello, World!');
  });

  await it('should render empty string for missing variables', () => {
    expect(render('Hello, {{missing}}!')).toBe('Hello, !');
  });

  await it('should HTML-escape special characters in double braces', () => {
    const result = render('{{value}}', { value: '<script>alert(1)</script>' });
    expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  await it('should NOT escape triple braces (raw output)', () => {
    const result = render('{{{value}}}', { value: '<b>bold</b>' });
    expect(result).toBe('<b>bold</b>');
  });

  await it('should handle {{#if}} blocks – truthy condition', () => {
    expect(render('{{#if show}}visible{{/if}}', { show: true })).toBe('visible');
  });

  await it('should handle {{#if}} blocks – falsy condition', () => {
    expect(render('{{#if show}}visible{{/if}}', { show: false })).toBe('');
    expect(render('{{#if show}}visible{{/if}}', { show: 0 })).toBe('');
    expect(render('{{#if show}}visible{{/if}}', {})).toBe('');
  });

  await it('should handle {{#if}} with {{else}}', () => {
    expect(render('{{#if on}}yes{{else}}no{{/if}}', { on: true })).toBe('yes');
    expect(render('{{#if on}}yes{{else}}no{{/if}}', { on: false })).toBe('no');
  });

  await it('should handle {{#each}} with array of primitives', () => {
    expect(render('{{#each items}}{{this}} {{/each}}', { items: ['a', 'b', 'c'] }))
      .toBe('a b c ');
  });

  await it('should handle {{#each}} with array of objects', () => {
    const result = render('{{#each users}}{{name}} {{/each}}', {
      users: [{ name: 'Alice' }, { name: 'Bob' }]
    });
    expect(result).toBe('Alice Bob ');
  });

  await it('should expose {{@index}} inside each', () => {
    const result = render('{{#each items}}{{@index}}:{{this}} {{/each}}', { items: ['x', 'y'] });
    expect(result).toBe('0:x 1:y ');
  });

  await it('should handle empty {{#each}} arrays gracefully', () => {
    expect(render('{{#each items}}{{this}}{{/each}}', { items: [] })).toBe('');
  });

  await it('should support dot-path variable access', () => {
    expect(render('{{user.name}}', { user: { name: 'Ada' } })).toBe('Ada');
  });

  await it('compile should return a reusable renderer function', () => {
    const greet = compile('Hi {{name}}');
    expect(greet({ name: 'Alice' })).toBe('Hi Alice');
    expect(greet({ name: 'Bob' })).toBe('Hi Bob');
  });

  await it('compile should throw on non-string template', () => {
    expect(() => compile(123)).toThrow('string');
  });

  await it('should handle nested if inside each', () => {
    const tmpl = '{{#each items}}{{#if active}}{{name}} {{/if}}{{/each}}';
    const result = render(tmpl, {
      items: [{ name: 'A', active: true }, { name: 'B', active: false }]
    });
    expect(result).toBe('A ');
  });
});
