import { describe, it, expect } from '../../../test/test-harness.js';
import { Rule, DecisionTreeAgent, buildRule } from './index.js';

describe('Rule', () => {
  it('creates a rule with all fields', () => {
    const rule = new Rule({
      name: 'test', condition: () => true, action: async () => 'ok', priority: 5, description: 'desc',
    });
    expect(rule.name).toBe('test');
    expect(rule.priority).toBe(5);
    expect(rule.description).toBe('desc');
  });

  it('throws when name is missing', () => {
    let threw = false;
    try { new Rule({ name: '', condition: () => true, action: async () => {} }); } catch { threw = true; }
    expect(threw).toBe(true);
  });

  it('throws when condition is not a function', () => {
    let threw = false;
    try { new Rule({ name: 'r', condition: 'bad', action: async () => {} }); } catch { threw = true; }
    expect(threw).toBe(true);
  });
});

describe('buildRule', () => {
  it('creates a rule via factory', () => {
    const r = buildRule('admin', (c) => c.role === 'admin', async () => 'admin-action', 10);
    expect(r.name).toBe('admin');
    expect(r.priority).toBe(10);
    expect(r.condition({ role: 'admin' })).toBe(true);
  });
});

describe('DecisionTreeAgent - evaluate', () => {
  it('matches and executes the highest-priority rule', async () => {
    const agent = new DecisionTreeAgent();
    agent.addRules([
      buildRule('low', () => true, async () => 'low', 1),
      buildRule('high', () => true, async () => 'high', 10),
    ]);
    const { matched, rule, result } = await agent.evaluate({});
    expect(matched).toBe(true);
    expect(rule).toBe('high');
    expect(result).toBe('high');
  });

  it('returns matched:false when no rule matches', async () => {
    const agent = new DecisionTreeAgent();
    agent.addRule(buildRule('never', () => false, async () => 'x'));
    const { matched, rule } = await agent.evaluate({});
    expect(matched).toBe(false);
    expect(rule).toBe(null);
  });

  it('calls onMatch callback on match', async () => {
    let fired = null;
    const agent = new DecisionTreeAgent({ onMatch: ({ rule }) => { fired = rule; } });
    agent.addRule(buildRule('r1', () => true, async () => 'ok'));
    await agent.evaluate({});
    expect(fired).toBe('r1');
  });

  it('calls onNoMatch callback when nothing matches', async () => {
    let noMatch = false;
    const agent = new DecisionTreeAgent({ onNoMatch: () => { noMatch = true; } });
    agent.addRule(buildRule('r', () => false, async () => 'x'));
    await agent.evaluate({});
    expect(noMatch).toBe(true);
  });
});

describe('DecisionTreeAgent - evaluateAll', () => {
  it('runs all matching rules in priority order', async () => {
    const agent = new DecisionTreeAgent();
    agent.addRules([
      buildRule('a', () => true, async () => 'result-a', 5),
      buildRule('b', () => true, async () => 'result-b', 10),
      buildRule('c', () => false, async () => 'result-c', 20),
    ]);
    const results = await agent.evaluateAll({});
    expect(results.length).toBe(2);
    expect(results[0].rule).toBe('b'); // highest priority first
    expect(results[1].rule).toBe('a');
  });
});

describe('DecisionTreeAgent - rule management', () => {
  it('removeRule returns true on success', () => {
    const agent = new DecisionTreeAgent();
    agent.addRule(buildRule('x', () => true, async () => 'x'));
    expect(agent.removeRule('x')).toBe(true);
    expect(agent.removeRule('x')).toBe(false); // already removed
  });

  it('throws on duplicate rule name', () => {
    const agent = new DecisionTreeAgent();
    agent.addRule(buildRule('dupe', () => true, async () => 'x'));
    let threw = false;
    try { agent.addRule(buildRule('dupe', () => true, async () => 'y')); } catch { threw = true; }
    expect(threw).toBe(true);
  });

  it('getRules returns sorted by priority desc', () => {
    const agent = new DecisionTreeAgent();
    agent.addRule(buildRule('low', () => true, async () => 'x', 1));
    agent.addRule(buildRule('high', () => true, async () => 'y', 99));
    const rules = agent.getRules();
    expect(rules[0].name).toBe('high');
    expect(rules[1].name).toBe('low');
  });
});
