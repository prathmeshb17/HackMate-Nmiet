/**
 * Trie (Prefix Tree) Data Structure
 * Used for fast skill tag autocomplete (e.g. typing "Re" suggests "React", "React Native", "Redux").
 *
 * Time Complexity:
 * - Insert: O(L) where L is string length.
 * - Search / StartsWith: O(L).
 * - Autocomplete: O(L + K) where K is the number of matching words down the subtree.
 *
 * Space Complexity: O(N * L * Σ) where N is total words, L is average length, Σ is alphabet size.
 */

export class TrieNode {
  constructor(char = '') {
    this.char = char;
    this.children = new Map(); // Map<char, TrieNode>
    this.isEndOfWord = false;
    this.category = null;      // Optional skill category (e.g., 'Frontend', 'AI/ML')
    this.frequency = 0;         // Usage count for ranking suggestions
  }
}

export class SkillTrie {
  constructor() {
    this.root = new TrieNode();
    this.wordCount = 0;
  }

  /**
   * Inserts a skill tag into the Trie.
   * @param {string} word - Skill name (e.g., "TypeScript")
   * @param {string} category - Skill category (e.g., "Frontend")
   */
  insert(word, category = 'General') {
    if (!word || typeof word !== 'string') return;
    const cleanWord = word.trim();
    let current = this.root;

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i].toLowerCase();
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode(cleanWord[i]));
      }
      current = current.children.get(char);
    }

    if (!current.isEndOfWord) {
      current.isEndOfWord = true;
      current.category = category;
      this.wordCount++;
    }
    current.frequency += 1;
  }

  /**
   * Searches for exact word match.
   */
  search(word) {
    if (!word) return false;
    let current = this.root;
    const cleanWord = word.trim().toLowerCase();

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i];
      if (!current.children.has(char)) return false;
      current = current.children.get(char);
    }

    return current.isEndOfWord;
  }

  /**
   * Finds all skills starting with prefix.
   * Returns array of objects { skill, category, frequency, trace }
   */
  autocomplete(prefix, limit = 8) {
    if (!prefix || typeof prefix !== 'string') return [];
    const cleanPrefix = prefix.trim().toLowerCase();
    let current = this.root;
    const pathTrace = [];

    // Step 1: Navigate to node at end of prefix
    for (let i = 0; i < cleanPrefix.length; i++) {
      const char = cleanPrefix[i];
      if (!current.children.has(char)) {
        return []; // Prefix not found
      }
      current = current.children.get(char);
      pathTrace.push(current.char);
    }

    // Step 2: DFS down the subtree to collect matching words
    const results = [];
    this._dfsCollect(current, cleanPrefix, results, limit);

    // Sort suggestions by frequency descending
    results.sort((a, b) => b.frequency - a.frequency);

    return results;
  }

  /**
   * Helper DFS function to collect words from node.
   */
  _dfsCollect(node, currentWord, results, limit) {
    if (results.length >= limit * 2) return; // Cap DFS search depth

    if (node.isEndOfWord) {
      // Reconstruct original formatted name or use accumulated string
      results.push({
        skill: currentWord,
        category: node.category,
        frequency: node.frequency
      });
    }

    for (const [char, childNode] of node.children.entries()) {
      this._dfsCollect(childNode, currentWord + childNode.char, results, limit);
    }
  }

  /**
   * Returns structure tree for UI visualization (Viva Mode)
   */
  getVisualizationTree(maxDepth = 3) {
    const formatNode = (node, depth) => {
      if (depth > maxDepth) return { name: '...', children: [] };
      const children = [];
      for (const [char, child] of node.children.entries()) {
        children.push(formatNode(child, depth + 1));
      }
      return {
        char: node.char || 'ROOT',
        isEnd: node.isEndOfWord,
        category: node.category,
        children
      };
    };
    return formatNode(this.root, 0);
  }
}
