import { describe, it, expect } from '../../../test/test-harness.js';
import { HtmlParser } from './index.js';

await describe('text/html-parser', async () => {
  await it('should parse simple tags and attributes', () => {
    const html = '<div id="main" class=container>Hello <span style="color:red;">World</span></div>';
    const ast = HtmlParser.parse(html);

    expect(ast.length).toBe(1);
    
    const root = ast[0];
    expect(root.type).toBe('tag');
    expect(root.name).toBe('div');
    expect(root.attributes.id).toBe('main');
    expect(root.attributes.class).toBe('container');
    
    expect(root.children.length).toBe(2);
    expect(root.children[0].type).toBe('text');
    expect(root.children[0].content).toBe('Hello ');

    const span = root.children[1];
    expect(span.type).toBe('tag');
    expect(span.name).toBe('span');
    expect(span.attributes.style).toBe('color:red;');
    expect(span.children[0].type).toBe('text');
    expect(span.children[0].content).toBe('World');
  });

  await it('should handle self-closing tags', () => {
    const html = '<div>Line 1<br/>Line 2<img src="img.png" alt="image"></div>';
    const ast = HtmlParser.parse(html);

    const root = ast[0];
    expect(root.children.length).toBe(4);
    
    expect(root.children[1].type).toBe('tag');
    expect(root.children[1].name).toBe('br');
    
    expect(root.children[3].type).toBe('tag');
    expect(root.children[3].name).toBe('img');
    expect(root.children[3].attributes.src).toBe('img.png');
    expect(root.children[3].attributes.alt).toBe('image');
  });
});
