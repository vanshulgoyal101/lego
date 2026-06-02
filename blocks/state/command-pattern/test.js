import { describe, it, expect } from '../../../test/test-harness.js';
import { CommandHistory } from './index.js';

/** Helper: creates a simple counter command */
function makeCounterCommand(counter, amount = 1) {
  return {
    description: `Add ${amount}`,
    execute() { counter.value += amount; },
    undo()    { counter.value -= amount; },
  };
}

await describe('state/command-pattern', async () => {

  await it('execute runs the command and increments size', () => {
    const history = new CommandHistory();
    const counter = { value: 0 };
    history.execute(makeCounterCommand(counter));
    expect(counter.value).toBe(1);
    expect(history.size).toBe(1);
  });

  await it('canUndo is true after execute, false initially', () => {
    const history = new CommandHistory();
    expect(history.canUndo()).toBe(false);
    history.execute(makeCounterCommand({ value: 0 }));
    expect(history.canUndo()).toBe(true);
  });

  await it('undo reverses the last command', () => {
    const history = new CommandHistory();
    const counter = { value: 0 };
    history.execute(makeCounterCommand(counter));
    history.undo();
    expect(counter.value).toBe(0);
  });

  await it('undo returns null when stack is empty', () => {
    const history = new CommandHistory();
    expect(history.undo()).toBe(null);
  });

  await it('canRedo is true after undo', () => {
    const history = new CommandHistory();
    history.execute(makeCounterCommand({ value: 0 }));
    expect(history.canRedo()).toBe(false);
    history.undo();
    expect(history.canRedo()).toBe(true);
  });

  await it('redo re-executes the last undone command', () => {
    const history = new CommandHistory();
    const counter = { value: 0 };
    history.execute(makeCounterCommand(counter));
    history.undo();
    history.redo();
    expect(counter.value).toBe(1);
  });

  await it('redo returns null when redo stack is empty', () => {
    const history = new CommandHistory();
    expect(history.redo()).toBe(null);
  });

  await it('executing a new command clears the redo stack', () => {
    const history = new CommandHistory();
    const counter = { value: 0 };
    history.execute(makeCounterCommand(counter));
    history.undo();
    history.execute(makeCounterCommand(counter, 5));
    expect(history.canRedo()).toBe(false);
  });

  await it('multiple undo/redo operations work correctly', () => {
    const history = new CommandHistory();
    const counter = { value: 0 };
    history.execute(makeCounterCommand(counter, 1));
    history.execute(makeCounterCommand(counter, 2));
    history.execute(makeCounterCommand(counter, 3));
    expect(counter.value).toBe(6);

    history.undo();
    expect(counter.value).toBe(3);
    history.undo();
    expect(counter.value).toBe(1);
    history.redo();
    expect(counter.value).toBe(3);
  });

  await it('clear removes all history', () => {
    const history = new CommandHistory();
    const counter = { value: 0 };
    history.execute(makeCounterCommand(counter));
    history.clear();
    expect(history.size).toBe(0);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  await it('entries returns descriptions of executed commands', () => {
    const history = new CommandHistory();
    const counter = { value: 0 };
    history.execute(makeCounterCommand(counter, 1));
    history.execute(makeCounterCommand(counter, 2));
    const entries = history.entries;
    expect(entries.length).toBe(2);
    expect(entries[0].description).toBe('Add 1');
    expect(entries[1].description).toBe('Add 2');
  });

  await it('maxSize option limits history stack size', () => {
    const history = new CommandHistory({ maxSize: 2 });
    const counter = { value: 0 };
    history.execute(makeCounterCommand(counter, 1));
    history.execute(makeCounterCommand(counter, 2));
    history.execute(makeCounterCommand(counter, 3));
    expect(history.size).toBe(2);
  });

  await it('execute throws for invalid command objects', () => {
    const history = new CommandHistory();
    expect(() => history.execute({ execute: 'not a function', undo() {} })).toThrow();
    expect(() => history.execute({ execute() {}, undo: null })).toThrow();
  });
});
