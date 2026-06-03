import { describe, it, expect } from '../../../test/test-harness.js';
import { renderChart } from './index.js';

function createMockCtx() {
  const calls = [];
  return {
    calls,
    clearRect(...args) { calls.push({ name: 'clearRect', args }); },
    beginPath(...args) { calls.push({ name: 'beginPath', args }); },
    moveTo(...args) { calls.push({ name: 'moveTo', args }); },
    lineTo(...args) { calls.push({ name: 'lineTo', args }); },
    stroke(...args) { calls.push({ name: 'stroke', args }); },
    fill(...args) { calls.push({ name: 'fill', args }); },
    fillRect(...args) { calls.push({ name: 'fillRect', args }); },
    arc(...args) { calls.push({ name: 'arc', args }); },
    fillText(...args) { calls.push({ name: 'fillText', args }); },
    closePath(...args) { calls.push({ name: 'closePath', args }); },
    set strokeStyle(val) { calls.push({ name: 'strokeStyle', val }); },
    set fillStyle(val) { calls.push({ name: 'fillStyle', val }); },
    set font(val) {},
    set textAlign(val) {},
    set textBaseline(val) {},
    set lineWidth(val) {}
  };
}

await describe('ui/canvas-charts', async () => {
  it('should call appropriate context rendering methods for a bar chart', () => {
    const ctx = createMockCtx();
    const data = [10, 20, 30];
    const labels = ['A', 'B', 'C'];

    renderChart(ctx, {
      type: 'bar',
      data,
      labels,
      title: 'Test Bar Chart'
    });

    // Check that clearRect, fillRect, fillText were invoked
    expect(ctx.calls.some(c => c.name === 'clearRect')).toBe(true);
    expect(ctx.calls.some(c => c.name === 'fillText' && c.args[0] === 'Test Bar Chart')).toBe(true);
    
    // We expect 3 fillRect calls (one for each data bar)
    const fillRects = ctx.calls.filter(c => c.name === 'fillRect');
    expect(fillRects.length).toBe(3);
  });

  it('should draw arc slices for a pie chart', () => {
    const ctx = createMockCtx();
    const data = [10, 20, 30];

    renderChart(ctx, {
      type: 'pie',
      data
    });

    const arcs = ctx.calls.filter(c => c.name === 'arc');
    expect(arcs.length).toBe(3);
  });

  it('should draw line segments for a line chart', () => {
    const ctx = createMockCtx();
    const data = [10, 20, 30];

    renderChart(ctx, {
      type: 'line',
      data
    });

    const lineTos = ctx.calls.filter(c => c.name === 'lineTo');
    // Connecting lines should draw segment path (axis layout plus connecting line vertices)
    expect(lineTos.length > 0).toBe(true);
  });
});
