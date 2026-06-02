/**
 * Zero-Dependency Virtual DOM & State Engine.
 * Features:
 * 1. Virtual Node Creation: h(type, props, ...children) supporting components and text nodes.
 * 2. Tree Diffing Algorithm: Computes updates (REPLACE, PROPS, TEXT, REMOVE, INSERT).
 * 3. Browser DOM Patching: Resolves and applies patches to real DOM nodes.
 * 4. State & Effect Hooks: useState and useEffect lifecycles inside functional components.
 * 5. Mock DOM Fallback: Built-in document mocking to run headless in Node.js/SSR without JSDOM.
 * 6. Server-Side Rendering (SSR): Translates virtual trees directly to HTML strings.
 */

// --- 1. Virtual Node (VNode) Definitions ---
export const VNODE_TYPES = {
  ELEMENT: 'ELEMENT',
  TEXT: 'TEXT',
  COMPONENT: 'COMPONENT'
};

export class VNode {
  constructor(type, tag, props, children) {
    this.type = type;
    this.tag = tag; // String for elements, Function for components
    this.props = props || {};
    this.children = children || [];
    this.dom = null; // Reference to real DOM node
  }
}

/**
 * HyperScript creation helper.
 */
export function h(tag, props, ...children) {
  const normalizedChildren = [];
  
  const flatten = (arr) => {
    for (const child of arr) {
      if (Array.isArray(child)) {
        flatten(child);
      } else if (child !== null && child !== undefined && child !== false) {
        if (child instanceof VNode) {
          normalizedChildren.push(child);
        } else {
          // Convert primitives to text nodes
          normalizedChildren.push(new VNode(VNODE_TYPES.TEXT, null, {}, [String(child)]));
        }
      }
    }
  };

  flatten(children);

  if (typeof tag === 'function') {
    return new VNode(VNODE_TYPES.COMPONENT, tag, { ...props, children: normalizedChildren }, []);
  }

  return new VNode(VNODE_TYPES.ELEMENT, tag, props, normalizedChildren);
}

// --- 2. Lightweight Mock DOM Environment for Headless Run ---
class MockTextNode {
  constructor(text) {
    this.nodeValue = text;
    this.nodeType = 3;
  }

  toString() {
    return this.nodeValue;
  }
}

class MockElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.nodeType = 1;
    this.props = {};
    this.childNodes = [];
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  removeAttribute(name) {
    delete this.props[name];
  }

  appendChild(child) {
    child.parentNode = this;
    this.childNodes.push(child);
  }

  insertBefore(newChild, refChild) {
    const idx = this.childNodes.indexOf(refChild);
    newChild.parentNode = this;
    if (idx !== -1) {
      this.childNodes.splice(idx, 0, newChild);
    } else {
      this.childNodes.push(newChild);
    }
  }

  removeChild(child) {
    const idx = this.childNodes.indexOf(child);
    if (idx !== -1) {
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
    }
  }

  replaceChild(newChild, oldChild) {
    const idx = this.childNodes.indexOf(oldChild);
    if (idx !== -1) {
      newChild.parentNode = this;
      this.childNodes[idx] = newChild;
      oldChild.parentNode = null;
    }
  }

  get textContent() {
    return this.childNodes.map(c => c.toString()).join('');
  }

  set textContent(val) {
    this.childNodes = [new MockTextNode(val)];
  }

  toString() {
    const attrs = Object.entries(this.props)
      .map(([k, v]) => typeof v !== 'function' ? ` ${k}="${v}"` : '')
      .join('');
    
    const childrenStr = this.childNodes.map(c => c.toString()).join('');
    const selfClosing = ['IMG', 'BR', 'INPUT', 'HR', 'META', 'LINK'].includes(this.tagName);
    
    if (selfClosing) {
      return `<${this.tagName.toLowerCase()}${attrs} />`;
    }
    return `<${this.tagName.toLowerCase()}${attrs}>${childrenStr}</${this.tagName.toLowerCase()}>`;
  }
}

