import { describe, it, expect } from '../../../test/test-harness.js';
import { PubSubWildcard } from './index.js';

await describe('utils/pubsub-wildcard', async () => {
  await it('should route events to exact and wildcard subscribers', () => {
    const pubsub = new PubSubWildcard();
    const hits = [];

    pubsub.subscribe('users.login', (topic, data) => {
      hits.push(`exact:${topic}:${data}`);
    });

    pubsub.subscribe('users.*', (topic, data) => {
      hits.push(`single-wildcard:${topic}:${data}`);
    });

    pubsub.subscribe('**.created', (topic, data) => {
      hits.push(`multi-wildcard:${topic}:${data}`);
    });

    // 1. Publish to exact match
    pubsub.publish('users.login', 'alice');
    // Hits should get: 'exact:users.login:alice' and 'single-wildcard:users.login:alice'
    expect(hits.includes('exact:users.login:alice')).toBe(true);
    expect(hits.includes('single-wildcard:users.login:alice')).toBe(true);

    // 2. Publish to nested wildcard matching
    pubsub.publish('orders.us.created', 'order-123');
    expect(hits.includes('multi-wildcard:orders.us.created:order-123')).toBe(true);

    // 3. Unsubscribe
    hits.length = 0;
    const unsub = pubsub.subscribe('test', (topic, data) => {
      hits.push(`test:${data}`);
    });
    pubsub.publish('test', '1');
    expect(hits.length).toBe(1);

    unsub();
    pubsub.publish('test', '2');
    expect(hits.length).toBe(1); // no new hits
  });
});
