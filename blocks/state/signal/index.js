/**
 * Fine-grained reactive signals — a minimal SolidJS-inspired reactivity system.
 *
 * Three core primitives:
 *
 *  - signal(value)   – Creates a reactive atom. Returns [getter, setter].
 *  - computed(fn)    – Creates a derived reactive value that re-evaluates when
 *                      its signal dependencies change.
 *  - effect(fn)      – Runs a side-effect function and automatically re-runs it
 *                      when any signal read inside it changes.
 *
 * Dependency tracking works by registering a global "active observer" during
 * the execution of computed() and effect() functions. Each signal read during
 * that execution adds the active observer to its subscriber set.
 */

/** @type {Function | null} Currently executing observer (effect or computed re-evaluator). */
let activeObserver = null;

/**
 * Creates a reactive signal with a getter and setter.
 *
 * @template T
 * @param {T} initialValue - The initial value of the signal.
 * @returns {[() => T, (value: T | ((prev: T) => T)) => void]}
 *   A tuple of [getter, setter]. The getter tracks dependencies when called
 *   inside a computed or effect. The setter accepts a new value or an updater
 *   function that receives the previous value.
 *
 * @example
 * const [count, setCount] = signal(0);
 * effect(() => console.log('count is', count()));
 * setCount(1); // logs "count is 1"
 */
export function signal(initialValue) {
  let value = initialValue;
  /** @type {Set<Function>} Registered observer functions. */
  const subscribers = new Set();

  /** Read the current value (tracks dependencies). */
  function getter() {
    if (activeObserver) {
      subscribers.add(activeObserver);
    }
    return value;
  }

  /** Write a new value and notify subscribers. */
  function setter(newValue) {
    const nextValue = typeof newValue === 'function' ? newValue(value) : newValue;
    if (nextValue === value) return; // No-op if value unchanged
    value = nextValue;
    // Snapshot subscribers before iterating to handle re-entrant sets
    for (const observer of [...subscribers]) {
      observer();
    }
  }

  return [getter, setter];
}

/**
 * Creates a lazily-evaluated computed value that automatically re-computes
 * when any signal it reads changes.
 *
 * @template T
 * @param {() => T} fn - A pure function that reads one or more signals.
 * @returns {() => T} A getter that returns the latest computed value.
 *
 * @example
 * const [a, setA] = signal(2);
 * const [b, setB] = signal(3);
 * const sum = computed(() => a() + b());
 * sum(); // 5
 * setA(10);
 * sum(); // 13
 */
export function computed(fn) {
  let cachedValue;
  let dirty = true;
  const subscribers = new Set();

  // This is the computed's own observer — called when a dependency changes
  const recompute = () => {
    dirty = true;
    for (const sub of [...subscribers]) {
      sub();
    }
  };

  return function getter() {
    // Track this computed in any outer effect/computed
    if (activeObserver) {
      subscribers.add(activeObserver);
    }

    if (dirty) {
      const prevObserver = activeObserver;
      activeObserver = recompute;
      try {
        cachedValue = fn();
      } finally {
        activeObserver = prevObserver;
      }
      dirty = false;
    }

    return cachedValue;
  };
}

/**
 * Runs a side-effect function and automatically re-runs it whenever any
 * signal (or computed) it reads changes.
 *
 * @param {() => void} fn - The effect function. May read any number of signals.
 * @returns {() => void} A disposal function that stops future re-runs.
 *
 * @example
 * const [name, setName] = signal('Alice');
 * const stop = effect(() => console.log('Hello', name()));
 * setName('Bob'); // logs "Hello Bob"
 * stop();
 * setName('Carol'); // no log — effect disposed
 */
export function effect(fn) {
  let disposed = false;

  const observer = () => {
    if (disposed) return;
    const prevObserver = activeObserver;
    activeObserver = observer;
    try {
      fn();
    } finally {
      activeObserver = prevObserver;
    }
  };

  // Run immediately to collect initial dependencies
  observer();

  return () => {
    disposed = true;
  };
}
