import { describe, it, expect } from '../../../test/test-harness.js';
import { EventBus } from './index.js';

// Always start each suite with a clean slate
EventBus.clear();

await describe('utils/event-bus', async () => {
  await it('should call handler when event is emitted', () => {
    EventBus.clear();
    let received = null;
    EventBus.on('test', data => { received = data; });
    EventBus.emit('test', 42);
    expect(received).toBe(42);
  });

  await it('should call all handlers registered for the same event', () => {
    EventBus.clear();
    const results = [];
    EventBus.on('multi', d => results.push('a' + d));
    EventBus.on('multi', d => results.push('b' + d));
    EventBus.emit('multi', 1);
    expect(results).toEqual(['a1', 'b1']);
  });

  await it('off should remove a specific handler', () => {
    EventBus.clear();
    let count = 0;
    const handler = () => count++;
    EventBus.on('remove', handler);
    EventBus.emit('remove');
    EventBus.off('remove', handler);
    EventBus.emit('remove');
    expect(count).toBe(1);
  });

  await it('once handler should fire only once', () => {
    EventBus.clear();
    let count = 0;
    EventBus.once('single', () => count++);
    EventBus.emit('single');
    EventBus.emit('single');
    EventBus.emit('single');
    expect(count).toBe(1);
  });

  await it('off should remove a once handler before it fires', () => {
    EventBus.clear();
    let count = 0;
    const handler = () => count++;
    EventBus.once('pre-remove', handler);
    EventBus.off('pre-remove', handler);
    EventBus.emit('pre-remove');
    expect(count).toBe(0);
  });

  await it('on should return an unsubscribe function', () => {
    EventBus.clear();
    let count = 0;
    const unsub = EventBus.on('unsub', () => count++);
    EventBus.emit('unsub');
    unsub();
    EventBus.emit('unsub');
    expect(count).toBe(1);
  });

  await it('emit on unknown event should not throw', () => {
    EventBus.clear();
    expect(() => EventBus.emit('unknown-event')).not; // just should not throw
    EventBus.emit('unknown-event'); // should not throw
    expect(true).toBe(true);
  });

  await it('clear without argument removes all handlers', () => {
    EventBus.clear();
    let count = 0;
    EventBus.on('x', () => count++);
    EventBus.on('y', () => count++);
    EventBus.clear();
    EventBus.emit('x');
    EventBus.emit('y');
    expect(count).toBe(0);
  });

  await it('clear with event name removes only that event', () => {
    EventBus.clear();
    let a = 0, b = 0;
    EventBus.on('ev-a', () => a++);
    EventBus.on('ev-b', () => b++);
    EventBus.clear('ev-a');
    EventBus.emit('ev-a');
    EventBus.emit('ev-b');
    expect(a).toBe(0);
    expect(b).toBe(1);
  });

  await it('listenerCount should return the correct count', () => {
    EventBus.clear();
    expect(EventBus.listenerCount('lc')).toBe(0);
    EventBus.on('lc', () => {});
    EventBus.on('lc', () => {});
    expect(EventBus.listenerCount('lc')).toBe(2);
  });

  await it('eventNames should return names of active events', () => {
    EventBus.clear();
    EventBus.on('aa', () => {});
    EventBus.on('bb', () => {});
    const names = EventBus.eventNames();
    expect(names.includes('aa')).toBe(true);
    expect(names.includes('bb')).toBe(true);
  });

  await it('emit should pass multiple arguments to handler', () => {
    EventBus.clear();
    let args = null;
    EventBus.on('args', (...a) => { args = a; });
    EventBus.emit('args', 1, 2, 3);
    expect(args).toEqual([1, 2, 3]);
  });

  await it('should throw when instantiated directly', () => {
    expect(() => new EventBus()).toThrow('singleton');
  });
});