class MockDocument {
  createElement(tagName) {
    return new MockElement(tagName);
  }

  createTextNode(text) {
    return new MockTextNode(text);
  }
}

// Runtime check to configure document instance context
const doc = (typeof globalThis !== 'undefined' && globalThis.document) 
  ? globalThis.document 
  : new MockDocument();

// --- 3. Virtual DOM Diffing Algorithm ---
export const PATCH_TYPES = {
  REPLACE: 'REPLACE',
  PROPS: 'PROPS',
  TEXT: 'TEXT',
  CHILDREN: 'CHILDREN'
};

export function diff(oldVnode, newVnode) {
  // If either node is missing, return replacement patch details
  if (!oldVnode) {
    return { type: PATCH_TYPES.REPLACE, newVnode };
  }
  if (!newVnode) {
    return { type: PATCH_TYPES.REPLACE, newVnode: null };
  }

  // If node type or tags change, replace completely
  if (oldVnode.type !== newVnode.type || oldVnode.tag !== newVnode.tag) {
    return { type: PATCH_TYPES.REPLACE, newVnode };
  }

  // Handle TEXT nodes update
  if (oldVnode.type === VNODE_TYPES.TEXT) {
    if (oldVnode.children[0] !== newVnode.children[0]) {
      return { type: PATCH_TYPES.TEXT, text: newVnode.children[0] };
    }
    return null;
  }

  // Handle ELEMENT / COMPONENT nodes updates
  const propsPatches = diffProps(oldVnode.props, newVnode.props);
  const childrenPatches = diffChildren(oldVnode.children, newVnode.children);

  const patches = {};
  let hasPatches = false;

  if (propsPatches) {
    patches.props = propsPatches;
    hasPatches = true;
  }
  if (childrenPatches.length > 0) {
    patches.children = childrenPatches;
    hasPatches = true;
  }

  return hasPatches ? { type: PATCH_TYPES.PROPS, patches } : null;
}

function diffProps(oldProps, newProps) {
  const patches = [];
  const oldKeys = Object.keys(oldProps);
  const newKeys = Object.keys(newProps);

  // Identify modified or new properties
  for (const k of newKeys) {
    if (oldProps[k] !== newProps[k]) {
      patches.push({ type: 'SET', key: k, value: newProps[k] });
    }
  }

  // Identify deleted properties
  for (const k of oldKeys) {
    if (!(k in newProps)) {
      patches.push({ type: 'REMOVE', key: k });
    }
  }

  return patches.length > 0 ? patches : null;
}

function diffChildren(oldChildren, newChildren) {
  const patches = [];
  const maxLen = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    const oldCh = oldChildren[i];
    const newCh = newChildren[i];

    if (!oldCh && newCh) {
      patches.push({ type: 'INSERT', index: i, newVnode: newCh });
    } else if (oldCh && !newCh) {
      patches.push({ type: 'REMOVE', index: i });
    } else {
      const childPatch = diff(oldCh, newCh);
      if (childPatch) {
        patches.push({ type: 'UPDATE', index: i, patch: childPatch });
      }
    }
  }

  return patches;
}

// --- 4. DOM Patching Engine ---
export function createDomNode(vnode) {
  if (vnode.type === VNODE_TYPES.TEXT) {
    const el = doc.createTextNode(vnode.children[0]);
    vnode.dom = el;
    return el;
  }

  if (vnode.type === VNODE_TYPES.COMPONENT) {
    // Resolve component to child VNode instances
    const componentVNode = resolveComponent(vnode);
    const el = createDomNode(componentVNode);
    vnode.dom = el;
    vnode.componentVNode = componentVNode; // Save reference for diffing
    return el;
  }

  // Element Node creation
  const el = doc.createElement(vnode.tag);
  vnode.dom = el;

  // Apply properties
  for (const [k, v] of Object.entries(vnode.props)) {
    applyProp(el, k, v);
  }

  // Recursively append children elements
  for (const child of vnode.children) {
    el.appendChild(createDomNode(child));
  }

  return el;
}

