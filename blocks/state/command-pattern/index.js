/**
 * Command pattern implementation with undo/redo history.
 *
 * Commands are plain objects (or classes) that implement:
 *  - execute() – performs the operation
 *  - undo()    – reverses the operation
 *  - description? – optional human-readable label
 *
 * The CommandHistory class maintains separate "done" and "undone" stacks
 * so that undo/redo operations can be composed arbitrarily.
 */

/**
 * Manages a history of executed commands, supporting undo and redo.
 *
 * @example
 * const history = new CommandHistory();
 * history.execute({ execute() { ... }, undo() { ... }, description: 'Add item' });
 * history.undo();
 * history.redo();
 */
export class CommandHistory {
  /**
   * @param {Object} [options]
   * @param {number} [options.maxSize=Infinity] - Maximum number of commands to retain in the done stack.
   */
  constructor(options = {}) {
    /** @type {Object[]} Stack of executed commands (most recent last). */
    this._done = [];
    /** @type {Object[]} Stack of undone commands for redo (most recent last). */
    this._undone = [];
    /** @type {number} */
    this._maxSize = options.maxSize !== undefined ? options.maxSize : Infinity;
  }

  /**
   * Executes a command and pushes it onto the done stack.
   * Clears the redo stack since a new branch of history has started.
   *
   * @param {Object} command        - The command to execute.
   * @param {Function} command.execute - Performs the operation.
   * @param {Function} command.undo    - Reverses the operation.
   * @param {string}  [command.description] - Optional human-readable label.
   * @returns {*} The return value of command.execute(), if any.
   * @throws {TypeError} If command.execute or command.undo are not functions.
   */
  execute(command) {
    if (typeof command.execute !== 'function' || typeof command.undo !== 'function') {
      throw new TypeError('CommandHistory: command must have execute() and undo() functions');
    }

    const result = command.execute();

    this._done.push(command);
    // Branching history: clear redo stack
    this._undone = [];

    // Trim history if maxSize is set
    if (this._done.length > this._maxSize) {
      this._done.shift();
    }

    return result;
  }

  /**
   * Undoes the most recently executed command.
   *
   * @returns {Object | null} The command that was undone, or null if nothing to undo.
   */
  undo() {
    if (this._done.length === 0) return null;
    const command = this._done.pop();
    command.undo();
    this._undone.push(command);
    return command;
  }

  /**
   * Re-executes the most recently undone command.
   *
   * @returns {Object | null} The command that was redone, or null if nothing to redo.
   */
  redo() {
    if (this._undone.length === 0) return null;
    const command = this._undone.pop();
    command.execute();
    this._done.push(command);
    return command;
  }

  /**
   * Returns true if there is at least one command that can be undone.
   * @returns {boolean}
   */
  canUndo() {
    return this._done.length > 0;
  }

  /**
   * Returns true if there is at least one command that can be redone.
   * @returns {boolean}
   */
  canRedo() {
    return this._undone.length > 0;
  }

  /**
   * Clears both the done and undone stacks, resetting history entirely.
   */
  clear() {
    this._done = [];
    this._undone = [];
  }

  /**
   * Returns a snapshot of the current history stack (most recent last).
   * Each entry includes the optional description if present.
   *
   * @returns {Array<{ description: string | undefined }>}
   */
  get entries() {
    return this._done.map(cmd => ({
      description: cmd.description,
      command: cmd,
    }));
  }

  /**
   * The number of commands currently in the done stack.
   * @returns {number}
   */
  get size() {
    return this._done.length;
  }
}
