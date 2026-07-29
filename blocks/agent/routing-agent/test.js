import { describe, it, expect } from '../../../test/test-harness.js';
import { RoutingAgent } from './index.js';

await describe('agent/routing-agent', async () => {
  await it('routes based on keyword matching', async () => {
    const router = new RoutingAgent({ defaultRoute: 'fallback' });
    router.addRoute('billing', { keywords: ['invoice', 'charge', 'payment', 'billing'] });
    router.addRoute('support', { keywords: ['help', 'broken', 'error', 'bug'] });

    const r1 = await router.route('I need help with a bug');
    expect(r1.route).toBe('support');
    expect(r1.method).toBe('keyword');
    expect(r1.confidence).toBe(0.8);

    const r2 = await router.route('Where is my invoice?');
    expect(r2.route).toBe('billing');
    expect(r2.method).toBe('keyword');

    const r3 = await router.route('Hello world');
    expect(r3.route).toBe('fallback');
    expect(r3.method).toBe('default');
  });

  await it('routes based on regular expressions', async () => {
    const router = new RoutingAgent();
    router.addRoute('id-lookup', { regexes: [/\b\d{4}-\d{4}\b/] });
    router.addRoute('email-intent', { regexes: [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/] });

    const r1 = await router.route('lookup case 1234-5678 please');
    expect(r1.route).toBe('id-lookup');
    expect(r1.method).toBe('regex');
    expect(r1.confidence).toBe(0.9);

    const r2 = await router.route('contact test@example.com now');
    expect(r2.route).toBe('email-intent');
    expect(r2.method).toBe('regex');
  });

  await it('routes based on custom matcher function', async () => {
    const router = new RoutingAgent();
    router.addRoute('short-message', {
      matcher: (input) => input.length < 10
    });
    router.addRoute('complex-math', {
      matcher: (input) => input.includes('+') && input.includes('=') ? 0.95 : 0
    });

    const r1 = await router.route('Hi');
    expect(r1.route).toBe('short-message');
    expect(r1.method).toBe('matcher');
    expect(r1.confidence).toBe(1.0);

    const r2 = await router.route('x + y = z');
    expect(r2.route).toBe('complex-math');
    expect(r2.method).toBe('matcher');
    expect(r2.confidence).toBe(0.95);
  });

  await it('routes based on semantic similarity', async () => {
    // Mock embedder mapping semantic strings to simple vectors
    const mockEmbeddings = {
      'refund my order': [1, 0, 0],
      'how to return item': [0.9, 0.1, 0],
      'reset my password': [0, 1, 0],
      'forgot credentials': [0, 0.95, 0.1],
      // Inputs
      'i want a refund please': [0.95, 0.05, 0],
      'i forgot my password': [0.05, 0.99, 0]
    };

    const embedder = async (text) => {
      return mockEmbeddings[text.toLowerCase()] || [0, 0, 0];
    };

    const router = new RoutingAgent({
      embedder,
      similarityThreshold: 0.8
    });

    router.addRoute('sales', { examples: ['refund my order', 'how to return item'] });
    router.addRoute('security', { examples: ['reset my password', 'forgot credentials'] });

    await router.prepareEmbeddings();

    const r1 = await router.route('i want a refund please');
    expect(r1.route).toBe('sales');
    expect(r1.method).toBe('semantic');
    expect(r1.confidence).toBeGreaterThan(0.9);

    const r2 = await router.route('i forgot my password');
    expect(r2.route).toBe('security');
    expect(r2.method).toBe('semantic');
  });
});
