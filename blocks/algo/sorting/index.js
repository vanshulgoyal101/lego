/**
 * Production-ready sorting utilities.
 * Implements QuickSort (in-place) and MergeSort (stable) algorithms
 * supporting custom sorting comparator functions.
 */

const defaultComparator = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

/**
 * Performs an in-place QuickSort on the array.
 * @param {Array} array - The target array to sort.
 * @param {Function} [comparator] - Comparator function (a, b) => number.
 * @returns {Array} The sorted array.
 */
export function quickSort(array, comparator = defaultComparator) {
  // Use a helper function to keep index variables clean
  _quickSortHelper(array, 0, array.length - 1, comparator);
  return array;
}

function _quickSortHelper(array, left, right, comparator) {
  if (left >= right) return;

  const pivotIndex = _partition(array, left, right, comparator);
  _quickSortHelper(array, left, pivotIndex - 1, comparator);
  _quickSortHelper(array, pivotIndex + 1, right, comparator);
}

function _partition(array, left, right, comparator) {
  const pivot = array[right];
  let i = left - 1;

  for (let j = left; j < right; j++) {
    if (comparator(array[j], pivot) <= 0) {
      i++;
      _swap(array, i, j);
    }
  }

  _swap(array, i + 1, right);
  return i + 1;
}

function _swap(array, i, j) {
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}

/**
 * Performs a stable MergeSort returning a new sorted array.
 * @param {Array} array - Target array to sort.
 * @param {Function} [comparator] - Comparator function.
 * @returns {Array} A new sorted array.
 */
export function mergeSort(array, comparator = defaultComparator) {
  if (array.length <= 1) return [...array];

  const mid = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, mid), comparator);
  const right = mergeSort(array.slice(mid), comparator);

  return _merge(left, right, comparator);
}

function _merge(left, right, comparator) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (comparator(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  // Push remaining elements
  return result.concat(left.slice(i)).concat(right.slice(j));
}
