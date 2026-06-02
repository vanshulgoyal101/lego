/**
 * Runs an asynchronous mapper function over an array of items with a concurrency limit,
 * returning the results in the original input order.
 *
 * @param {Array} items - The array of items to map over.
 * @param {Function} fn - The mapper function: (item, index) => Promise<any>.
 * @param {number} concurrency - Maximum number of operations allowed in parallel.
 * @returns {Promise<Array>} The mapped results.
 */
export async function promisePool(items, fn, concurrency) {
  if (!Array.isArray(items)) {
    throw new TypeError('First argument "items" must be an array');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('Second argument "fn" must be a function');
  }
  
  const limit = Math.max(1, Math.floor(Number(concurrency) || 1));
  const results = new Array(items.length);
  let nextIndex = 0;
  let hasError = false;
  let errorInstance = null;

  if (items.length === 0) {
    return [];
  }

  // Define a worker that consumes the next index in line
  async function worker() {
    while (nextIndex < items.length && !hasError) {
      const currentIndex = nextIndex++;
      try {
        const item = items[currentIndex];
        results[currentIndex] = await fn(item, currentIndex);
      } catch (err) {
        hasError = true;
        errorInstance = err;
      }
    }
  }

  // Spawn parallel workers up to the concurrency limit
  const pool = [];
  const workerCount = Math.min(limit, items.length);
  for (let i = 0; i < workerCount; i++) {
    pool.push(worker());
  }

  // Wait for all workers in the pool to complete
  await Promise.all(pool);

  if (hasError) {
    throw errorInstance;
  }

  return results;
}
