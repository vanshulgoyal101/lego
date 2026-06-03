import { describe, it, expect } from '../../../test/test-harness.js';
import { MemoryBuffer, defaultTokenizer } from './index.js';

// ─── defaultTokenizer ────────────────────────────────────────────────────────

await describe('agent/memory-buffer – defaultTokenizer', async () => {
  await it('should estimate tokens as ceil(length / 4)', async () => {
    expect(defaultTokenizer('hello')).toBe(2);       // ceil(5/4) = 2
    expect(defaultTokenizer('hi')).toBe(1);           // ceil(2/4) = 1
    expect(defaultTokenizer('abcd')).toBe(1);         // ceil(4/4) = 1
    expect(defaultTokenizer('abcde')).toBe(2);        // ceil(5/4) = 2
  });

  await it('should return 0 for empty or falsy input', async () => {
    expect(defaultTokenizer('')).toBe(0);
    expect(defaultTokenizer(null)).toBe(0);
    expect(defaultTokenizer(undefined)).toBe(0);
  });
});

// ─── MemoryBuffer – constructor ──────────────────────────────────────────────

await describe('agent/memory-buffer – constructor', async () => {
  await it('should create a buffer with default options', async () => {
    const mem = new MemoryBuffer();
    expect(mem.maxTokens).toBe(4000);
    expect(mem.getMessages().length).toBe(0);
  });

  await it('should accept custom maxTokens', async () => {
    const mem = new MemoryBuffer({ maxTokens: 500 });
    expect(mem.maxTokens).toBe(500);
  });

  await it('should accept a custom tokenizer', async () => {
    const tokenizer = (text) => text.split(' ').length;
    const mem = new MemoryBuffer({ tokenizer });
    mem.add('user', 'hello world');
    expect(mem.getTotalTokens()).toBe(2);
  });

  await it('should throw on invalid maxTokens', async () => {
    let threw = false;
    try { new MemoryBuffer({ maxTokens: -1 }); } catch { threw = true; }
    expect(threw).toBe(true);
  });

  await it('should throw on non-function tokenizer', async () => {
    let threw = false;
    try { new MemoryBuffer({ tokenizer: 'notAFunction' }); } catch { threw = true; }
    expect(threw).toBe(true);
  });
});

// ─── MemoryBuffer – add ──────────────────────────────────────────────────────

await describe('agent/memory-buffer – add', async () => {
  await it('should add a message and return it', async () => {
    const mem = new MemoryBuffer();
    const msg = mem.add('user', 'Hello!');
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('Hello!');
    expect(typeof msg.tokens).toBe('number');
    expect(msg.tokens).toBe(defaultTokenizer('Hello!'));
    expect(typeof msg.timestamp).toBe('string');
  });

  await it('should accumulate multiple messages', async () => {
    const mem = new MemoryBuffer();
    mem.add('user', 'Hello');
    mem.add('assistant', 'Hi there!');
    expect(mem.getMessages().length).toBe(2);
  });

  await it('should throw on invalid role', async () => {
    const mem = new MemoryBuffer();
    let threw = false;
    try { mem.add('', 'content'); } catch { threw = true; }
    expect(threw).toBe(true);
  });

  await it('should throw on non-string content', async () => {
    const mem = new MemoryBuffer();
    let threw = false;
    try { mem.add('user', 42); } catch { threw = true; }
    expect(threw).toBe(true);
  });

  await it('should evict oldest messages when token limit is exceeded (sliding window)', async () => {
    // Each word-token message uses a deterministic tokenizer
    const mem = new MemoryBuffer({ maxTokens: 10, tokenizer: (t) => t.length });

    // Add messages that together exceed 10 chars
    mem.add('user', 'aaaaa');      // 5 tokens — total: 5
    mem.add('user', 'bbbbb');      // 5 tokens — total: 10
    expect(mem.getMessages().length).toBe(2);

    // This message (6 tokens) pushes it over; oldest should be evicted
    mem.add('user', 'cccccc');     // 6 tokens — needs to evict first msg (5) → 5+6=11>10, evict → 6+6=12>10, evict → 6
    // After eviction: only 'cccccc' should remain (bbbbb=5+cccccc=6=11>10 so bbbbb evicted too)
    const msgs = mem.getMessages();
    expect(msgs.every((m) => m.content === 'bbbbb' || m.content === 'cccccc')).toBe(true);
  });

  await it('should allow a single message that exactly fills the budget', async () => {
    const mem = new MemoryBuffer({ maxTokens: 4, tokenizer: (t) => t.length });
    mem.add('user', 'abcd'); // exactly 4
    expect(mem.getMessages().length).toBe(1);
    expect(mem.getTotalTokens()).toBe(4);
  });
});

// ─── MemoryBuffer – getMessages ──────────────────────────────────────────────

await describe('agent/memory-buffer – getMessages', async () => {
  await it('should return a copy of the messages array', async () => {
    const mem = new MemoryBuffer();
    mem.add('user', 'test');
    const msgs = mem.getMessages();
    msgs.push({ role: 'fake', content: 'injected', tokens: 99, timestamp: '' });
    expect(mem.getMessages().length).toBe(1); // internal state unchanged
  });

  await it('should preserve message order (oldest first)', async () => {
    const mem = new MemoryBuffer();
    mem.add('user', 'first');
    mem.add('assistant', 'second');
    mem.add('user', 'third');
    const msgs = mem.getMessages();
    expect(msgs[0].content).toBe('first');
    expect(msgs[2].content).toBe('third');
  });
});

// ─── MemoryBuffer – getTotalTokens ───────────────────────────────────────────

