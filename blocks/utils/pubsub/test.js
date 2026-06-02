import { describe, it, expect } from '../../../test/test-harness.js';
import {PubSub} from './index.js';

  await describe('utils/pubsub', async () => {
    await it('should publish and receive messages', () => {
      const bus = new PubSub();
      const received = [];
      bus.subscribe('test', msg => received.push(msg));
      bus.publish('test', 'hello');
      bus.publish('test', 'world');
      expect(received).toEqual(['hello', 'world']);
    });

    await it('should support wildcard * pattern (single segment)', () => {
      const bus = new PubSub();
      const received = [];
      bus.subscribe('user.*', (msg, topic) => received.push(topic));
      bus.publish('user.created', {});
      bus.publish('user.deleted', {});
      bus.publish('order.created', {}); // Should NOT match
      expect(received.length).toBe(2);
      expect(received.includes('user.created')).toBe(true);
    });

    await it('should support ** wildcard (any depth)', () => {
      const bus = new PubSub();
      const received = [];
      bus.subscribe('app.**', (_, topic) => received.push(topic));
      bus.publish('app.user.created', {});
      bus.publish('app.order.updated', {});
      bus.publish('other.topic', {});
      expect(received.length).toBe(2);
    });

    await it('should unsubscribe correctly', () => {
      const bus = new PubSub();
      const received = [];
      const unsub = bus.subscribe('msg', m => received.push(m));
      bus.publish('msg', 1);
      unsub();
      bus.publish('msg', 2);
      expect(received).toEqual([1]);
    });

    await it('should support once subscriptions', () => {
      const bus = new PubSub();
      const received = [];
      bus.once('event', m => received.push(m));
      bus.publish('event', 'first');
      bus.publish('event', 'second');
      expect(received).toEqual(['first']);
      expect(bus.subscriberCount).toBe(0);
    });

    await it('should replay history to late subscribers', () => {
      const bus = new PubSub({ maxHistory: 5 });
      bus.publish('news', 'Article 1');
      bus.publish('news', 'Article 2');
      const received = [];
      bus.subscribe('news', m => received.push(m), { replay: true });
      expect(received).toEqual(['Article 1', 'Article 2']);
    });
  });
