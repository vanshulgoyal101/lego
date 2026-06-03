import { describe, it, expect } from '../../../test/test-harness.js';
import { MarkdownTable } from './index.js';

await describe('text/markdown-table', async () => {
  await it('should format objects into an aligned markdown table', () => {
    const data = [
      { id: '1', name: 'Alice', role: 'Admin' },
      { id: '2', name: 'Bob', role: 'User' }
    ];

    const table = MarkdownTable.format(data, {
      align: ['left', 'center', 'right']
    });

    const lines = table.split('\n');
    expect(lines.length).toBe(4);
    // Delimiter line check
    expect(lines[1]).toBe('| :-- | :---: | ----: |');
    // Align right test
    expect(lines[2].includes(' Admin |')).toBe(true);
  });

  await it('should format arrays of arrays', () => {
    const data = [
      ['City', 'Pop'],
      ['NY', '8M'],
      ['LA', '4M']
    ];

    const table = MarkdownTable.format(data);
    const lines = table.split('\n');
    expect(lines[0]).toBe('| City | Pop |');
    expect(lines[2]).toBe('| NY   | 8M  |');
  });
});
