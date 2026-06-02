/**
 * Observable — Minimal Reactive Streams
 * A lightweight, zero-dependency Observable implementation.
 * Follows the TC39 Observable proposal semantics.
 *
 * Supports:
 *  - subscribe({ next, error, complete })
 *  - map(fn), filter(fn), take(n), merge(observable)
 *  - Observable.from(iterable), Observable.of(...values)
 */

/**
 * @typedef {Object} Observer
 * @property {(value: *) => void} [next] - Receives emitted values.
 * @property {(err: Error) => void} [error] - Receives errors.
 * @property {() => void} [complete] - Called when the stream ends.
 */

/**
 * @typedef {Object} Subscription
 * @property {() => void} unsubscribe - Cancels the subscription.
 * @property {boolean} closed - Whether the subscription has been cancelled.
 */

/**
 * A minimal reactive Observable implementation.
 *
 * @example
 * const obs = new Observable(subscriber => {
 *   subscriber.next(1);
 *   subscriber.next(2);
 *   subscriber.complete();
 * });
 *
 * obs.map(x => x * 2).subscribe({ next: console.log }); // 2, 4
 */
export class Observable {
  /**
   * @param {(subscriber: Observer & { closed: boolean }) => void | (() => void)} subscriberFn
   *   Function called when subscribe() is invoked. Receives a subscriber object.
   *   May return a teardown/cleanup function.
   */
  constructor(subscriberFn) {
    if (typeof subscriberFn !== 'function') {
      throw new TypeError('Observable constructor requires a subscriber function');
    }
    this._subscriberFn = subscriberFn;
  }

  /**
   * Subscribe to this observable.
   *
   * @param {Observer | ((value: *) => void)} observerOrNext - Observer object or next function.
   * @returns {Subscription}
   */
  subscribe(observerOrNext) {
    let observer;
    if (typeof observerOrNext === 'function') {
      observer = { next: observerOrNext };
    } else {
      observer = observerOrNext || {};
    }

    let closed = false;
    let teardown = null;

    const subscriber = {
      get closed() { return closed; },
      next(value) {
        if (!closed && typeof observer.next === 'function') {
          try { observer.next(value); } catch (err) { subscriber.error(err); }
        }
      },
      error(err) {
        if (!closed) {
          closed = true;
          if (typeof observer.error === 'function') observer.error(err);
          if (typeof teardown === 'function') teardown();
        }
      },
      complete() {
        if (!closed) {
          closed = true;
          if (typeof observer.complete === 'function') observer.complete();
          if (typeof teardown === 'function') teardown();
        }
      },
    };

    try {
      teardown = this._subscriberFn(subscriber);
    } catch (err) {
      subscriber.error(err);
    }

    return {
      get closed() { return closed; },
      unsubscribe() {
        if (!closed) {
          closed = true;
          if (typeof teardown === 'function') teardown();
        }
      },
    };
  }

  /**
   * Transform each emitted value using a mapping function.
   * @param {(value: *) => *} fn - Mapping function.
   * @returns {Observable}
   */
  map(fn) {
    return new Observable(subscriber => {
      const sub = this.subscribe({
        next: value => subscriber.next(fn(value)),
        error: err => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => sub.unsubscribe();
    });
  }

  /**
   * Only emit values for which predicate returns true.
   * @param {(value: *) => boolean} predicate
   * @returns {Observable}
   */
  filter(predicate) {
    return new Observable(subscriber => {
      const sub = this.subscribe({
        next: value => { if (predicate(value)) subscriber.next(value); },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => sub.unsubscribe();
    });
  }

  /**
   * Emit only the first `n` values, then complete.
   * @param {number} n - Number of values to take.
   * @returns {Observable}
   */
  take(n) {
    return new Observable(subscriber => {
      let count = 0;
      const sub = this.subscribe({
        next: value => {
          if (count < n) {
            count++;
            subscriber.next(value);
            if (count >= n) subscriber.complete();
          }
        },
        error: err => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => sub.unsubscribe();
    });
  }

  /**
   * Merge this observable with another, emitting values from both concurrently.
   * @param {Observable} other
   * @returns {Observable}
   */
  merge(other) {
    return new Observable(subscriber => {
      let completedCount = 0;
      const onComplete = () => {
        completedCount++;
        if (completedCount === 2) subscriber.complete();
      };
      const sub1 = this.subscribe({ next: v => subscriber.next(v), error: e => subscriber.error(e), complete: onComplete });
      const sub2 = other.subscribe({ next: v => subscriber.next(v), error: e => subscriber.error(e), complete: onComplete });
      return () => { sub1.unsubscribe(); sub2.unsubscribe(); };
    });
  }

  /**
   * Create an Observable from any iterable (array, Set, generator, etc.).
   * @param {Iterable<*>} iterable
   * @returns {Observable}
   *
   * @example
   * Observable.from([1, 2, 3]).subscribe({ next: console.log }); // 1, 2, 3
   */
  static from(iterable) {
    return new Observable(subscriber => {
      try {
        for (const value of iterable) {
          if (subscriber.closed) return;
          subscriber.next(value);
        }
        subscriber.complete();
      } catch (err) {
        subscriber.error(err);
      }
    });
  }

  /**
   * Create an Observable that emits each argument in order, then completes.
   * @param {...*} values
   * @returns {Observable}
   *
   * @example
   * Observable.of(10, 20, 30).subscribe({ next: console.log }); // 10, 20, 30
   */
  static of(...values) {
    return Observable.from(values);
  }
}
