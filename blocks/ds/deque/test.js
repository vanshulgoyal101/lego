import { describe, it, expect } from '../../../test/test-harness.js';
import { Deque } from './index.js';

await describe('ds/deque', async () => {
  await it('should start empty', () => {
    const dq = new Deque();
    expect(dq.isEmpty()).toBe(true);
    expect(dq.size()).toBe(0);
  });

  await it('should pushBack and popFront in FIFO order', () => {
    const dq = new Deque();
    dq.pushBack(1);
    dq.pushBack(2);
    dq.pushBack(3);
    expect(dq.popFront()).toBe(1);
    expect(dq.popFront()).toBe(2);
    expect(dq.popFront()).toBe(3);
    expect(dq.isEmpty()).toBe(true);
  });

  await it('should pushFront and popFront in LIFO order', () => {
    const dq = new Deque();
    dq.pushFront(1);
    dq.pushFront(2);
    dq.pushFront(3);
    expect(dq.popFront()).toBe(3);
    expect(dq.popFront()).toBe(2);
    expect(dq.popFront()).toBe(1);
  });

  await it('should pushBack and popBack in LIFO order', () => {
    const dq = new Deque();
    dq.pushBack(10);
    dq.pushBack(20);
    expect(dq.popBack()).toBe(20);
    expect(dq.popBack()).toBe(10);
  });

  await it('should peek without removing', () => {
    const dq = new Deque();
    dq.pushBack('a');
    dq.pushBack('b');
    expect(dq.peekFront()).toBe('a');
    expect(dq.peekBack()).toBe('b');
    expect(dq.size()).toBe(2);
  });

  await it('should return undefined when popping from empty deque', () => {
    const dq = new Deque();
    expect(dq.popFront()).toBe(undefined);
    expect(dq.popBack()).toBe(undefined);
    expect(dq.peekFront()).toBe(undefined);
    expect(dq.peekBack()).toBe(undefined);
  });

  await it('should support mixed pushFront and pushBack', () => {
    const dq = new Deque();
    dq.pushBack(2);
    dq.pushFront(1);
    dq.pushBack(3);
    expect(dq.toArray()).toEqual([1, 2, 3]);
  });

  await it('should track size correctly through operations', () => {
    const dq = new Deque();
    dq.pushBack(1);
    dq.pushFront(0);
    expect(dq.size()).toBe(2);
    dq.popBack();
    expect(dq.size()).toBe(1);
    dq.popFront();
    expect(dq.size()).toBe(0);
    expect(dq.isEmpty()).toBe(true);
  });
});
