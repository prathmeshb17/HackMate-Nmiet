/**
 * Max Heap / Priority Queue Data Structure
 * Used for extracting Top-N best matching teammates sorted by compatibility score.
 *
 * Array representation of Binary Heap:
 * - Parent of node at i: Math.floor((i - 1) / 2)
 * - Left Child of node at i: 2 * i + 1
 * - Right Child of node at i: 2 * i + 2
 *
 * Time Complexity:
 * - Insert (push): O(log N)
 * - Extract Max (pop): O(log N)
 * - Peek Max: O(1)
 * - Build Heap from Array: O(N) using Floyd's algorithm
 * - Extract Top-K from Heap: O(N + K log N)
 *
 * Space Complexity: O(N) auxiliary space.
 */

export class HeapNode {
  constructor(data, priorityKey) {
    this.data = data;             // Student object or item payload
    this.priorityKey = priorityKey; // Compatibility score (0 - 100)
  }
}

export class MaxHeap {
  constructor() {
    this.heap = [];
    this.operationLogs = []; // Stores step-by-step trace for Viva visualizer
  }

  getParentIndex(i) { return Math.floor((i - 1) / 2); }
  getLeftChildIndex(i) { return 2 * i + 1; }
  getRightChildIndex(i) { return 2 * i + 2; }

  hasParent(i) { return this.getParentIndex(i) >= 0; }
  hasLeftChild(i) { return this.getLeftChildIndex(i) < this.heap.length; }
  hasRightChild(i) { return this.getRightChildIndex(i) < this.heap.length; }

  parent(i) { return this.heap[this.getParentIndex(i)]; }
  leftChild(i) { return this.heap[this.getLeftChildIndex(i)]; }
  rightChild(i) { return this.heap[this.getRightChildIndex(i)]; }

  swap(i1, i2) {
    const temp = this.heap[i1];
    this.heap[i1] = this.heap[i2];
    this.heap[i2] = temp;
  }

  peekMax() {
    if (this.heap.length === 0) return null;
    return this.heap[0];
  }

  /**
   * Inserts an item into the Max Heap.
   * @param {object} data
   * @param {number} priorityKey - Score to sort by
   */
  insert(data, priorityKey) {
    const node = new HeapNode(data, priorityKey);
    this.heap.push(node);
    this.heapifyUp(this.heap.length - 1);
  }

  heapifyUp(index) {
    let current = index;
    while (this.hasParent(current) && this.parent(current).priorityKey < this.heap[current].priorityKey) {
      const parentIdx = this.getParentIndex(current);
      this.operationLogs.push({
        action: 'heapifyUp',
        swapped: [current, parentIdx],
        scoreCurrent: this.heap[current].priorityKey,
        scoreParent: this.heap[parentIdx].priorityKey
      });
      this.swap(current, parentIdx);
      current = parentIdx;
    }
  }

  /**
   * Extracts and returns the max priority item (root).
   */
  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const maxItem = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return maxItem;
  }

  heapifyDown(index) {
    let current = index;
    while (this.hasLeftChild(current)) {
      let largerChildIdx = this.getLeftChildIndex(current);

      if (this.hasRightChild(current) && this.rightChild(current).priorityKey > this.leftChild(current).priorityKey) {
        largerChildIdx = this.getRightChildIndex(current);
      }

      if (this.heap[current].priorityKey >= this.heap[largerChildIdx].priorityKey) {
        break;
      }

      this.operationLogs.push({
        action: 'heapifyDown',
        swapped: [current, largerChildIdx],
        scoreCurrent: this.heap[current].priorityKey,
        scoreChild: this.heap[largerChildIdx].priorityKey
      });

      this.swap(current, largerChildIdx);
      current = largerChildIdx;
    }
  }

  /**
   * Builds heap in O(N) time from candidate items.
   * @param {Array<{data: object, priorityKey: number}>} items
   */
  buildHeap(items) {
    this.heap = items.map(item => new HeapNode(item.data, item.priorityKey));
    const startIdx = Math.floor((this.heap.length / 2) - 1);
    for (let i = startIdx; i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  /**
   * Returns top-K elements from heap.
   * @param {number} k
   * @returns {Array<HeapNode>}
   */
  getTopK(k) {
    const topK = [];
    const count = Math.min(k, this.heap.length);
    // Clone heap array so we don't destroy original heap
    const heapCopy = new MaxHeap();
    heapCopy.heap = this.heap.map(node => new HeapNode(node.data, node.priorityKey));

    for (let i = 0; i < count; i++) {
      const maxNode = heapCopy.extractMax();
      if (maxNode) topK.push(maxNode);
    }
    return topK;
  }

  size() {
    return this.heap.length;
  }
}
