import { describe, it, expect } from '../../../test/test-harness.js';
import {createStore} from './index.js';

  await describe('state/redux-lite', async () => {
    await it('should manage store actions state, dispatching, and subscriptions', () => {
      function counter(state = { count: 0 }, action) {
        if (action.type === 'INC') {
          return { count: state.count + 1 };
        }
        return state;
      }
      const store = createStore(counter);
      let countFires = 0;
      store.subscribe(() => {
        countFires++;
      });
      store.dispatch({ type: 'INC' });
      expect(store.getState().count).toBe(1);
      expect(countFires).toBe(1);
    });
  });
