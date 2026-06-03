function camelToKebab(str) {
  if (str === 'viewBox') return 'viewBox';
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

function formatAttributes(attrs) {
  return Object.entries(attrs)
    .filter(([_, val]) => val !== undefined && val !== null)
    .map(([key, val]) => `${camelToKebab(key)}="${val}"`)
    .join(' ');
}

export class SVGGenerator {
  /**
   * Creates a new SVG generator instance.
   * @param {Object} [options={}] - Root SVG element configuration options.
   * @param {number} [options.width=800] - Width of the SVG canvas.
   * @param {number} [options.height=600] - Height of the SVG canvas.
   * @param {Object} [options.attributes={}] - Extra attributes on the root svg tag.
   */
  constructor(options = {}) {
    this.width = options.width ?? 800;
    this.height = options.height ?? 600;
    this.rootAttributes = options.attributes ?? {};
    this.elements = [];
  }

  /**
   * Adds a rectangle shape.
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {Object} [attributes={}]
   * @returns {SVGGenerator} this
   */
  rect(x, y, width, height, attributes = {}) {
    const attrsStr = formatAttributes({ x, y, width, height, ...attributes });
    this.elements.push(`<rect ${attrsStr} />`);
    return this;
  }

  /**
   * Adds a circle shape.
   * @param {number} cx
   * @param {number} cy
   * @param {number} r
   * @param {Object} [attributes={}]
   * @returns {SVGGenerator} this
   */
  circle(cx, cy, r, attributes = {}) {
    const attrsStr = formatAttributes({ cx, cy, r, ...attributes });
    this.elements.push(`<circle ${attrsStr} />`);
    return this;
  }

  /**
   * Adds a line shape.
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {Object} [attributes={}]
   * @returns {SVGGenerator} this
   */
  line(x1, y1, x2, y2, attributes = {}) {
    const attrsStr = formatAttributes({ x1, y1, x2, y2, ...attributes });
    this.elements.push(`<line ${attrsStr} />`);
    return this;
  }

  /**
   * Adds a polygon shape.
   * @param {Array|string} points - Array of points (e.g. [[10,10],[20,20]]) or points string.
   * @param {Object} [attributes={}]
   * @returns {SVGGenerator} this
   */
  polygon(points, attributes = {}) {
    let pointsStr = '';
    if (Array.isArray(points)) {
      pointsStr = points.map(p => Array.isArray(p) ? p.join(',') : `${p.x},${p.y}`).join(' ');
    } else {
      pointsStr = points;
    }
    const attrsStr = formatAttributes({ points: pointsStr, ...attributes });
    this.elements.push(`<polygon ${attrsStr} />`);
    return this;
  }

  /**
   * Adds a path shape.
   * @param {string} d - SVG path data string.
   * @param {Object} [attributes={}]
   * @returns {SVGGenerator} this
   */
  path(d, attributes = {}) {
    const attrsStr = formatAttributes({ d, ...attributes });
    this.elements.push(`<path ${attrsStr} />`);
    return this;
  }

  /**
   * Exports the constructed shapes into a valid SVG XML string.
   * @returns {string} SVG XML markup.
   */
  toString() {
    const rootAttrs = formatAttributes({
      xmlns: "http://www.w3.org/2000/svg",
      width: this.width,
      height: this.height,
      viewBox: `0 0 ${this.width} ${this.height}`,
      ...this.rootAttributes
    });
    const indent = '  ';
    return `<svg ${rootAttrs}>\n${this.elements.map(e => indent + e).join('\n')}\n</svg>`;
  }
}
