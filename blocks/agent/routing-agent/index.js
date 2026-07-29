/**
 * agent/routing-agent
 *
 * A routing agent that classifies and routes user prompts/messages to specific
 * destination targets (sub-agents, tools, or workflows). Supports keyword matching,
 * regular expression patterns, custom evaluator functions, and semantic vector similarity.
 */

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class RoutingAgent {
  /** @type {Map<string, { name: string, keywords: string[], regexes: RegExp[], matcher: Function|null, examples: string[], embeddings?: number[][] }>} */
  #routes = new Map();
  #defaultRoute = null;
  #embedder = null;
  #similarityThreshold = 0.7;

  /**
   * @param {object} [options]
   * @param {string} [options.defaultRoute] The route name to use when no matches exceed thresholds.
   * @param {Function} [options.embedder] Async function `(text: string) => Promise<number[]>` for semantic routing.
   * @param {number} [options.similarityThreshold=0.7] Min cosine similarity score to match a route.
   */
  constructor(options = {}) {
    this.#defaultRoute = options.defaultRoute || null;
    this.#embedder = options.embedder || null;
    this.#similarityThreshold = typeof options.similarityThreshold === 'number' ? options.similarityThreshold : 0.7;
  }

  /**
   * Register a new route/destination.
   *
   * @param {string} name Unique identifier for the destination/route.
   * @param {object} rule Rule definition for routing.
   * @param {string[]} [rule.keywords] Keyword strings to scan for (case-insensitive).
   * @param {RegExp[]} [rule.regexes] Regular expressions to match against input.
   * @param {Function} [rule.matcher] Custom function `(input: string) => boolean | number` returning match status or confidence score (0 to 1).
   * @param {string[]} [rule.examples] Training examples used for semantic routing if an embedder is provided.
   */
  addRoute(name, rule = {}) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError('Route name must be a non-empty string.');
    }
    if (this.#routes.has(name)) {
      throw new Error(`Route "${name}" is already registered.`);
    }

    const keywords = (rule.keywords || []).map(k => k.toLowerCase());
    const regexes = rule.regexes || [];
    const matcher = rule.matcher || null;
    const examples = rule.examples || [];

    this.#routes.set(name, {
      name,
      keywords,
      regexes,
      matcher,
      examples,
    });
  }

  /**
   * Pre-generates semantic embeddings for all registered route examples using the configured embedder.
   * Must be called before running semantic routing if examples are used.
   *
   * @returns {Promise<void>}
   */
  async prepareEmbeddings() {
    if (!this.#embedder) {
      throw new Error('Cannot prepare embeddings without an embedder function.');
    }

    for (const route of this.#routes.values()) {
      if (route.examples.length > 0) {
        route.embeddings = await Promise.all(
          route.examples.map(ex => this.#embedder(ex))
        );
      }
    }
  }

  /**
   * Classify the input and determine the target destination.
   * Evaluates rules in the following order of priority:
   * 1. Matcher: Numeric matcher scores are treated as strongest matcher candidates.
   *    Boolean matcher hits (`true`) are used only when no numeric matcher route matched.
   * 2. Regex: If any regex matches the input.
   * 3. Keywords: If any keywords are present in the input.
   * 4. Semantic similarity: If an embedder is provided and examples are populated.
   *
   * @param {string} input The user query or prompt.
   * @returns {Promise<{ route: string, confidence: number, method: 'matcher' | 'regex' | 'keyword' | 'semantic' | 'default' }>}
   */
  async route(input) {
    if (typeof input !== 'string') {
      throw new TypeError('Input must be a string.');
    }

    let bestRoute = null;
    let bestScore = 0;
    let bestMethod = null;
    let bestBooleanMatcherRoute = null;

    // 1. Evaluate Rule-based matches (Matcher, Regex, Keyword)
    for (const route of this.#routes.values()) {
      // 1a. Custom matcher function
      if (route.matcher) {
        const matchResult = route.matcher(input);
        if (typeof matchResult === 'number' && matchResult > bestScore) {
          bestScore = matchResult;
          bestRoute = route.name;
          bestMethod = 'matcher';
        } else if (matchResult === true && !bestBooleanMatcherRoute) {
          bestBooleanMatcherRoute = route.name;
        }
      }

      // 1b. Regular Expressions
      for (const regex of route.regexes) {
        if (regex.test(input)) {
          if (bestScore < 0.9) {
            bestScore = 0.9;
            bestRoute = route.name;
            bestMethod = 'regex';
          }
        }
      }

      // 1c. Keyword checks
      const lowercaseInput = input.toLowerCase();
      for (const keyword of route.keywords) {
        if (lowercaseInput.includes(keyword)) {
          if (bestScore < 0.8) {
            bestScore = 0.8;
            bestRoute = route.name;
            bestMethod = 'keyword';
          }
        }
      }
    }

    if (!bestRoute && bestBooleanMatcherRoute) {
      bestRoute = bestBooleanMatcherRoute;
      bestScore = 1.0;
      bestMethod = 'matcher';
    }

    // 2. Fall back to Semantic Similarity if score is not high and embedder is available
    if (bestScore < this.#similarityThreshold && this.#embedder) {
      try {
        const inputEmbedding = await this.#embedder(input);
        let bestSemanticRoute = null;
        let bestSemanticScore = 0;

        for (const route of this.#routes.values()) {
          if (route.embeddings && route.embeddings.length > 0) {
            for (const emb of route.embeddings) {
              const sim = cosineSimilarity(inputEmbedding, emb);
              if (sim > bestSemanticScore) {
                bestSemanticScore = sim;
                bestSemanticRoute = route.name;
              }
            }
          }
        }

        if (bestSemanticScore >= this.#similarityThreshold && bestSemanticScore > bestScore) {
          bestScore = bestSemanticScore;
          bestRoute = bestSemanticRoute;
          bestMethod = 'semantic';
        }
      } catch (err) {
        // Fallback gracefully on embedding failure
      }
    }

    if (bestRoute && bestScore > 0) {
      return {
        route: bestRoute,
        confidence: bestScore,
        method: bestMethod,
      };
    }

    return {
      route: this.#defaultRoute,
      confidence: 0,
      method: 'default',
    };
  }

  /**
   * Lists all registered routes.
   * @returns {string[]}
   */
  getRoutes() {
    return Array.from(this.#routes.keys());
  }
}
