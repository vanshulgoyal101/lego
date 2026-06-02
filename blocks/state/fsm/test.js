import { describe, it, expect } from '../../../test/test-harness.js';
import {StateMachine} from './index.js';

  await describe('state/fsm', async () => {
    await it('should transition correctly', async () => {
      const fsm = new StateMachine({
        initial: 'off',
        states: {
          off: { on: { TOGGLE: 'on' } },
          on: { on: { TOGGLE: 'off' } }
        }
      });
      expect(fsm.getState()).toBe('off');
      fsm.transition('TOGGLE');
      expect(fsm.getState()).toBe('on');
    });

    await it('should block transitions with guards', async () => {
      const fsm = new StateMachine({
        initial: 'closed',
        context: { isLocked: true },
        states: {
          closed: {
            on: {
              OPEN: {
                target: 'open',
                guard: (ctx) => !ctx.isLocked
              }
            }
          },
          open: {}
        }
      });
      fsm.transition('OPEN');
      expect(fsm.getState()).toBe('closed');
    });
  });