function applyProp(el, key, value) {
  if (key.startsWith('on') && typeof value === 'function') {
    const eventName = key.slice(2).toLowerCase();
    el[eventName + '_handler'] = value; // Mock handler cache
    if (el.addEventListener) {
      el.addEventListener(eventName, value);
    }
  } else if (key === 'style' && typeof value === 'object') {
    const styleStr = Object.entries(value)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
      .join(';');
    el.setAttribute('style', styleStr);
  } else {
    el.setAttribute(key, value);
  }
}

function removeProp(el, key) {
  if (key.startsWith('on')) {
    const eventName = key.slice(2).toLowerCase();
    if (el.removeEventListener && el[eventName + '_handler']) {
      el.removeEventListener(eventName, el[eventName + '_handler']);
    }
    delete el[eventName + '_handler'];
  } else {
    el.removeAttribute(key);
  }
}

export function patch(dom, patchObj, vnodeRef = null) {
  if (!patchObj) return dom;

  if (patchObj.type === PATCH_TYPES.REPLACE) {
    if (!patchObj.newVnode) {
      if (dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
      return null;
    }
    const newDom = createDomNode(patchObj.newVnode);
    if (dom.parentNode) {
      dom.parentNode.replaceChild(newDom, dom);
    }
    return newDom;
  }

  if (patchObj.type === PATCH_TYPES.TEXT) {
    dom.nodeValue = patchObj.text;
    return dom;
  }

  if (patchObj.type === PATCH_TYPES.PROPS) {
    const { props, children } = patchObj.patches;

    // Apply attributes changes
    if (props) {
      for (const p of props) {
        if (p.type === 'SET') {
          applyProp(dom, p.key, p.value);
        } else if (p.type === 'REMOVE') {
          removeProp(dom, p.key);
        }
      }
    }

    // Apply children adjustments
    if (children) {
      const childNodes = Array.from(dom.childNodes);
      let offset = 0; // Adjust offsets as index elements get deleted or inserted

      for (const c of children) {
        if (c.type === 'INSERT') {
          const newDom = createDomNode(c.newVnode);
          const refNode = childNodes[c.index + offset];
          if (refNode) {
            dom.insertBefore(newDom, refNode);
          } else {
            dom.appendChild(newDom);
          }
        } else if (c.type === 'REMOVE') {
          const targetNode = childNodes[c.index + offset];
          if (targetNode) {
            dom.removeChild(targetNode);
            offset--;
          }
        } else if (c.type === 'UPDATE') {
          const targetNode = childNodes[c.index + offset];
          if (targetNode) {
            const oldVnodeChild = vnodeRef ? vnodeRef.children[c.index] : null;
            patch(targetNode, c.patch, oldVnodeChild);
          }
        }
      }
    }
  }

  return dom;
}

// --- 5. Component Functional Hooks & Rendering Contexts ---
let currentHookContext = null;
let currentHookIndex = 0;

class ComponentContext {
  constructor(vnode) {
    this.vnode = vnode;
    this.state = [];
    this.effects = [];
    this.cleanup = [];
  }

  render() {
    currentHookContext = this;
    currentHookIndex = 0;
    const resolved = this.vnode.tag(this.vnode.props);
    currentHookContext = null;
    return resolved;
  }
}

const componentContexts = new Map(); // vnode -> ComponentContext

function resolveComponent(vnode) {
  let context = componentContexts.get(vnode);
  if (!context) {
    context = new ComponentContext(vnode);
    componentContexts.set(vnode, context);
  }
  const childVNode = context.render();
  
  // Trigger effects after render completes
  setTimeout(() => triggerEffects(context), 0);
  
  return childVNode;
}

function triggerEffects(context) {
  for (let i = 0; i < context.effects.length; i++) {
    const eff = context.effects[i];
    if (eff.hasChanged) {
      if (context.cleanup[i]) {
        try { context.cleanup[i](); } catch (err) { console.error('Effect cleanup error:', err); }
      }
      const cleanupFn = eff.callback();
      context.cleanup[i] = typeof cleanupFn === 'function' ? cleanupFn : null;
      eff.hasChanged = false;
    }
  }
}

/**
 * State preservation hook.
 */
export function useState(initialVal) {
  if (!currentHookContext) {
    throw new Error('HooksError: useState can only be called inside functional components.');
  }

  const ctx = currentHookContext;
  const idx = currentHookIndex++;

  if (ctx.state[idx] === undefined) {
    ctx.state[idx] = initialVal;
  }

  const setState = (newVal) => {
    const val = typeof newVal === 'function' ? newVal(ctx.state[idx]) : newVal;
    if (ctx.state[idx] !== val) {
      ctx.state[idx] = val;
      // Trigger component tree re-render update schedule
      scheduleUpdate(ctx);
    }
  };

  return [ctx.state[idx], setState];
}

/**
 * Side-effect scheduler hook.
 */
export function useEffect(callback, deps) {
  if (!currentHookContext) {
    throw new Error('HooksError: useEffect can only be called inside functional components.');
  }

  const ctx = currentHookContext;
  const idx = currentHookIndex++;

  const oldEff = ctx.effects[idx];
  let hasChanged = true;

  if (oldEff && deps) {
    hasChanged = !deps.every((dep, i) => dep === oldEff.deps[i]);
  }

  ctx.effects[idx] = { callback, deps, hasChanged };
}

function scheduleUpdate(ctx) {
  const oldChild = ctx.vnode.componentVNode;
  const newChild = ctx.render();
  ctx.vnode.componentVNode = newChild;

  const patchObj = diff(oldChild, newChild);
  if (patchObj && ctx.vnode.dom) {
    const updatedDom = patch(ctx.vnode.dom, patchObj, oldChild);
    ctx.vnode.dom = updatedDom;
  }

  // Trigger effects
  setTimeout(() => triggerEffects(ctx), 0);
}

// --- 6. Server-Side Rendering (SSR) Generator ---
export function renderToString(vnode) {
  if (vnode === null || vnode === undefined) {
    return '';
  }

  if (vnode.type === VNODE_TYPES.TEXT) {
    return escapeHtml(vnode.children[0]);
  }

  if (vnode.type === VNODE_TYPES.COMPONENT) {
    // SSR resolves component renders without state hook persistence
    const context = new ComponentContext(vnode);
    currentHookContext = context;
    currentHookIndex = 0;
    const resolved = vnode.tag(vnode.props);
    currentHookContext = null;
    return renderToString(resolved);
  }

  const tag = vnode.tag.toLowerCase();
  
  // Format attributes
  const attrs = Object.entries(vnode.props)
    .filter(([k]) => k !== 'children')
    .map(([k, v]) => {
      if (k === 'style' && typeof v === 'object') {
        const styleStr = Object.entries(v)
          .map(([sk, sv]) => `${sk.replace(/([A-Z])/g, '-$1').toLowerCase()}:${sv}`)
          .join(';');
        return ` style="${styleStr}"`;
      }
      if (k.startsWith('on')) return ''; // Strip event handlers in static markup
      return ` ${k}="${escapeHtml(String(v))}"`;
    })
    .join('');

  const selfClosing = ['img', 'br', 'input', 'hr', 'meta', 'link'].includes(tag);
  if (selfClosing) {
    return `<${tag}${attrs} />`;
  }

  const childrenHtml = vnode.children.map(c => renderToString(c)).join('');
  return `<${tag}${attrs}>${childrenHtml}</${tag}>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
