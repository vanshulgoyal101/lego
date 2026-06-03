import { describe, it, expect } from '../../../test/test-harness.js';
import { ReActLoop, defaultParseResponse, formatToolList } from './index.js';

describe('defaultParseResponse', () => {
  it('parses final answer', () => {
    const result = defaultParseResponse('Final Answer: Paris');
    expect(result.type).toBe('final');
    expect(result.answer).toBe('Paris');
  });

  it('parses thought + action', () => {
    const text = 'Thought: I should search\nAction: search\nAction Input: {"query": "Paris"}';
    const result = defaultParseResponse(text);
    expect(result.type).toBe('action');
    expect(result.action).toBe('search');
    expect(result.actionInput.query).toBe('Paris');
    expect(result.thought).toBe('I should search');
  });

  it('parses action input as string when not valid JSON', () => {
    const text = 'Action: lookup\nAction Input: some plain text';
    const result = defaultParseResponse(text);
    expect(result.actionInput).toBe('some plain text');
  });

  it('treats text with only thought as thought type', () => {
    const result = defaultParseResponse('Thought: Just thinking...');
    expect(result.type).toBe('thought');
    expect(result.thought).toBe('Just thinking...');
  });
});

describe('formatToolList', () => {
  it('formats tools as numbered list', () => {
    const tools = [{ name: 'search', description: 'Search the web' }];
    const output = formatToolList(tools);
    expect(output.includes('search')).toBe(true);
    expect(output.includes('Search the web')).toBe(true);
    expect(output.startsWith('Available tools:')).toBe(true);
  });

  it('handles empty tools list', () => {
    expect(formatToolList([]).includes('none')).toBe(true);
  });
});

describe('ReActLoop', () => {
  it('returns final answer immediately from first LLM call', async () => {
    const loop = new ReActLoop({ maxIterations: 5 });
    const callLLM = async () => 'Final Answer: 42';
    const { answer, iterations, steps } = await loop.run(defaultParseResponse, callLLM);
    expect(answer).toBe('42');
    expect(iterations).toBe(1);
    expect(steps[0].type).toBe('final');
  });

  it('executes one tool call then returns final answer', async () => {
    const loop = new ReActLoop({ maxIterations: 5 });
    loop.addTool('double', 'Doubles a number', async ({ n }) => String(n * 2));

    let callCount = 0;
    const callLLM = async () => {
      callCount++;
      if (callCount === 1) {
        return 'Thought: I need to double it\nAction: double\nAction Input: {"n": 21}';
      }
      return 'Final Answer: 42';
    };

    const { answer, iterations, steps } = await loop.run(defaultParseResponse, callLLM);
    expect(answer).toBe('42');
    expect(iterations).toBe(2);
    expect(steps[0].observation).toBe('42');
  });

  it('stops at maxIterations and returns null answer', async () => {
    const loop = new ReActLoop({ maxIterations: 2 });
    const callLLM = async () => 'Thought: still thinking...';
    const { answer, iterations } = await loop.run(defaultParseResponse, callLLM);
    expect(answer).toBe(null);
    expect(iterations).toBe(2);
  });

  it('handles unknown tool gracefully', async () => {
    const loop = new ReActLoop({ maxIterations: 3 });
    let calls = 0;
    const callLLM = async () => {
      calls++;
      if (calls === 1) return 'Action: nonexistent\nAction Input: {}';
      return 'Final Answer: done';
    };
    const { answer, steps } = await loop.run(defaultParseResponse, callLLM);
    expect(answer).toBe('done');
    expect(steps[0].observation.includes('not registered')).toBe(true);
  });

  it('getTools returns registered tool metadata', () => {
    const loop = new ReActLoop();
    loop.addTool('calc', 'Calculator', async () => '0');
    const tools = loop.getTools();
    expect(tools[0].name).toBe('calc');
    expect(tools[0].description).toBe('Calculator');
  });
});
