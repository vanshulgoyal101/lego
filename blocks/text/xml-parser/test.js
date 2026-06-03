import { describe, it, expect } from '../../../test/test-harness.js';
import { parse, parseAST } from './index.js';

await describe('text/xml-parser', async () => {
  await it('should parse simple XML nodes into nested objects', () => {
    const xml = `
      <note>
        <to>Tove</to>
        <from>Jani</from>
        <heading>Reminder</heading>
        <body>Don't forget me!</body>
      </note>
    `;

    const result = parse(xml);
    expect(result.note.to).toBe('Tove');
    expect(result.note.from).toBe('Jani');
    expect(result.note.heading).toBe('Reminder');
    expect(result.note.body).toBe("Don't forget me!");
  });

  await it('should parse tag attributes correctly', () => {
    const xml = `<book category="web" year="2026">Lego Library</book>`;
    const result = parse(xml);
    expect(result.book._attributes.category).toBe('web');
    expect(result.book._attributes.year).toBe('2026');
    expect(result.book._text).toBe('Lego Library');
  });

  await it('should parse multiple sibling nodes of the same name as arrays', () => {
    const xml = `
      <library>
        <book>Book A</book>
        <book>Book B</book>
      </library>
    `;
    const result = parse(xml);
    expect(Array.isArray(result.library.book)).toBe(true);
    expect(result.library.book[0]).toBe('Book A');
    expect(result.library.book[1]).toBe('Book B');
  });

  await it('should handle self-closing tags', () => {
    const xml = `
      <root>
        <item status="active" />
        <content>text</content>
      </root>
    `;
    const result = parse(xml);
    expect(result.root.item._attributes.status).toBe('active');
    expect(result.root.content).toBe('text');
  });

  await it('should unescape standard XML entities', () => {
    const xml = `<message>Hello &amp; welcome &lt;back&gt;</message>`;
    const result = parse(xml);
    expect(result.message).toBe('Hello & welcome <back>');
  });
});
