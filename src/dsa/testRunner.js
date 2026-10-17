/**
 * DSA Assertion Verification Suite
 * Verifies core functionality of Trie, Jaccard, MaxHeap, Set Difference, Union-Find, Graph Matching, and QuickSort.
 */

import { SkillTrie } from './trie.js';
import { calculateJaccardSimilarity, calculateStudentCompatibility } from './similarity.js';
import { MaxHeap } from './maxHeap.js';
import { analyzeTeamSkillGap } from './setDifference.js';
import { DisjointSet } from './unionFind.js';
import { formOptimalTeamsGraph } from './graphMatching.js';
import { quickSort } from './quickSort.js';
import { runGaleShapley } from './stableMatching.js';
import { findMaximumBipartiteMatching } from './bipartiteMatching.js';

export function runDSATests() {
  const results = [];

  function assert(name, condition, extraInfo = '') {
    if (condition) {
      results.push({ name, status: 'PASSED', extraInfo });
    } else {
      results.push({ name, status: 'FAILED', extraInfo: `Assertion failed: ${extraInfo}` });
    }
  }

  try {
    // Test 1: Trie Autocomplete
    const trie = new SkillTrie();
    ['React', 'React Native', 'Redux', 'Rust', 'Ruby', 'Python'].forEach(s => trie.insert(s));
    const suggestions = trie.autocomplete('re');
    const suggestionNames = suggestions.map(s => s.skill.toLowerCase());
    assert(
      'Trie Autocomplete Test',
      suggestionNames.includes('react') && suggestionNames.includes('redux'),
      `Expected "react" and "redux" for prefix "re". Got: ${suggestionNames.join(', ')}`
    );

    // Test 2: Jaccard Similarity
    const jaccard = calculateJaccardSimilarity(['React', 'Node.js', 'Python'], ['React', 'Python', 'Docker']);
    // Intersection: React, Python (2). Union: React, Node.js, Python, Docker (4). Jaccard = 2/4 = 0.5
    assert(
      'Jaccard Similarity Calculation',
      jaccard.score === 0.5,
      `Expected 0.5 score, got ${jaccard.score}`
    );

    // Test 3: Max Heap Priority Queue
    const heap = new MaxHeap();
    heap.insert({ name: 'Student A' }, 75);
    heap.insert({ name: 'Student B' }, 95);
    heap.insert({ name: 'Student C' }, 60);

    const max1 = heap.extractMax();
    assert(
      'Max Heap Extract Priority Order',
      max1.priorityKey === 95 && max1.data.name === 'Student B',
      `Expected 95 (Student B), got ${max1 ? max1.priorityKey : 'null'}`
    );

    // Test 4: Set Difference Skill Gap
    const gapAnalysis = analyzeTeamSkillGap(
      ['React', 'Node.js', 'PostgreSQL', 'Figma'],
      [{ name: 'Alex', skills: ['React', 'Node.js'] }]
    );
    assert(
      'Set Difference Skill Gap Analysis',
      gapAnalysis.missingSkills.length === 2 && gapAnalysis.missingSkills.includes('PostgreSQL'),
      `Expected 2 missing skills (PostgreSQL, Figma). Got: ${gapAnalysis.missingSkills.join(', ')}`
    );

    // Test 5: Union-Find Disjoint Set
    const dsu = new DisjointSet();
    dsu.union('Alex', 'Priya');
    dsu.union('Marcus', 'Sofia');
    assert(
      'Union-Find Connectivity',
      dsu.isConnected('Alex', 'Priya') && !dsu.isConnected('Alex', 'Marcus'),
      'Alex & Priya should be connected; Alex & Marcus disconnected.'
    );

    // Test 6: QuickSort
    const arr = [42, 95, 12, 88, 63];
    const { sortedList } = quickSort(arr, (a, b) => b - a); // Descending
    assert(
      'QuickSort Descending Order',
      sortedList[0] === 95 && sortedList[sortedList.length - 1] === 12,
      `Expected [95, 88, 63, 42, 12]. Got: ${sortedList.join(', ')}`
    );

    // Test 7: Graph Matching
    const mockStudents = [
      { id: 's1', name: 'Alex', skills: ['React', 'Node.js'], preferredRole: 'Frontend' },
      { id: 's2', name: 'Priya', skills: ['Figma', 'UI/UX'], preferredRole: 'UI/UX' },
      { id: 's3', name: 'Marcus', skills: ['Python', 'PostgreSQL'], preferredRole: 'Backend' },
      { id: 's4', name: 'Sofia', skills: ['Machine Learning', 'Python'], preferredRole: 'AI/ML' }
    ];
    const graphRes = formOptimalTeamsGraph(mockStudents, 2);
    assert(
      'Graph Team Matching',
      graphRes.teams.length > 0,
      `Formed ${graphRes.teams.length} teams successfully.`
    );

    // Test 8: Gale-Shapley Stable Matching
    const teamsPrefs = {
      'Team Alpha': ['Alex', 'Priya', 'Marcus'],
      'Team Beta': ['Priya', 'Alex', 'Marcus'],
      'Team Gamma': ['Alex', 'Marcus', 'Priya']
    };
    const candPrefs = {
      'Alex': ['Team Beta', 'Team Alpha', 'Team Gamma'],
      'Priya': ['Team Alpha', 'Team Beta', 'Team Gamma'],
      'Marcus': ['Team Alpha', 'Team Beta', 'Team Gamma']
    };
    const gsRes = runGaleShapley(teamsPrefs, candPrefs);
    assert(
      'Gale-Shapley Stable Matching',
      gsRes.isStable && gsRes.blockingPairs.length === 0 && gsRes.matches.length === 3,
      `Matched ${gsRes.matches.length} pairs with 0 blocking pairs (Stability guaranteed in ${gsRes.totalRounds} rounds).`
    );

    // Test 9: Maximum Bipartite Matching
    const bCandidates = [
      { id: 'c1', name: 'Dev 1', skills: ['React'], preferredRole: 'Frontend' },
      { id: 'c2', name: 'Dev 2', skills: ['Python'], preferredRole: 'Backend' },
      { id: 'c3', name: 'Dev 3', skills: ['Figma'], preferredRole: 'UI/UX' }
    ];
    const bRoles = [
      { id: 'r1', title: 'Frontend Lead', teamName: 'Alpha', requiredSkills: ['React'] },
      { id: 'r2', title: 'Backend Architect', teamName: 'Alpha', requiredSkills: ['Python'] },
      { id: 'r3', title: 'UI/UX Designer', teamName: 'Beta', requiredSkills: ['Figma'] }
    ];
    const bpRes = findMaximumBipartiteMatching(bCandidates, bRoles);
    assert(
      'Maximum Bipartite Role Matching',
      bpRes.maxMatchingCount === 3,
      `Achieved maximum matching cardinality of ${bpRes.maxMatchingCount}/${bRoles.length} roles.`
    );

  } catch (err) {
    results.push({ name: 'DSA Test Exception', status: 'FAILED', extraInfo: err.message });
  }

  return results;
}
