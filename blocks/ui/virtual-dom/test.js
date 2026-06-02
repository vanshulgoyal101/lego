import { describe, it, expect } from '../../../test/test-harness.js';
import {h as vh,  createDomNode, diff as vDiff, patch as vPatch,  renderToString, useState as vUseState, useEffect as vUseEffect} from './index.js';

  await describe('ui/virtual-dom', async () => {
    await it('should execute virtual node compilation, SSR, attribute diffing, and component state hooks reconciliation', async () => {
      // 1. Element and Child Node creation & SSR
      const vnode = vh('div', { class: 'container', style: { color: 'red' } }, 
        vh('h1', {}, 'Hello Virtual DOM'),
        vh('p', {}, 'Content paragraph')
      );
      
      const ssrMarkup = renderToString(vnode);
      expect(ssrMarkup).toBe('<div class="container" style="color:red"><h1>Hello Virtual DOM</h1><p>Content paragraph</p></div>');

      // 2. Real DOM Node Generation (via Mock DOM Fallback)
      const dom = createDomNode(vnode);
      expect(dom.tagName).toBe('DIV');
      expect(dom.props.class).toBe('container');
      expect(dom.props.style).toBe('color:red');
      expect(dom.childNodes.length).toBe(2);

      // 3. Diff and Patch Attributes
      const newVnode = vh('div', { class: 'container active', style: { color: 'blue' } }, 
        vh('h1', {}, 'Hello Virtual DOM'),
        vh('p', {}, 'Updated Content')
      );

      const patches = vDiff(vnode, newVnode);
      expect(patches.type).toBe('PROPS');
      
      const patchedDom = vPatch(dom, patches, vnode);
      expect(patchedDom.props.class).toBe('container active');
      expect(patchedDom.props.style).toBe('color:blue');
      expect(patchedDom.childNodes[1].childNodes[0].nodeValue).toBe('Updated Content');

      // 4. Functional Components with State Hook
      let setCounterFn = null;
      function CounterComponent(props) {
        const [count, setCount] = vUseState(0);
        setCounterFn = setCount;
        return vh('div', { id: 'counter-box' }, `Count: ${count}`);
      }

      const compVnode = vh(CounterComponent, {});
      const compDom = createDomNode(compVnode);
      expect(compDom.childNodes[0].nodeValue).toBe('Count: 0');

      // Update state and verify patched Dom content
      setCounterFn(5);
      // Wait for re-render scheduling macro-task
      await new Promise(resolve => setTimeout(resolve, 5));
      expect(compDom.childNodes[0].nodeValue).toBe('Count: 5');
    });
  });
