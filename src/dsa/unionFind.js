/**
 * Disjoint Set Union (DSU) / Union-Find Data Structure
 * Used for tracking student team memberships & preventing double-booking across teams.
 *
 * Operations:
 * 1. find(i): Finds team root ID with Path Compression.
 * 2. union(i, j): Merges two sets by Rank/Size.
 * 3. isConnected(i, j): Checks if two students are on the same team.
 *
 * Time Complexity:
 * - Amortized Time per operation: O(α(N)) where α is the Inverse Ackermann Function (α(N) < 5 for all practical N).
 * - Space Complexity: O(N) to store parent and rank maps.
 */

export class DisjointSet {
  constructor() {
    this.parent = new Map(); // id -> parentId
    this.rank = new Map();   // id -> rank (tree height upper bound)
    this.teamMeta = new Map(); // rootId -> team details (e.g. hackathonId, teamName)
    this.operationLogs = []; // Trace log for Viva visualization
  }

  /**
   * Registers a student or team element in DSU if not already registered.
   */
  makeSet(id, meta = null) {
    if (!this.parent.has(id)) {
      this.parent.set(id, id);
      this.rank.set(id, 0);
      if (meta) {
        this.teamMeta.set(id, meta);
      }
    }
  }

  /**
   * Finds the representative root of the set containing `id`.
   * Implements Path Compression: flattens the tree structure on lookup.
   */
  find(id) {
    this.makeSet(id);
    if (this.parent.get(id) === id) {
      return id;
    }
    // Path compression step
    const root = this.find(this.parent.get(id));
    this.parent.set(id, root);
    this.operationLogs.push({
      action: 'pathCompression',
      element: id,
      newParent: root
    });
    return root;
  }

  /**
   * Unites two elements into the same set using Union by Rank.
   * Returns false if they were already in the same set (prevents circular binding).
   */
  union(idA, idB) {
    const rootA = this.find(idA);
    const rootB = this.find(idB);

    if (rootA === rootB) {
      return { success: false, reason: 'Already in the same team!' };
    }

    const rankA = this.rank.get(rootA);
    const rankB = this.rank.get(rootB);

    let newRoot, mergedChild;
    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
      newRoot = rootB;
      mergedChild = rootA;
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
      newRoot = rootA;
      mergedChild = rootB;
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
      newRoot = rootA;
      mergedChild = rootB;
    }

    // Transfer team metadata to new root if present
    if (this.teamMeta.has(mergedChild) && !this.teamMeta.has(newRoot)) {
      this.teamMeta.set(newRoot, this.teamMeta.get(mergedChild));
    }

    this.operationLogs.push({
      action: 'union',
      rootA,
      rootB,
      newRoot
    });

    return { success: true, root: newRoot };
  }

  /**
   * Checks if two elements are connected.
   */
  isConnected(idA, idB) {
    return this.find(idA) === this.find(idB);
  }

  /**
   * Gets all elements grouped by their root representative (teams).
   */
  getGroups() {
    const groups = new Map(); // rootId -> Array of element IDs

    for (const id of this.parent.keys()) {
      const root = this.find(id);
      if (!groups.has(root)) {
        groups.set(root, []);
      }
      groups.get(root).push(id);
    }

    return groups;
  }

  /**
   * Returns graph representation for Viva visualizer.
   */
  getVisualizationData() {
    const nodes = [];
    const links = [];

    for (const [id, parentId] of this.parent.entries()) {
      nodes.push({
        id,
        parent: parentId,
        isRoot: id === parentId,
        rank: this.rank.get(id) || 0
      });
      if (id !== parentId) {
        links.push({ source: id, target: parentId });
      }
    }

    return { nodes, links };
  }
}
