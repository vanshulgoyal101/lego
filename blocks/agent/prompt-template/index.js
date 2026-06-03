/**
 * agent/prompt-template
 * Handlebars-style prompt builder with slot filling, few-shot injection,
 * and multi-role message management for LLM API calls.
 */

/**
 * Compile a template string by replacing {{variable}} placeholders.
 * Supports dot-notation for nested keys: {{user.name}}.
 * @param {string} template
 * @param {Record<string, any>} vars
 * @returns {string}
 */
export function fillTemplate(template, vars) {
  return template.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
    const val = path.split('.').reduce((obj, k) => obj?.[k], vars);
    return val === undefined ? `{{${path}}}` : String(val);
  });
}

/**
 * Build an array of LLM messages (OpenAI-compatible format).
 *
 * @param {object} options
 * @param {string} [options.system]         System prompt template
 * @param {Array<{role:string, content:string}>} [options.fewShot]  Few-shot examples
 * @param {string} options.user             User message template
 * @param {Record<string, any>} [options.vars]  Variables to fill
 * @returns {Array<{role: string, content: string}>}
 */
export function buildMessages({ system, fewShot = [], user, vars = {} }) {
  const messages = [];

  if (system) {
    messages.push({ role: 'system', content: fillTemplate(system, vars) });
  }

  for (const example of fewShot) {
    messages.push({ role: example.role, content: fillTemplate(example.content, vars) });
  }

  messages.push({ role: 'user', content: fillTemplate(user, vars) });
  return messages;
}

/**
 * PromptTemplate class for reusable, parameterized prompt management.
 */
export class PromptTemplate {
  /**
   * @param {object} config
   * @param {string} [config.system]
   * @param {Array<{role:string, content:string}>} [config.fewShot]
   * @param {string} config.user
   * @param {Record<string, any>} [config.defaults]
   */
  constructor({ system, fewShot = [], user, defaults = {} }) {
    this.system = system;
    this.fewShot = fewShot;
    this.user = user;
    this.defaults = defaults;
  }

  /**
   * Render the template with provided variables, merged over defaults.
   * @param {Record<string, any>} vars
   * @returns {Array<{role: string, content: string}>}
   */
  render(vars = {}) {
    return buildMessages({
      system: this.system,
      fewShot: this.fewShot,
      user: this.user,
      vars: { ...this.defaults, ...vars },
    });
  }

  /**
   * Extend this template with additional few-shot examples.
   * @param {Array<{role:string, content:string}>} examples
   * @returns {PromptTemplate}
   */
  withFewShot(examples) {
    return new PromptTemplate({
      system: this.system,
      fewShot: [...this.fewShot, ...examples],
      user: this.user,
      defaults: this.defaults,
    });
  }

  /**
   * Count approximate tokens (1 token ≈ 4 chars) across all rendered messages.
   * @param {Record<string, any>} vars
   * @returns {number}
   */
  estimateTokens(vars = {}) {
    const msgs = this.render(vars);
    const total = msgs.reduce((sum, m) => sum + m.content.length, 0);
    return Math.ceil(total / 4);
  }
}
