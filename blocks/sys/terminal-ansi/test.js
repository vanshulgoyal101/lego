import { describe, it, expect } from '../../../test/test-harness.js';
import { style, strip, red, green, bold, underline } from './index.js';

await describe('sys/terminal-ansi', async () => {
  await it('should format text with color and style ANSI escape codes', () => {
    const output = style('Hello', { color: 'red', bold: true });
    // Expect output to start with escape sequence for red (31) and bold (1)
    expect(output.includes('\x1B[1;31m')).toBe(true);
    expect(output.includes('Hello')).toBe(true);
    expect(output.endsWith('\x1B[0m')).toBe(true);
  });

  await it('should support simple helper methods', () => {
    const r = red('Error');
    expect(r.includes('31')).toBe(true);

    const g = green('Success');
    expect(g.includes('32')).toBe(true);

    const b = bold('Strong');
    expect(b.includes('1')).toBe(true);

    const u = underline('Underlined');
    expect(u.includes('4')).toBe(true);
  });

  await it('should strip ANSI escape codes successfully', () => {
    const formatted = style('Styled Text', { color: 'blue', bg: 'yellow', underline: true });
    const stripped = strip(formatted);
    expect(stripped).toBe('Styled Text');
    expect(stripped.includes('\x1B')).toBe(false);
  });
});
