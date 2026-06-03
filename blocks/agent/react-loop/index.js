/**
 * @module agent/react-loop
 * @description Implements the ReAct (Reasoning + Acting) loop pattern for AI agents.
 * The loop runs: Thought → Action → Observation → repeat until a final answer
 * is produced or the maximum number of iterations is reached.
 */

/**
 * Parses a standard ReAct-formatted LLM response into a structured object.
 *
 * Supported formats:
 *
 * Thought + Action:
 * ```
 * Thought: I need to look this up.
 * Action: search
 * Action Input: {"query": "latest news"}
 * ```
 *
 * Final Answer:
 * ```
 * Final Answer: The sky is blue.
 * ```
 *
 * @param {string} text - Raw LLM output text.
 * @returns {{ type: 'thought'|'action'|'final', thought?: string, action?: string, actionInput?: any, answer?: string }}
 */
export function defaultParseResponse(text) {
  const trimmed = text.trim();

  // Check for Final Answer first
  const finalMatch = trimmed.match(/Final Answer:\s*([\s\S]+)/i);
  if (finalMatch) {
    return { type: 'final', answer: finalMatch[1].trim() };
  }

  // Extract Thought
  const thoughtMatch = trimmed.match(/Thought:\s*(.+?)(?=\nAction:|\n*$)/is);
  const thought = thoughtMatch ? thoughtMatch[1].trim() : undefined;

  // Extract Action
  const actionMatch = trimmed.match(/Action:\s*(.+)/i);
  const action = actionMatch ? actionMatch[1].trim() : undefined;

  // Extract Action Input
  const actionInputMatch = trimmed.match(/Action Input:\s*([\s\S]+)/i);
  let actionInput;
  if (actionInputMatch) {
    const raw = actionInputMatch[1].trim();
    try {
      actionInput = JSON.parse(raw);
    } catch {
      // If not valid JSON, keep as raw string
      actionInput = raw;
    }
  }

  if (action) {
    return { type: 'action', thought, action, actionInput };
  }

  // Only a thought with no action — treat as a thought step
  if (thought) {
    return { type: 'thought', thought };
  }

  // Fallback: treat entire text as a final answer
  return { type: 'final', answer: trimmed };
}

/**
 * Formats a list of tool descriptors into a human-readable string
 * suitable for injection into a system prompt.
 *
 * @param {Array<{ name: string, description: string }>} tools - List of tool metadata.
 * @returns {string} A formatted, numbered list of available tools.
 *
 * @example
 * formatToolList([{ name: 'search', description: 'Search the web' }]);
 * // "Available tools:\n1. search — Search the web"
 */
export function formatToolList(tools) {
  if (!tools || tools.length === 0) {
    return 'Available tools:\n(none)';
  }

  const lines = tools.map(
    (tool, i) => `${i + 1}. ${tool.name} — ${tool.description}`
  );
  return `Available tools:\n${lines.join('\n')}`;
}

/**
 * ReActLoop implements the ReAct (Reasoning + Acting) agent loop pattern.
 *
 * The loop runs:
 *   1. Call LLM with current message history
 *   2. Parse the response into a structured step
 *   3. If the step is an 'action', execute the registered tool and record the observation
 *   4. Append the result to message history and repeat
 *   5. Stop when the agent outputs a 'final' answer or maxIterations is reached
 *
 * @example
 * const loop = new ReActLoop({ maxIterations: 5 });
 * loop.addTool('search', 'Search the web for information', async ({ query }) => {
 *   return `Results for: ${query}`;
 * });
 * const result = await loop.run(defaultParseResponse, myCallLLM);
 * console.log(result.answer);
 */
export class ReActLoop {
  /**
   * @param {object} [options]
   * @param {number} [options.maxIterations=10] - Maximum number of ReAct loop iterations before stopping.
   * @param {function} [options.onStep] - Optional callback invoked after each step with `(step)`.
   *   The step object has the shape: `{ iteration, type, thought?, action?, actionInput?, observation?, answer? }`.
   */
  constructor({ maxIterations = 10, onStep } = {}) {
    this.maxIterations = maxIterations;
    this.onStep = onStep || null;
    /** @type {Map<string, { description: string, fn: function }>} */
    this._tools = new Map();
  }

  /**
   * Registers a callable tool with the agent loop.
   *
   * @param {string} name - Unique tool name (used by the LLM to reference it).
   * @param {string} description - Human-readable description of what the tool does.
   * @param {function(any): Promise<string>} fn - Async function that executes the tool.
   *   Receives the parsed `actionInput` and must return a string observation.
   * @returns {this} For chaining.
   */
  addTool(name, description, fn) {
    this._tools.set(name, { description, fn });
    return this;
  }

  /**
   * Returns the list of registered tools as plain objects (without the fn).
   * Useful for injecting into a system prompt via {@link formatToolList}.
   *
   * @returns {Array<{ name: string, description: string }>}
   */
  getTools() {
    return Array.from(this._tools.entries()).map(([name, { description }]) => ({
      name,
      description,
    }));
  }

  /**
   * Runs the ReAct loop until a final answer is produced or maxIterations is hit.
   *
   * @param {function(string): { type: string, thought?: string, action?: string, actionInput?: any, answer?: string }} parseResponse
   *   Parses raw LLM text into a structured step object.
   * @param {function(Array<{ role: string, content: string }>): Promise<string>} callLLM
   *   Async function that sends the current message history to the LLM and returns raw text.
   * @returns {Promise<{ answer: string|null, steps: Array<object>, iterations: number }>}
   *   - `answer`: The final answer produced by the agent, or `null` if maxIterations was reached.
   *   - `steps`: All recorded steps in order.
   *   - `iterations`: Number of iterations executed.
   */
  async run(parseResponse, callLLM) {
    /** @type {Array<{ role: string, content: string }>} */
    const messages = [];
    /** @type {Array<object>} */
    const steps = [];
    let iterations = 0;

    while (iterations < this.maxIterations) {
      iterations++;

      // Call the LLM with the current message history
      const rawText = await callLLM(messages);

      // Parse the LLM's response
      const parsed = parseResponse(rawText);

      // Build a step record
      const step = { iteration: iterations, ...parsed };

      if (parsed.type === 'final') {
        steps.push(step);
        if (this.onStep) this.onStep(step);

        // Append assistant message
        messages.push({ role: 'assistant', content: rawText });

        return { answer: parsed.answer ?? null, steps, iterations };
      }

      if (parsed.type === 'action') {
        // Append the assistant's thought+action to history
        messages.push({ role: 'assistant', content: rawText });

        // Execute the tool
        let observation;
        const toolEntry = this._tools.get(parsed.action);
        if (toolEntry) {
          try {
            observation = await toolEntry.fn(parsed.actionInput);
          } catch (err) {
            observation = `Error executing tool "${parsed.action}": ${err.message}`;
          }
        } else {
          observation = `Tool "${parsed.action}" is not registered.`;
        }

        step.observation = observation;
        steps.push(step);
        if (this.onStep) this.onStep(step);

        // Append the observation as a user/system message
        messages.push({ role: 'user', content: `Observation: ${observation}` });
        continue;
      }

      // For 'thought' type or unrecognised — record and continue
      steps.push(step);
      if (this.onStep) this.onStep(step);
      messages.push({ role: 'assistant', content: rawText });
    }

    // maxIterations reached without a final answer
    return { answer: null, steps, iterations };
  }
}
