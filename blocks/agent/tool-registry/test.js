import { describe, it, expect } from '../../../test/test-harness.js';
import { ToolRegistry, validateArgs } from './index.js';

// ---------------------------------------------------------------------------
// validateArgs unit tests
// ---------------------------------------------------------------------------

await describe('agent/tool-registry – validateArgs', async () => {
  const schema = {
    type: 'object',
    properties: {
      name:  { type: 'string' },
      count: { type: 'integer' },
      ratio: { type: 'number' },
      flag:  { type: 'boolean' },
      items: { type: 'array' },
      meta:  { type: 'object' },
    },
    required: ['name', 'count'],
  };

  await it('passes when all required fields are present and typed correctly', async () => {
    expect(() => validateArgs(schema, { name: 'hello', count: 3 })).not.toThrow();
  });

  await it('throws when a required field is missing', async () => {
    expect(() => validateArgs(schema, { name: 'hello' })).toThrow(TypeError);
  });

  await it('throws with a message that names the missing field', async () => {
    try {
      validateArgs(schema, { count: 1 });
      expect(false).toBe(true); // should not reach here
    } catch (e) {
      expect(e.message).toContain('"name"');
    }
  });

  await it('throws when a field has the wrong type', async () => {
    expect(() => validateArgs(schema, { name: 42, count: 1 })).toThrow(TypeError);
  });

  await it('throws for wrong integer type', async () => {
    expect(() => validateArgs(schema, { name: 'x', count: 'not-a-number' })).toThrow(TypeError);
  });

  await it('accepts float for number type', async () => {
    const s = { type: 'object', properties: { ratio: { type: 'number' } }, required: ['ratio'] };
    expect(() => validateArgs(s, { ratio: 3.14 })).not.toThrow();
  });

  await it('rejects NaN for number type', async () => {
    const s = { type: 'object', properties: { ratio: { type: 'number' } }, required: ['ratio'] };
    expect(() => validateArgs(s, { ratio: NaN })).toThrow(TypeError);
  });

  await it('accepts boolean type', async () => {
    const s = { type: 'object', properties: { flag: { type: 'boolean' } }, required: ['flag'] };
    expect(() => validateArgs(s, { flag: false })).not.toThrow();
  });

  await it('accepts array type', async () => {
    const s = { type: 'object', properties: { items: { type: 'array' } }, required: ['items'] };
    expect(() => validateArgs(s, { items: [1, 2, 3] })).not.toThrow();
  });

  await it('rejects array when object type expected', async () => {
    const s = { type: 'object', properties: { meta: { type: 'object' } }, required: ['meta'] };
    expect(() => validateArgs(s, { meta: [1, 2] })).toThrow(TypeError);
  });

  await it('allows extra properties not in the schema', async () => {
    expect(() => validateArgs(schema, { name: 'x', count: 1, extra: 'ignored' })).not.toThrow();
  });

  await it('works with no required fields', async () => {
    const s = { type: 'object', properties: { x: { type: 'string' } } };
    expect(() => validateArgs(s, {})).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// ToolRegistry tests
// ---------------------------------------------------------------------------

await describe('agent/tool-registry – ToolRegistry', async () => {
  // Shared schema used across tests
  const addSchema = {
    description: 'Add two numbers.',
    parameters: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First operand' },
        b: { type: 'number', description: 'Second operand' },
      },
      required: ['a', 'b'],
    },
  };

  // ── register ──────────────────────────────────────────────────────────────

  await it('registers a tool without throwing', async () => {
    const reg = new ToolRegistry();
    expect(() => reg.register('add', addSchema, ({ a, b }) => a + b)).not.toThrow();
  });

  await it('throws when registering a duplicate name', async () => {
    const reg = new ToolRegistry();
    reg.register('add', addSchema, () => {});
    expect(() => reg.register('add', addSchema, () => {})).toThrow(Error);
  });

  await it('throws when name is empty string', async () => {
    const reg = new ToolRegistry();
    expect(() => reg.register('', addSchema, () => {})).toThrow(TypeError);
  });

  await it('throws when fn is not a function', async () => {
    const reg = new ToolRegistry();
    expect(() => reg.register('add', addSchema, 'not-a-fn')).toThrow(TypeError);
  });

  // ── has ───────────────────────────────────────────────────────────────────

  await it('has() returns true for registered tools', async () => {
    const reg = new ToolRegistry();
    reg.register('add', addSchema, () => {});
    expect(reg.has('add')).toBe(true);
  });

  await it('has() returns false for unknown tools', async () => {
    const reg = new ToolRegistry();
    expect(reg.has('missing')).toBe(false);
  });

  // ── get ───────────────────────────────────────────────────────────────────

  await it('get() returns the tool definition for a known tool', async () => {
    const reg = new ToolRegistry();
    const fn = () => {};
    reg.register('add', addSchema, fn);
    const tool = reg.get('add');
    expect(tool.name).toBe('add');
    expect(tool.fn).toBe(fn);
  });

  await it('get() throws for an unknown tool', async () => {
    const reg = new ToolRegistry();
    expect(() => reg.get('unknown')).toThrow(Error);
  });

  await it('get() error message references the tool name', async () => {
    const reg = new ToolRegistry();
    try {
      reg.get('missing');
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toContain('"missing"');
    }
  });

  // ── list ──────────────────────────────────────────────────────────────────

  await it('list() returns an empty array for an empty registry', async () => {
    const reg = new ToolRegistry();
    expect(reg.list()).toEqual([]);
  });

  await it('list() includes registered tools with name, description, parameters', async () => {
    const reg = new ToolRegistry();
    reg.register('add', addSchema, () => {});
    const [entry] = reg.list();
    expect(entry.name).toBe('add');
    expect(entry.description).toBe('Add two numbers.');
    expect(typeof entry.parameters).toBe('object');
  });

  await it('list() returns one entry per registered tool', async () => {
    const reg = new ToolRegistry();
    reg.register('add',      addSchema,                          () => {});
    reg.register('greet', { description: 'Say hi.', parameters: { type: 'object' } }, () => {});
    expect(reg.list().length).toBe(2);
  });

  // ── call ─ success ────────────────────────────────────────────────────────

  await it('call() invokes the tool and returns its result', async () => {
    const reg = new ToolRegistry();
    reg.register('add', addSchema, ({ a, b }) => a + b);
    const result = await reg.call('add', { a: 3, b: 4 });
    expect(result).toBe(7);
  });

  await it('call() works with async tool functions', async () => {
    const reg = new ToolRegistry();
    reg.register('asyncDouble', {
      description: 'Double a number asynchronously.',
      parameters: {
        type: 'object',
        properties: { n: { type: 'number' } },
        required: ['n'],
      },
    }, async ({ n }) => {
      return new Promise((resolve) => setTimeout(() => resolve(n * 2), 5));
    });
    const result = await reg.call('asyncDouble', { n: 6 });
    expect(result).toBe(12);
  });

  await it('call() passes the full args object to the tool fn', async () => {
    const reg = new ToolRegistry();
    let received;
    reg.register('capture', {
      description: 'Capture args.',
      parameters: { type: 'object', properties: { x: { type: 'string' } }, required: ['x'] },
    }, (args) => { received = args; });
    await reg.call('capture', { x: 'hello' });
    expect(received).toEqual({ x: 'hello' });
  });

  // ── call ─ validation failures ────────────────────────────────────────────

  await it('call() throws TypeError when a required arg is missing', async () => {
    const reg = new ToolRegistry();
    reg.register('add', addSchema, ({ a, b }) => a + b);
    let threw = false;
    try {
      await reg.call('add', { a: 1 }); // missing b
    } catch (e) {
      threw = true;
      expect(e).toBeInstanceOf(TypeError);
    }
    expect(threw).toBe(true);
  });

  await it('call() throws TypeError when an arg has the wrong type', async () => {
    const reg = new ToolRegistry();
    reg.register('add', addSchema, ({ a, b }) => a + b);
    let threw = false;
    try {
      await reg.call('add', { a: 'not-a-number', b: 2 });
    } catch (e) {
      threw = true;
      expect(e).toBeInstanceOf(TypeError);
    }
    expect(threw).toBe(true);
  });

  await it('call() throws Error when the tool name is unknown', async () => {
    const reg = new ToolRegistry();
    let threw = false;
    try {
      await reg.call('ghost', {});
    } catch (e) {
      threw = true;
      expect(e).toBeInstanceOf(Error);
    }
    expect(threw).toBe(true);
  });

  await it('call() uses empty object as default args', async () => {
    const reg = new ToolRegistry();
    reg.register('noop', { description: 'No args.', parameters: { type: 'object' } }, () => 'ok');
    const result = await reg.call('noop');
    expect(result).toBe('ok');
  });
});
