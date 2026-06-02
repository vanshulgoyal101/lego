/**
 * Template Engine
 * Minimal zero-dependency string template engine.
 * Supports:
 *   - {{variable}}       – value interpolation (dot-path supported)
 *   - {{#if key}} ... {{/if}}  – conditional blocks (falsy = hidden)
 *   - {{#each arr}} ... {{/each}} – iteration (exposes {{this}}, {{@index}})
 *   - {{{raw}}}          – unescaped HTML interpolation
 */

/**
 * HTML-escapes a string to prevent XSS in double-brace interpolation.
 *
 * @param {*} val - Value to escape.
 * @returns {string} HTML-safe string.
 */
function escapeHtml(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Resolves a dot-path expression like 'user.name' against a data context.
 *
 * @param {string} path - Dot-separated key path.
 * @param {object} ctx - Data context object.
 * @returns {*} Resolved value, or `undefined` if not found.
 */
function resolvePath(path, ctx) {
  if (path === 'this') return Object.prototype.hasOwnProperty.call(ctx, 'this') ? ctx['this'] : ctx;
  return path.split('.').reduce((acc, key) => acc?.[key], ctx);
}

/**
 * Internal recursive render that processes a template string against a context.
 *
 * @param {string} template - Template string.
 * @param {object} ctx - Data context.
 * @returns {string} Rendered output.
 */
function _render(template, ctx) {
  // 1. Handle {{#each arr}} ... {{/each}}
  template = template.replace(
    /\{\{#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_, path, body) => {
      const list = resolvePath(path, ctx);
      if (!Array.isArray(list)) return '';
      return list
        .map((item, index) => {
          const itemCtx =
            item !== null && typeof item === 'object'
              ? { ...item, '@index': index, this: item }
              : { this: item, '@index': index };
          return _render(body, { ...ctx, ...itemCtx });
        })
        .join('');
    }
  );

  // 2. Handle {{#if key}} ... {{else}} ... {{/if}}
  template = template.replace(
    /\{\{#if\s+([\w.]+)\s*\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
    (_, path, truthy, falsy = '') => {
      const val = resolvePath(path, ctx);
      return val ? _render(truthy, ctx) : _render(falsy, ctx);
    }
  );

  // 3. Handle {{{raw}}} – no HTML escaping
  template = template.replace(/\{\{\{([\w.@]+)\}\}\}/g, (_, path) => {
    const val = resolvePath(path, ctx);
    return val == null ? '' : String(val);
  });

  // 4. Handle {{variable}} – HTML-escaped
  template = template.replace(/\{\{([\w.@]+)\}\}/g, (_, path) => {
    const val = resolvePath(path, ctx);
    return val == null ? '' : escapeHtml(val);
  });

  return template;
}

/**
 * Compiles a template string into a reusable renderer function.
 * Calling the returned function with a data object produces the final string.
 *
 * @param {string} template - The template string.
 * @returns {function(data: object): string} A renderer function.
 * @example
 * const greet = compile('Hello, {{name}}!');
 * greet({ name: 'World' }); // 'Hello, World!'
 */
export function compile(template) {
  if (typeof template !== 'string') {
    throw new TypeError('template must be a string');
  }
  return function renderer(data = {}) {
    return _render(template, data);
  };
}

/**
 * One-shot render: compiles and immediately renders a template with data.
 *
 * @param {string} template - The template string.
 * @param {object} [data={}] - Data context.
 * @returns {string} The rendered output string.
 * @example
 * render('Hello, {{name}}!', { name: 'World' }); // 'Hello, World!'
 * render('{{#if show}}visible{{/if}}', { show: true }); // 'visible'
 * render('{{#each items}}{{this}} {{/each}}', { items: ['a','b'] }); // 'a b '
 */
export function render(template, data = {}) {
  return compile(template)(data);
}
