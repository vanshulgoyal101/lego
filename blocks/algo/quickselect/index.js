/**
 * Quickselect selection algorithm.
 * Finds the k-th smallest element (zero-indexed) in an unsorted array.
 * Mutates the input array during partitioning.
 *
 * @param {number[]} arr - Unsorted numeric array
 * @param {number} k - Target index
 * @param {number} [left=0] - Left bounds
 * @param {number} [right=arr.length-1] - Right bounds
 * @returns {number} Value of k-th smallest element
 */
export function quickselect(arr, k, left = 0, right = arr.length - 1) {
  if (k < 0 || k > arr.length - 1) {
    throw new RangeError('Index k is out of bounds');
  }

  if (left === right) {
    return arr[left];
  }

  // Choose a random pivot index to avoid worst-case O(N^2) scenarios
  const pivotIndex = left + Math.floor(Math.random() * (right - left + 1));
  const newPivotIndex = partition(arr, left, right, pivotIndex);

  if (k === newPivotIndex) {
    return arr[k];
  } else if (k < newPivotIndex) {
    return quickselect(arr, k, left, newPivotIndex - 1);
  } else {
    return quickselect(arr, k, newPivotIndex + 1, right);
  }
}

function partition(arr, left, right, pivotIndex) {
  const pivotValue = arr[pivotIndex];
  // Swap pivot to end
  swap(arr, pivotIndex, right);
  let storeIndex = left;

  for (let i = left; i < right; i++) {
    if (arr[i] < pivotValue) {
      swap(arr, i, storeIndex);
      storeIndex++;
    }
  }

  // Move pivot to its final sorted place
  swap(arr, storeIndex, right);
  return storeIndex;
}

function swap(arr, i, j) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}
