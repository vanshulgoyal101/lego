/**
 * A highly performant Binary Search algorithm.
 * Searches sorted arrays in O(log n) time.
 * Supports custom item types and custom sorting comparator functions.
 */

/**
 * Searches the sorted array for the target element.
 * @param {Array} array - Sorted array elements list.
 * @param {*} target - The value or key to find.
 * @param {Function} [comparator] - Compare function (item, target) => number.
 *   Returns 0 if item matches target, negative if item < target, positive if item > target.
 *   Defaults to numerical or string subtraction.
 * @returns {number} The index of the target if found, or -1 if not found.
 */
export function binarySearch(array, target, comparator = (item, tgt) => item - tgt) {
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const comparison = comparator(array[mid], target);

    if (comparison === 0) {
      return mid; // Target found
    } else if (comparison < 0) {
      low = mid + 1; // Target is in the right half
    } else {
      high = mid - 1; // Target is in the left half
    }
  }

  return -1; // Target not found
}