await describe('agent/memory-buffer – getTotalTokens', async () => {
  await it('should return 0 on empty buffer', async () => {
    const mem = new MemoryBuffer();
    expect(mem.getTotalTokens()).toBe(0);
  });

  await it('should sum all message token counts', async () => {
    const mem = new MemoryBuffer({ tokenizer: (t) => t.length });
    mem.add('user', 'abc');       // 3
    mem.add('assistant', 'de');   // 2
    expect(mem.getTotalTokens()).toBe(5);
  });
});

// ─── MemoryBuffer – clear ────────────────────────────────────────────────────

await describe('agent/memory-buffer – clear', async () => {
  await it('should remove all messages', async () => {
    const mem = new MemoryBuffer();
    mem.add('user', 'Hello');
    mem.add('assistant', 'Hi');
    mem.clear();
    expect(mem.getMessages().length).toBe(0);
    expect(mem.getTotalTokens()).toBe(0);
  });
});

// ─── MemoryBuffer – summarize ────────────────────────────────────────────────

await describe('agent/memory-buffer – summarize', async () => {
  await it('should replace all messages with a single system message', async () => {
    const mem = new MemoryBuffer();
    mem.add('user', 'Hello');
    mem.add('assistant', 'Hi there!');
    mem.summarize('User greeted the assistant.');
    const msgs = mem.getMessages();
    expect(msgs.length).toBe(1);
    expect(msgs[0].role).toBe('system');
    expect(msgs[0].content).toBe('User greeted the assistant.');
  });

  await it('should correctly count tokens after summarization', async () => {
    const mem = new MemoryBuffer({ tokenizer: (t) => t.length });
    mem.add('user', 'longmessage');
    mem.summarize('sum');
    expect(mem.getTotalTokens()).toBe(3); // 'sum'.length === 3
  });

  await it('should throw if summaryContent is not a string', async () => {
    const mem = new MemoryBuffer();
    let threw = false;
    try { mem.summarize(123); } catch { threw = true; }
    expect(threw).toBe(true);
  });
});

// ─── MemoryBuffer – needsSummarization ───────────────────────────────────────

await describe('agent/memory-buffer – needsSummarization', async () => {
  await it('should return false when usage is below threshold', async () => {
    const mem = new MemoryBuffer({ maxTokens: 100, tokenizer: (t) => t.length });
    mem.add('user', 'hello'); // 5 tokens = 5% of 100
    expect(mem.needsSummarization(0.9)).toBe(false);
  });

  await it('should return true when usage exceeds threshold', async () => {
    const mem = new MemoryBuffer({ maxTokens: 10, tokenizer: (t) => t.length });
    mem.add('user', 'abcdefghij'); // exactly 10 tokens = 100% of 10
    // 10 > 10 * 0.9 = 9 → true
    expect(mem.needsSummarization(0.9)).toBe(true);
  });

  await it('should use 0.9 as default threshold', async () => {
    const mem = new MemoryBuffer({ maxTokens: 10, tokenizer: (t) => t.length });
    mem.add('user', 'abcdefghij'); // 10 tokens > 10*0.9=9
    expect(mem.needsSummarization()).toBe(true);
  });

  await it('should throw on invalid threshold', async () => {
    const mem = new MemoryBuffer();
    let threw = false;
    try { mem.needsSummarization(0); } catch { threw = true; }
    expect(threw).toBe(true);

    let threw2 = false;
    try { mem.needsSummarization(1.5); } catch { threw2 = true; }
    expect(threw2).toBe(true);
  });
});

// ─── MemoryBuffer – toJSON / fromJSON ────────────────────────────────────────

await describe('agent/memory-buffer – toJSON / fromJSON', async () => {
  await it('should serialize and deserialize correctly', async () => {
    const mem = new MemoryBuffer({ maxTokens: 500 });
    mem.add('user', 'Hello');
    mem.add('assistant', 'World');

    const json = mem.toJSON();
    expect(json.maxTokens).toBe(500);
    expect(json.messages.length).toBe(2);

    const restored = MemoryBuffer.fromJSON(json);
    expect(restored.maxTokens).toBe(500);
    const msgs = restored.getMessages();
    expect(msgs.length).toBe(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toBe('Hello');
    expect(msgs[1].role).toBe('assistant');
  });

  await it('should preserve token counts and timestamps after deserialization', async () => {
    const mem = new MemoryBuffer({ tokenizer: (t) => t.length });
    mem.add('user', 'abc'); // 3 tokens

    const restored = MemoryBuffer.fromJSON(mem.toJSON());
    const msgs = restored.getMessages();
    expect(msgs[0].tokens).toBe(3);
    expect(typeof msgs[0].timestamp).toBe('string');
  });

  await it('should accept a custom tokenizer in fromJSON', async () => {
    const mem = new MemoryBuffer({ maxTokens: 100 });
    mem.add('user', 'hello world');
    const wordTokenizer = (t) => t.split(' ').length;
    const restored = MemoryBuffer.fromJSON(mem.toJSON(), { tokenizer: wordTokenizer });
    // The stored tokens come from defaultTokenizer, but the restored buffer uses wordTokenizer for new adds
    restored.add('user', 'one two three');
    expect(restored.getMessages().at(-1).tokens).toBe(3);
  });

  await it('should throw fromJSON if json is null or not an object', async () => {
    let threw = false;
    try { MemoryBuffer.fromJSON(null); } catch { threw = true; }
    expect(threw).toBe(true);
  });

  await it('toJSON should return a snapshot (not live reference)', async () => {
    const mem = new MemoryBuffer();
    mem.add('user', 'test');
    const json = mem.toJSON();
    mem.clear();
    // json snapshot is unaffected
    expect(json.messages.length).toBe(1);
  });
});
