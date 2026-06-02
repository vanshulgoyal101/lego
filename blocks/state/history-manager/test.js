import { describe, it, expect } from '../../../test/test-harness.js';
import { HistoryManager } from './index.js';

await describe('state/history-manager', async () => {

  await it('initializes with a single entry', () => {
    const h = new HistoryManager({ page: 'home' }, '/');
    expect(h.entries.length).toBe(1);
    expect(h.current.url).toBe('/');
    expect(h.current.state).toEqual({ page: 'home' });
    expect(h.index).toBe(0);
  });

  await it('push adds a new entry and becomes current', () => {
    const h = new HistoryManager();
    h.push({ page: 'about' }, '/about');
    expect(h.entries.length).toBe(2);
    expect(h.current.url).toBe('/about');
    expect(h.index).toBe(1);
  });

  await it('replace modifies current entry without growing the stack', () => {
    const h = new HistoryManager(null, '/');
    h.replace({ page: 'home-v2' }, '/home');
    expect(h.entries.length).toBe(1);
    expect(h.current.url).toBe('/home');
    expect(h.current.state).toEqual({ page: 'home-v2' });
  });

  await it('back navigates to the previous entry', () => {
    const h = new HistoryManager(null, '/');
    h.push(null, '/a');
    h.push(null, '/b');
    const moved = h.back();
    expect(moved).toBe(true);
    expect(h.current.url).toBe('/a');
  });

  await it('back returns false when at the beginning', () => {
    const h = new HistoryManager();
    expect(h.back()).toBe(false);
  });

  await it('forward navigates to the next entry after going back', () => {
    const h = new HistoryManager(null, '/');
    h.push(null, '/a');
    h.back();
    const moved = h.forward();
    expect(moved).toBe(true);
    expect(h.current.url).toBe('/a');
  });

  await it('forward returns false when at the end', () => {
    const h = new HistoryManager();
    expect(h.forward()).toBe(false);
  });

  await it('go(n) navigates by a relative offset', () => {
    const h = new HistoryManager(null, '/');
    h.push(null, '/a');
    h.push(null, '/b');
    h.push(null, '/c');
    h.go(-2);
    expect(h.current.url).toBe('/a');
    h.go(1);
    expect(h.current.url).toBe('/b');
  });

  await it('go returns false for out-of-range offset', () => {
    const h = new HistoryManager();
    expect(h.go(-5)).toBe(false);
    expect(h.go(5)).toBe(false);
  });

  await it('push discards forward history after navigating back', () => {
    const h = new HistoryManager(null, '/');
    h.push(null, '/a');
    h.push(null, '/b');
    h.back();
    h.push(null, '/c'); // Discard '/b'
    expect(h.entries.length).toBe(3);
    expect(h.current.url).toBe('/c');
    expect(h.forward()).toBe(false);
  });

  await it('listen is called on push with PUSH action', () => {
    const h = new HistoryManager(null, '/');
    const events = [];
    h.listen((action, entry) => events.push({ action, url: entry.url }));
    h.push(null, '/x');
    expect(events.length).toBe(1);
    expect(events[0].action).toBe('PUSH');
    expect(events[0].url).toBe('/x');
  });

  await it('listen is called on replace with REPLACE action', () => {
    const h = new HistoryManager(null, '/');
    const events = [];
    h.listen((action, entry) => events.push({ action, url: entry.url }));
    h.replace(null, '/new');
    expect(events[0].action).toBe('REPLACE');
  });

  await it('listen is called on back/forward with POP action', () => {
    const h = new HistoryManager(null, '/');
    h.push(null, '/a');
    const events = [];
    h.listen((action) => events.push(action));
    h.back();
    expect(events[0]).toBe('POP');
  });

  await it('listen returns an unlisten function', () => {
    const h = new HistoryManager(null, '/');
    let count = 0;
    const unlisten = h.listen(() => count++);
    h.push(null, '/a');
    unlisten();
    h.push(null, '/b');
    expect(count).toBe(1);
  });

  await it('entries returns a copy, not a reference', () => {
    const h = new HistoryManager(null, '/');
    const entries = h.entries;
    h.push(null, '/a');
    expect(entries.length).toBe(1); // original snapshot unchanged
  });
});
