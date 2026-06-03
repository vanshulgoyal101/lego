import { describe, it, expect } from '../../../test/test-harness.js';
import { fillTemplate, buildMessages, PromptTemplate } from './index.js';

describe('fillTemplate', () => {
  it('replaces simple placeholders', () => {
    expect(fillTemplate('Hello {{name}}!', { name: 'World' })).toBe('Hello World!');
  });

  it('supports dot-notation for nested values', () => {
    expect(fillTemplate('Hi {{user.name}}', { user: { name: 'Alice' } })).toBe('Hi Alice');
  });

  it('leaves unresolved placeholders intact', () => {
    expect(fillTemplate('{{missing}}', {})).toBe('{{missing}}');
  });

  it('replaces multiple occurrences', () => {
    expect(fillTemplate('{{x}} + {{x}}', { x: '1' })).toBe('1 + 1');
  });
});

describe('buildMessages', () => {
  it('builds system + user messages', () => {
    const msgs = buildMessages({ system: 'You are {{role}}', user: 'Hello', vars: { role: 'a bot' } });
    expect(msgs[0].role).toBe('system');
    expect(msgs[0].content).toBe('You are a bot');
    expect(msgs[1].role).toBe('user');
    expect(msgs[1].content).toBe('Hello');
  });

  it('injects few-shot examples in order', () => {
    const fewShot = [
      { role: 'user', content: 'What is 2+2?' },
      { role: 'assistant', content: '4' },
    ];
    const msgs = buildMessages({ user: 'What is 3+3?', fewShot });
    expect(msgs.length).toBe(3);
    expect(msgs[0].content).toBe('What is 2+2?');
    expect(msgs[1].content).toBe('4');
    expect(msgs[2].content).toBe('What is 3+3?');
  });

  it('omits system message when not provided', () => {
    const msgs = buildMessages({ user: 'Hi' });
    expect(msgs.length).toBe(1);
    expect(msgs[0].role).toBe('user');
  });
});

describe('PromptTemplate', () => {
  const tmpl = new PromptTemplate({
    system: 'You are a {{persona}} assistant.',
    user: 'Answer: {{question}}',
    defaults: { persona: 'helpful' },
  });

  it('renders with default vars', () => {
    const msgs = tmpl.render({ question: 'What is JS?' });
    expect(msgs[0].content).toBe('You are a helpful assistant.');
    expect(msgs[1].content).toBe('Answer: What is JS?');
  });

  it('overrides defaults with runtime vars', () => {
    const msgs = tmpl.render({ persona: 'strict', question: 'Q?' });
    expect(msgs[0].content).toBe('You are a strict assistant.');
  });

  it('withFewShot returns new template with examples prepended before user', () => {
    const extended = tmpl.withFewShot([
      { role: 'user', content: 'sample Q' },
      { role: 'assistant', content: 'sample A' },
    ]);
    const msgs = extended.render({ question: 'real Q' });
    expect(msgs.length).toBe(4); // system + 2 few-shot + user
  });

  it('estimateTokens returns a positive number', () => {
    const tokens = tmpl.estimateTokens({ question: 'test' });
    expect(tokens > 0).toBe(true);
  });
});
