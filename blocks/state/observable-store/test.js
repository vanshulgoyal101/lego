import { describe, it, expect } from '../../../test/test-harness.js';
import { ObservableStore } from './index.js';

await describe('state/observable-store', async () => {

  await it('get returns initial values', () => {
    const store = new ObservableStore({ count: 0, name: 'Alice' });
    expect(store.get('count')).toBe(0);
    expect(store.get('name')).toBe('Alice');
  });

  await it('get returns undefined for unknown keys', () => {
    const store = new ObservableStore();
    expect(store.get('missing')).toBe(undefined);
  });

  await it('set updates the value', () => {
    const store = new ObservableStore({ count: 0 });
    store.set('count', 5);
    expect(store.get('count')).toBe(5);
  });

  await it('set notifies observers when value changes', () => {
    const store = new ObservableStore({ x: 1 });
    const calls = [];
    store.observe('x', (newVal, oldVal) => calls.push({ newVal, oldVal }));
    store.set('x', 2);
    expect(calls.length).toBe(1);
    expect(calls[0].newVal).toBe(2);
    expect(calls[0].oldVal).toBe(1);
  });

  await it('set does NOT notify when value is the same', () => {
    const store = new ObservableStore({ x: 42 });
    let callCount = 0;
    store.observe('x', () => callCount++);
    store.set('x', 42);
    expect(callCount).toBe(0);
  });

  await it('observe returns an unobserve function', () => {
    const store = new ObservableStore({ y: 0 });
    let callCount = 0;
    const unobserve = store.observe('y', () => callCount++);
    store.set('y', 1);
    unobserve();
    store.set('y', 2);
    expect(callCount).toBe(1); // only notified once before unsubscribing
  });

  await it('unobserve stops notifications for the specific handler', () => {
    const store = new ObservableStore({ z: 0 });
    let a = 0, b = 0;
    const handlerA = () => a++;
    const handlerB = () => b++;
    store.observe('z', handlerA);
    store.observe('z', handlerB);
    store.set('z', 1);
    store.unobserve('z', handlerA);
    store.set('z', 2);
    expect(a).toBe(1);
    expect(b).toBe(2);
  });

  await it('transaction batches notifications — only fires once per key', () => {
    const store = new ObservableStore({ a: 0 });
    const calls = [];
    store.observe('a', val => calls.push(val));
    store.transaction(() => {
      store.set('a', 1);
      store.set('a', 2);
      store.set('a', 3);
    });
    // Only one notification with the final value
    expect(calls.length).toBe(1);
    expect(calls[0]).toBe(3);
  });

  await it('transaction rolls back on error', () => {
    const store = new ObservableStore({ a: 0 });
    try {
      store.transaction(() => {
        store.set('a', 99);
        throw new Error('Intentional error');
      });
    } catch (_) {
      // expected
    }
    expect(store.get('a')).toBe(0);
  });

  await it('toJSON serializes the current state', () => {
    const store = new ObservableStore({ x: 1, y: 2 });
    store.set('z', 3);
    expect(store.toJSON()).toEqual({ x: 1, y: 2, z: 3 });
  });

  await it('multiple keys are observed independently', () => {
    const store = new ObservableStore({ a: 0, b: 0 });
    const aCalls = [], bCalls = [];
    store.observe('a', v => aCalls.push(v));
    store.observe('b', v => bCalls.push(v));
    store.set('a', 1);
    store.set('b', 2);
    expect(aCalls).toEqual([1]);
    expect(bCalls).toEqual([2]);
  });
});
