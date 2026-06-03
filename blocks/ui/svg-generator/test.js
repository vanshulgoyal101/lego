import { describe, it, expect } from '../../../test/test-harness.js';
import { SVGGenerator } from './index.js';

await describe('ui/svg-generator', async () => {
  it('should construct basic shapes with converted camelCase attributes', () => {
    const svg = new SVGGenerator({ width: 100, height: 100, attributes: { id: 'test-svg' } })
      .rect(10, 10, 50, 50, { fill: 'red', strokeWidth: 2 })
      .circle(50, 50, 20, { fill: 'blue' })
      .line(0, 0, 100, 100, { stroke: 'black', strokeDasharray: '5,5' })
      .polygon([[10, 10], [20, 30], [30, 10]], { fill: 'green' })
      .path('M 10 10 L 20 20 Z', { fill: 'none', stroke: 'yellow' });

    const output = svg.toString();

    expect(output.includes('width="100"')).toBe(true);
    expect(output.includes('height="100"')).toBe(true);
    expect(output.includes('viewBox="0 0 100 100"')).toBe(true);
    expect(output.includes('id="test-svg"')).toBe(true);
    expect(output.includes('<rect x="10" y="10" width="50" height="50" fill="red" stroke-width="2" />')).toBe(true);
    expect(output.includes('<circle cx="50" cy="50" r="20" fill="blue" />')).toBe(true);
    expect(output.includes('<line x1="0" y1="0" x2="100" y2="100" stroke="black" stroke-dasharray="5,5" />')).toBe(true);
    expect(output.includes('<polygon points="10,10 20,30 30,10" fill="green" />')).toBe(true);
    expect(output.includes('<path d="M 10 10 L 20 20 Z" fill="none" stroke="yellow" />')).toBe(true);
  });
});
