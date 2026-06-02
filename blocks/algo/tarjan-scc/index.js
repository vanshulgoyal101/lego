/**
 * Tarjan's Strongly Connected Components Algorithm
 * Computes the strongly connected components of a directed graph in O(V + E) time.
 *
 * @param {Object} graph - Adjacency list: { node: [adjacentNodes] }
 * @returns {Array<string[]>} Array of strongly connected components (each component is an array of node IDs)
 */
export function tarjanScc(graph) {
  const vertices = Object.keys(graph);
  let index = 0;
  const indices = {};
  const lowlinks = {};
  const onStack = {};
  const stack = [];
  const sccs = [];

  function strongConnect(v) {
    indices[v] = index;
    lowlinks[v] = index;
    index++;
    stack.push(v);
    onStack[v] = true;

    const neighbors = graph[v] || [];
    for (const w of neighbors) {
      if (indices[w] === undefined) {
        strongConnect(w);
        lowlinks[v] = Math.min(lowlinks[v], lowlinks[w]);
      } else if (onStack[w]) {
        lowlinks[v] = Math.min(lowlinks[v], indices[w]);
      }
    }

    if (lowlinks[v] === indices[v]) {
      const component = [];
      let w;
      do {
        w = stack.pop();
        onStack[w] = false;
        component.push(w);
      } while (w !== v);
      sccs.push(component);
    }
  }

  for (const v of vertices) {
    if (indices[v] === undefined) {
      strongConnect(v);
    }
  }

  return sccs;
}
