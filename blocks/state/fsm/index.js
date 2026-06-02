/**
 * A simple, lightweight Finite State Machine (FSM) implementation.
 * Useful for managing complex application flows, component states,
 * or AI agent execution states.
 */
export class StateMachine {
  /**
   * @param {Object} config - Configuration object.
   * @param {string} config.initial - The starting state.
   * @param {Object} config.states - State definition mapping state names to transitions and events.
   * @param {Object} [config.context={}] - Arbitrary data payload shared across the machine.
   */
  constructor(config) {
    this.initial = config.initial;
    this.states = config.states;
    this.context = config.context || {};
    this.currentState = config.initial;
    this.listeners = new Set();
    this.history = [config.initial];
  }

  /**
   * Returns the current state of the machine.
   * @returns {string} The active state.
   */
  getState() {
    return this.currentState;
  }

  /**
   * Returns the current context of the machine.
   * @returns {Object} The context payload.
   */
  getContext() {
    return this.context;
  }

  /**
   * Returns the history of states visited.
   * @returns {string[]} Ordered list of state names.
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Subscribes a listener function to run whenever the state changes.
   * @param {Function} listener - Callback invoked with (currentState, previousState, context).
   * @returns {Function} Unsubscribe function.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Fires a transition event on the machine.
   * @param {string} event - The transition event name.
   * @param {Object} [payload={}] - Optional payload to update/merge into context.
   * @returns {boolean} True if the transition occurred, false otherwise.
   */
  transition(event, payload = {}) {
    const stateConfig = this.states[this.currentState];
    if (!stateConfig || !stateConfig.on || !stateConfig.on[event]) {
      return false;
    }

    const transitionTarget = stateConfig.on[event];
    let nextState;
    let guard = null;
    let actions = [];

    // Supports transition defined as string target or object configuration
    if (typeof transitionTarget === 'string') {
      nextState = transitionTarget;
    } else {
      nextState = transitionTarget.target;
      guard = transitionTarget.guard || null;
      actions = transitionTarget.actions || [];
    }

    // Merge payload into context temporarily for checking/running
    const updatedContext = { ...this.context, ...payload };

    // Evaluate guards
    if (guard && !guard(updatedContext)) {
      return false;
    }

    const previousState = this.currentState;
    
    // Execute transition actions
    actions.forEach(action => action(updatedContext, { previousState, nextState }));

    // Update state and context
    this.currentState = nextState;
    this.context = updatedContext;
    this.history.push(nextState);

    // Call exit action on previous state if defined
    if (stateConfig.exit) {
      stateConfig.exit(this.context);
    }

    // Call entry action on next state if defined
    const nextStateConfig = this.states[nextState];
    if (nextStateConfig && nextStateConfig.entry) {
      nextStateConfig.entry(this.context);
    }

    // Notify subscribers
    this.listeners.forEach(listener => listener(this.currentState, previousState, this.context));

    return true;
  }
}
