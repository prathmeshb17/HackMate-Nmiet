/**
 * Explicit QuickSort Algorithm
 * Used for sorting lists of students, compatibility scores, and hackathons.
 *
 * Algorithm Strategy:
 * 1. Choose a pivot element (Lomuto partition scheme using last element as pivot).
 * 2. Partition array into elements smaller than pivot and elements larger than pivot.
 * 3. Recursively sort sub-arrays.
 *
 * Time Complexity:
 * - Best / Average Case: O(N log N)
 * - Worst Case: O(N^2) (e.g. sorted array with poor pivot choice)
 *
 * Space Complexity:
 * - O(log N) auxiliary stack space for recursion.
 */

export function quickSort(arr = [], compareFn = (a, b) => b - a) {
  const list = [...arr];
  const traces = [];

  function partition(low, high) {
    const pivot = list[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      // compareFn returns positive if b should come before a
      if (compareFn(list[j], pivot) <= 0) {
        i++;
        // Swap list[i] and list[j]
        const temp = list[i];
        list[i] = list[j];
        list[j] = temp;
        traces.push({ action: 'swap', indices: [i, j], pivotValue: extractVal(pivot) });
      }
    }

    // Swap list[i + 1] and pivot (list[high])
    const temp = list[i + 1];
    list[i + 1] = list[high];
    list[high] = temp;
    traces.push({ action: 'pivotPlaced', pivotIndex: i + 1, pivotValue: extractVal(list[i + 1]) });

    return i + 1;
  }

  function sort(low, high) {
    if (low < high) {
      const pivotIdx = partition(low, high);
      sort(low, pivotIdx - 1);
      sort(pivotIdx + 1, high);
    }
  }

  function extractVal(item) {
    if (typeof item === 'number') return item;
    if (item && typeof item === 'object') return item.score || item.compositeScore || item.id || 0;
    return 0;
  }

  sort(0, list.length - 1);

  return {
    sortedList: list,
    stepTraces: traces
  };
}
