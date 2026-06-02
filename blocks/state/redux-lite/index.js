/**
 * Creates a lightweight Redux-style store for managing state.
 *
 * @param {Function} reducer - A function (state, action) => state.
 * @param {any} [initialState] - Initial state of the application.
 * @param {Array<Function>} [middlewares=[]] - Redux-style middlewares: store => next => action => any.
 * @returns {Object} Exposes: { getState, dispatch, subscribe }.
 */
export function createStore(reducer, initialState, middlewares = []) {
  if (typeof reducer !== 'function') {
    throw new TypeError('Reducer must be a function');
  }

  let currentState = initialState;
  let listeners = [];
  let isDispatching = false;

  function getState() {
    if (isDispatching) {
      throw new Error('Cannot run store.getState() while reducer is executing');
    }
    return currentState;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    if (isDispatching) {
      throw new Error('Cannot run store.subscribe() while reducer is executing');
    }

    listeners.push(listener);

    // Unsubscribe helper
    return function unsubscribe() {
      if (isDispatching) {
        throw new Error('Cannot run unsubscribe while reducer is executing');
      }
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }

  function rawDispatch(action) {
    if (!action || typeof action.type === 'undefined') {
      throw new Error('Actions must have a defined "type" property');
    }
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions');
    }

    try {
      isDispatching = true;
      currentState = reducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    // Trigger subscriptions
    const currentListeners = [...listeners];
    for (const listener of currentListeners) {
      listener();
    }

    return action;
  }

  // Bind middlewares
  let dispatch = rawDispatch;
  if (middlewares.length > 0) {
    const middlewareAPI = {
      getState: () => getState(),
      dispatch: (action) => dispatch(action)
    };
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = chain.reduceRight((next, middleware) => middleware(next), rawDispatch);
  }

  // Trigger initial state mapping
  dispatch({ type: '@@redux/INIT' });

  return {
    getState,
    dispatch,
    subscribe
  };
}
