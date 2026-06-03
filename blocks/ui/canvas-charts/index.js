/**
 * Renders a bar, line, or pie chart onto an HTML Canvas 2D Context.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D context.
 * @param {Object} config - Configuration options.
 * @param {string} [config.type='bar'] - Chart type: 'bar' | 'line' | 'pie'.
 * @param {number[]|Object[]} config.data - Numeric data points or items with { value, label, color }.
 * @param {string[]} [config.labels=[]] - Optional labels array matching data elements index.
 * @param {string[]} [config.colors] - Default colors sequence palette.
 * @param {number} [config.width=600] - Render width boundary.
 * @param {number} [config.height=400] - Render height boundary.
 * @param {number} [config.padding=50] - Offset boundary for graph elements.
 * @param {string} [config.title=''] - Chart title to print.
 */
export function renderChart(ctx, {
  type = 'bar',
  data = [],
  labels = [],
  colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  width = 600,
  height = 400,
  padding = 50,
  title = ''
} = {}) {
  // Clear canvas or frame background
  ctx.clearRect(0, 0, width, height);

  // Normalize data format
  const normalizedData = data.map((item, idx) => {
    if (typeof item === 'number') {
      return {
        value: item,
        label: labels[idx] ?? `Item ${idx + 1}`,
        color: colors[idx % colors.length]
      };
    }
    return {
      value: item.value ?? 0,
      label: item.label ?? labels[idx] ?? `Item ${idx + 1}`,
      color: item.color ?? colors[idx % colors.length]
    };
  });

  if (normalizedData.length === 0) return;

  // Title
  if (title) {
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, width / 2, 15);
  }

  if (type === 'pie') {
    // Pie Chart
    const total = normalizedData.reduce((sum, item) => sum + item.value, 0);
    const cx = width / 2;
    const cy = height / 2 + (title ? 10 : 0);
    const radius = Math.min(width, height) / 2 - padding;

    let startAngle = -Math.PI / 2;

    normalizedData.forEach(item => {
      if (total === 0) return;
      const sliceAngle = (item.value / total) * Math.PI * 2;

      // Draw Slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // Simple slice outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    });
  } else {
    // Bar or Line Chart setup
    const xMin = padding;
    const xMax = width - padding;
    const yMin = padding + (title ? 20 : 0);
    const yMax = height - padding;
    const chartWidth = xMax - xMin;
    const chartHeight = yMax - yMin;

    const values = normalizedData.map(d => d.value);
    const maxVal = Math.max(...values, 1);

    // Draw Axes & Grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xMin, yMin);
    ctx.lineTo(xMin, yMax);
    ctx.lineTo(xMax, yMax);
    ctx.stroke();

    // Horizontal grid lines
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = yMax - (i / gridCount) * chartHeight;
      const labelVal = Math.round((i / gridCount) * maxVal);
      
      // Line
      ctx.beginPath();
      ctx.moveTo(xMin, y);
      ctx.lineTo(xMax, y);
      ctx.stroke();

      // Y Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(labelVal), xMin - 8, y);
    }

    if (type === 'bar') {
      const barSpacing = 10;
      const count = normalizedData.length;
      const totalSpacing = barSpacing * (count + 1);
      const barWidth = (chartWidth - totalSpacing) / count;

      normalizedData.forEach((item, idx) => {
        const x = xMin + barSpacing + idx * (barWidth + barSpacing);
        const valHeight = (item.value / maxVal) * chartHeight;
        const y = yMax - valHeight;

        // Draw Bar
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, barWidth, valHeight);

        // X Label
        ctx.fillStyle = '#4b5563';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(item.label, x + barWidth / 2, yMax + 8);
      });
    } else if (type === 'line') {
      const count = normalizedData.length;
      const xStep = count > 1 ? chartWidth / (count - 1) : chartWidth;

      // Draw connecting lines
      ctx.beginPath();
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = 3;
      normalizedData.forEach((item, idx) => {
        const x = xMin + idx * xStep;
        const y = yMax - (item.value / maxVal) * chartHeight;
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw points & labels
      normalizedData.forEach((item, idx) => {
        const x = xMin + idx * xStep;
        const y = yMax - (item.value / maxVal) * chartHeight;

        // Circle point
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // X Label
        ctx.fillStyle = '#4b5563';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(item.label, x, yMax + 8);
      });
    }
  }
}
