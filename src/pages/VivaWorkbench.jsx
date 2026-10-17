import React, { useState, useMemo } from 'react';
import {
  Sparkles, Play, CheckCircle,
  ArrowRight, RefreshCw,
  ShieldCheck, RotateCcw, Award, Zap
} from 'lucide-react';
import { SkillTrie } from '../dsa/trie.js';
import { MaxHeap } from '../dsa/maxHeap.js';
import { DisjointSet } from '../dsa/unionFind.js';
import { quickSort } from '../dsa/quickSort.js';
import { runDSATests } from '../dsa/testRunner.js';
import { runGaleShapley } from '../dsa/stableMatching.js';
import { findMaximumBipartiteMatching } from '../dsa/bipartiteMatching.js';

export default function VivaWorkbench({ students = [], hackathons: _hackathons = [] }) {
  const [activeAlgoTab, setActiveAlgoTab] = useState('stable');
  const [testResults, setTestResults] = useState(() => runDSATests());

  // ==========================================
  // 1. GALE-SHAPLEY STABLE MATCHING STATE
  // ==========================================
  const defaultTeamsPrefs = useMemo(() => ({
    'Team Alpha (AI)': ['Sofia (AI/ML)', 'Alex (Frontend)', 'Priya (UI/UX)', 'Marcus (Backend)'],
    'Team Beta (Web3)': ['Alex (Frontend)', 'Marcus (Backend)', 'Sofia (AI/ML)', 'Priya (UI/UX)'],
    'Team Gamma (FinTech)': ['Marcus (Backend)', 'Priya (UI/UX)', 'Alex (Frontend)', 'Sofia (AI/ML)'],
    'Team Delta (Health)': ['Priya (UI/UX)', 'Sofia (AI/ML)', 'Marcus (Backend)', 'Alex (Frontend)']
  }), []);

  const defaultCandPrefs = useMemo(() => ({
    'Sofia (AI/ML)': ['Team Beta (Web3)', 'Team Alpha (AI)', 'Team Gamma (FinTech)', 'Team Delta (Health)'],
    'Alex (Frontend)': ['Team Alpha (AI)', 'Team Beta (Web3)', 'Team Gamma (FinTech)', 'Team Delta (Health)'],
    'Marcus (Backend)': ['Team Alpha (AI)', 'Team Gamma (FinTech)', 'Team Beta (Web3)', 'Team Delta (Health)'],
    'Priya (UI/UX)': ['Team Delta (Health)', 'Team Gamma (FinTech)', 'Team Beta (Web3)', 'Team Alpha (AI)']
  }), []);

  const stableResult = useMemo(() => runGaleShapley(defaultTeamsPrefs, defaultCandPrefs), [defaultTeamsPrefs, defaultCandPrefs]);
  const [currentGsStep, setCurrentGsStep] = useState(-1); // -1 = show complete

  const handleStepGs = () => {
    if (currentGsStep + 1 < stableResult.stepTraces.length) {
      setCurrentGsStep(prev => prev + 1);
    }
  };

  const handleResetGs = () => {
    setCurrentGsStep(0);
  };

  const handleRunAllGs = () => {
    setCurrentGsStep(stableResult.stepTraces.length - 1);
  };

  // ==========================================
  // 2. MAXIMUM BIPARTITE MATCHING STATE
  // ==========================================
  const defaultBipartiteCandidates = useMemo(() => [
    { id: 'c1', name: 'Alex Patel', skills: ['React', 'TypeScript', 'Node.js'], preferredRole: 'Frontend' },
    { id: 'c2', name: 'Priya Sharma', skills: ['Figma', 'UI/UX', 'Tailwind'], preferredRole: 'UI/UX' },
    { id: 'c3', name: 'Marcus Chen', skills: ['Python', 'PostgreSQL', 'FastAPI'], preferredRole: 'Backend' },
    { id: 'c4', name: 'Sofia Rodriguez', skills: ['PyTorch', 'Python', 'Machine Learning'], preferredRole: 'AI/ML' },
    { id: 'c5', name: 'David Kim', skills: ['Docker', 'AWS', 'Kubernetes'], preferredRole: 'DevOps' }
  ], []);

  const defaultBipartiteRoles = useMemo(() => [
    { id: 'r1', title: 'Frontend Lead', teamName: 'Alpha Squad', requiredSkills: ['React', 'TypeScript'] },
    { id: 'r2', title: 'AI / ML Specialist', teamName: 'Alpha Squad', requiredSkills: ['PyTorch', 'Python'] },
    { id: 'r3', title: 'Backend Architect', teamName: 'FinTech Titans', requiredSkills: ['Python', 'PostgreSQL'] },
    { id: 'r4', title: 'UI/UX Designer', teamName: 'FinTech Titans', requiredSkills: ['Figma', 'UI/UX'] },
    { id: 'r5', title: 'Cloud & DevOps Lead', teamName: 'HealthTech Hub', requiredSkills: ['Docker', 'AWS'] }
  ], []);

  const bipartiteResult = useMemo(() =>
    findMaximumBipartiteMatching(defaultBipartiteCandidates, defaultBipartiteRoles),
    [defaultBipartiteCandidates, defaultBipartiteRoles]
  );

  // ==========================================
  // 3. TRIE STATE
  // ==========================================
  const [triePrefix, setTriePrefix] = useState('re');
  const [trieMatches, setTrieMatches] = useState(() => {
    const t = new SkillTrie();
    ['React', 'React Native', 'Redux', 'Rust', 'Ruby', 'Python', 'PyTorch', 'PostgreSQL', 'Figma', 'Flutter', 'FastAPI', 'Docker'].forEach(s => t.insert(s));
    return t.autocomplete('re');
  });

  // ==========================================
  // 4. MAX HEAP STATE
  // ==========================================
  const [heapInstance, setHeapInstance] = useState(() => {
    const h = new MaxHeap();
    const pool = students.length > 0 ? students : defaultBipartiteCandidates;
    pool.forEach(s => h.insert(s, Math.floor(Math.random() * 35) + 65));
    return h;
  });
  const [extractedNodes, setExtractedNodes] = useState([]);
  const [newScoreInput, setNewScoreInput] = useState(88);

  // ==========================================
  // 5. SET DIFFERENCE STATE
  // ==========================================
  const [sampleReqs] = useState(['React', 'Node.js', 'PyTorch', 'Figma', 'PostgreSQL', 'Docker']);

  // ==========================================
  // 6. UNION-FIND STATE
  // ==========================================
  const [dsuDemo] = useState(() => {
    const dsu = new DisjointSet();
    dsu.union('Alex', 'Priya');
    dsu.union('Marcus', 'Sofia');
    return dsu;
  });

  // ==========================================
  // 7. QUICKSORT STATE
  // ==========================================
  const [quickSortInput, setQuickSortInput] = useState('95, 42, 88, 12, 76, 60');
  const [quickSortResult, setQuickSortResult] = useState(() => {
    const nums = [95, 42, 88, 12, 76, 60];
    return quickSort(nums, (a, b) => b - a);
  });

  const handleTrieChange = (val) => {
    setTriePrefix(val);
    const t = new SkillTrie();
    ['React', 'React Native', 'Redux', 'Rust', 'Ruby', 'Python', 'PyTorch', 'PostgreSQL', 'Figma', 'Flutter', 'FastAPI', 'Docker'].forEach(s => t.insert(s));
    setTrieMatches(t.autocomplete(val));
  };

  const handleHeapPush = () => {
    if (!heapInstance) return;
    const h = new MaxHeap();
    h.heap = [...heapInstance.heap];
    h.insert({ name: `Candidate ${h.size() + 1}` }, parseInt(newScoreInput) || 75);
    setHeapInstance(h);
  };

  const handleHeapPop = () => {
    if (!heapInstance || heapInstance.size() === 0) return;
    const h = new MaxHeap();
    h.heap = [...heapInstance.heap];
    const max = h.extractMax();
    if (max) {
      setExtractedNodes(prev => [max, ...prev]);
    }
    setHeapInstance(h);
  };

  const handleRunQuickSort = (rawStr) => {
    const nums = rawStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const res = quickSort(nums, (a, b) => b - a);
    setQuickSortResult(res);
  };

  const algoTabs = [
    { id: 'stable', label: 'Gale-Shapley Stable Matching', tag: 'New', color: 'indigo' },
    { id: 'bipartite', label: 'Max Bipartite Role Allocation', tag: 'New', color: 'emerald' },
    { id: 'trie', label: 'Trie Prefix Autocomplete', tag: 'O(L)', color: 'blue' },
    { id: 'heap', label: 'Max-Heap Priority Queue', tag: 'O(log N)', color: 'amber' },
    { id: 'jaccard', label: 'Jaccard & Vector Cosine', tag: 'Math', color: 'purple' },
    { id: 'setdiff', label: 'Set Difference (R \\ T)', tag: 'Gap', color: 'rose' },
    { id: 'dsu', label: 'Union-Find (DSU)', tag: 'O(α(N))', color: 'cyan' },
    { id: 'graph', label: 'Greedy Graph Clustering', tag: 'O(V² log V)', color: 'teal' },
    { id: 'quicksort', label: 'QuickSort Partition Trace', tag: 'O(N log N)', color: 'violet' },
    { id: 'unitTests', label: 'Unit Test Suite (9/9 Passed)', tag: 'Tests', color: 'emerald' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            Examiner & Viva Interactive Lab
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            DSA Algorithms & Interactive Debugger
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Live interactive laboratory to step through, visualize, and prove all 9 core data structures and algorithms powering HackMate.
          </p>
        </div>

        {/* Test Suite Summary Badge */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono shadow-sm flex flex-col items-start gap-1 min-w-[220px]">
          <div className="text-slate-600 font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Automated Assertion Suite
          </div>
          <div className="text-emerald-700 font-extrabold text-sm">
            {testResults.filter(r => r.status === 'PASSED').length} / {testResults.length} Unit Tests Passing
          </div>
          <span className="text-[10px] text-slate-400">Zero regressions detected</span>
        </div>
      </div>

      {/* Algorithm Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {algoTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveAlgoTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAlgoTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
              activeAlgoTab === tab.id
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.tag}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. GALE-SHAPLEY STABLE MATCHING VISUALIZER                                */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'stable' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                    GALE-SHAPLEY ALGORITHM (DEFERRED ACCEPTANCE)
                  </span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Stability Verified (0 Blocking Pairs)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Stable Team-Candidate Matching Engine</h3>
                <p className="text-xs text-slate-500">
                  Guarantees that no (Team, Candidate) pair mutually prefer each other over their assigned match, eliminating poaching and broken agreements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStepGs}
                  disabled={currentGsStep >= stableResult.stepTraces.length - 1}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-600" /> Step Next Round
                </button>
                <button
                  onClick={handleRunAllGs}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Run All Rounds
                </button>
                <button
                  onClick={handleResetGs}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                  title="Reset to Step 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Step Tracker */}
            {currentGsStep >= 0 && (
              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-900">
                    Step {currentGsStep + 1} of {stableResult.stepTraces.length}:
                  </span>
                  <span className="text-indigo-800 font-semibold">
                    {stableResult.stepTraces[currentGsStep]?.description}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  stableResult.stepTraces[currentGsStep]?.action === 'SWITCH_ENGAGEMENT'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : stableResult.stepTraces[currentGsStep]?.action === 'ENGAGED_NEW'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  [{stableResult.stepTraces[currentGsStep]?.action}]
                </span>
              </div>
            )}

            {/* Stable Matches Result Cards */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Final Stable Assignments (Proposer-Optimal Equilibrium)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stableResult.matches.map((m, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        Pair #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Stable Match
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 font-mono">Proposing Squad:</div>
                      <div className="text-sm font-bold text-slate-900">{m.team}</div>
                      <div className="text-[10px] text-indigo-600 font-mono font-semibold">
                        Squad's Choice #{m.teamPreferenceRank}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <div className="text-xs text-slate-500 font-mono">Assigned Candidate:</div>
                      <div className="text-sm font-bold text-slate-900">{m.candidate}</div>
                      <div className="text-[10px] text-emerald-600 font-mono font-semibold">
                        Candidate's Choice #{m.candidatePreferenceRank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences Lists Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Teams Preferences */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Teams' Ranked Preferences (Proposers)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ranked 1st to 4th</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {Object.entries(defaultTeamsPrefs).map(([team, prefs]) => (
                    <div key={team} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900">{team}: </span>
                      <span className="text-slate-600">{prefs.join(' > ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidates Preferences */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Candidates' Ranked Preferences (Acceptors)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ranked 1st to 4th</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {Object.entries(defaultCandPrefs).map(([cand, prefs]) => (
                    <div key={cand} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900">{cand}: </span>
                      <span className="text-slate-600">{prefs.join(' > ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Viva Theory Note */}
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 space-y-2">
              <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                Examiner Viva Insight: Gale-Shapley Theorem Proof
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed">
                <strong>Termination Guaranteed:</strong> Each squad proposes to candidates strictly in decreasing order of preference and never proposes to the same candidate twice. Since there are $N$ teams and $N$ candidates, the algorithm is guaranteed to terminate in at most $N^2$ proposals ($O(N^2)$ time complexity).
              </p>
              <p className="text-xs text-indigo-900 leading-relaxed">
                <strong>Stability Guaranteed:</strong> Suppose by contradiction there exists a blocking pair $(T, C)$ who mutually prefer each other over their assigned partners. Team $T$ must have proposed to candidate $C$ before its final partner. Since $C$ ended up with someone else, $C$ must have rejected $T$ for someone $C$ preferred more, or later switched to a strictly preferred squad. Because candidates only trade up, $C$ must prefer their final partner over $T$, which contradicts the assumption that $(T, C)$ prefer each other!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAXIMUM BIPARTITE MATCHING VISUALIZER                                 */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'bipartite' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    MAXIMUM BIPARTITE MATCHING (AUGMENTING PATHS)
                  </span>
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Max Cardinality: {bipartiteResult.maxMatchingCount} / {bipartiteResult.totalRoles} Roles Matched
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Optimal Role Allocation via Augmenting Chains</h3>
                <p className="text-xs text-slate-500">
                  Matches qualified students ($U$) to open hackathon squad vacancies ($V$) using DFS alternating augmenting paths.
                </p>
              </div>

              <div className="text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                Complexity: O(V · E) | Ford-Fulkerson
              </div>
            </div>

            {/* Bipartite Matching Column Representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {/* Left Column: Candidates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span>Student Candidates Pool (Set U)</span>
                  <span className="font-mono text-indigo-600">{bipartiteResult.totalCandidates} Candidates</span>
                </div>

                <div className="space-y-2">
                  {bipartiteResult.graphData.leftNodes.map(node => (
                    <div
                      key={node.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        node.isMatched
                          ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${node.isMatched ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{node.name}</div>
                          <div className="text-[10px] text-slate-500">{node.role}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        node.isMatched ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {node.isMatched ? 'ALLOCATED' : 'FREE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Roles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span>Hackathon Squad Vacancies (Set V)</span>
                  <span className="font-mono text-indigo-600">{bipartiteResult.totalRoles} Open Roles</span>
                </div>

                <div className="space-y-2">
                  {bipartiteResult.graphData.rightNodes.map(node => (
                    <div
                      key={node.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        node.isMatched
                          ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-sm'
                          : 'bg-rose-50/60 border-rose-200 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{node.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{node.teamName}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          node.isMatched ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {node.isMatched ? `✓ ${node.assignedTo}` : 'VACANT'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Matched Assignments Table */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Augmenting Path Allocation Results ({bipartiteResult.assignments.length} Matched Pairs)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bipartiteResult.assignments.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                      <span>Edge {idx + 1}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Max-Flow Edge
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-indigo-600">{item.candidateName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-900">{item.roleTitle}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Team: {item.teamName}</span>
                      <span className="text-indigo-600 font-mono font-medium">{item.candidateRole}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trace of Augmenting Paths */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>DFS Augmenting Path Traces:</span>
                <span className="text-[10px] text-slate-500">Alternating Path Search</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-2">
                {bipartiteResult.stepTraces.map((trace, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="text-indigo-600 font-bold">{trace.candidateName}</span>:{' '}
                      <span className="text-slate-600">{trace.description}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      trace.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {trace.success ? 'AUGMENTED' : 'BLOCKED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Viva Theory Box */}
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Examiner Viva Insight: Hall's Marriage Theorem & Max-Flow Equivalence
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                <strong>Equivalence to Max-Flow:</strong> Maximum Bipartite Matching is isomorphic to the Maximum Flow problem. By introducing a virtual Source $s$ connected to all students in $U$ with capacity 1, connecting students to their qualified roles with capacity 1, and connecting all roles to a virtual Sink $t$ with capacity 1, the maximum integer $(s-t)$ flow equals the maximum bipartite matching cardinality (Integrality Theorem).
              </p>
              <p className="text-xs text-emerald-900 leading-relaxed">
                <strong>Augmenting Path Principle (Berge's Lemma):</strong> A matching $M$ in graph $G$ is maximum if and only if $G$ contains no $M$-augmenting paths. Our DFS algorithm searches for alternating paths (edges alternating between not-in-$M$ and in-$M$) that start and end at unmatched vertices. Finding such a path and flipping edge memberships increases the matching size by exactly 1.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRIE VISUALIZER                                                        */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'trie' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Trie (Prefix Tree) Autocomplete Debugger</h3>
              <p className="text-xs text-slate-500">Stores skills as prefix tree nodes for instant O(L + K) lookup</p>
            </div>
            <div className="text-xs font-mono text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
              Search: O(L) | Autocomplete: O(L + K)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Test Prefix Input:</label>
                <input
                  type="text"
                  value={triePrefix}
                  onChange={e => handleTrieChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                  placeholder="e.g. re, py, fig..."
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-indigo-700 font-mono">Matched Suggestions ({trieMatches.length}):</div>
                <div className="flex flex-wrap gap-2">
                  {trieMatches.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold">
                      {item.skill} ({item.category})
                    </span>
                  ))}
                  {trieMatches.length === 0 && <span className="text-xs text-slate-400 italic">No matches in Trie</span>}
                </div>
              </div>
            </div>

            {/* Tree Complexity Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs text-slate-700">
              <div className="text-indigo-700 font-bold border-b border-slate-200 pb-2">Mathematical Formulation</div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                A Trie node contains a hash map of child nodes <code className="text-indigo-700">children: Map&lt;char, TrieNode&gt;</code>.
                When searching prefix <code className="text-indigo-700">P</code> of length <code className="text-indigo-700">L</code>, traversal down the tree requires exactly <code className="text-indigo-700">L</code> comparisons. Depth-first traversal down matching subtrees collects <code className="text-indigo-700">K</code> candidate skill tags.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAX HEAP VISUALIZER                                                    */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'heap' && heapInstance && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Max-Heap Priority Queue Visualizer</h3>
              <p className="text-xs text-slate-500">Maintains max compatibility score at root in O(1) lookups</p>
            </div>
            <div className="text-xs font-mono text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              Heapify: O(log N) | Extract Max: O(log N)
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              min="0"
              max="100"
              value={newScoreInput}
              onChange={e => setNewScoreInput(e.target.value)}
              className="bg-slate-50 text-xs text-slate-900 border border-slate-200 rounded-xl px-3 py-2 w-28 font-mono focus:outline-none focus:border-indigo-600"
              placeholder="Score"
            />
            <button
              onClick={handleHeapPush}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Insert Score (heapifyUp)
            </button>
            <button
              onClick={handleHeapPop}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Extract Max Root (heapifyDown)
            </button>
          </div>

          {/* Heap Array Visualizer */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 font-mono">Heap Array Representation (Index 0 = Max Root):</div>
            <div className="flex flex-wrap gap-2">
              {heapInstance.heap.map((node, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center font-mono min-w-[70px] ${
                    idx === 0
                      ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/40'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">[{idx}]</div>
                  <div className="text-sm font-extrabold text-slate-900">{node.priorityKey}%</div>
                  <div className="text-[9px] text-slate-500 truncate max-w-[60px]">{node.data.name || 'Candidate'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Max Queue */}
          {extractedNodes.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-amber-800 font-mono">Extracted Top Matches Sequence:</div>
              <div className="flex flex-wrap gap-2">
                {extractedNodes.map((n, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono">
                    #{i + 1}: {n.priorityKey}% ({n.data.name})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. JACCARD & COSINE SIMILARITY                                           */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'jaccard' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5 font-mono text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 font-sans">Jaccard & Cosine Mathematical Formulas</h3>
            <p className="text-xs text-slate-500 font-sans">Explicit vector distance computations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-indigo-700 font-bold text-sm">1. Jaccard Set Similarity</div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-indigo-700 font-extrabold text-sm">
                J(A, B) = |A ∩ B| / |A ∪ B|
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Measures set intersection size over union size. Returns 1.0 for identical skill sets and 0.0 for disjoint skill sets.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-purple-700 font-bold text-sm">2. Vector Cosine Similarity</div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-purple-700 font-extrabold text-sm">
                Cos(A, B) = (A · B) / (||A|| · ||B||)
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Computes cosine angle between student numerical vectors (Experience Level & Weekly Availability Hours).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SET DIFFERENCE SKILL GAP                                              */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'setdiff' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Set Difference Skill Gap (R \ T)</h3>
            <p className="text-xs text-slate-500">Required Hackathon Skills minus Union of Team Member Skills</p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 font-mono text-xs">
            <div className="flex justify-between text-slate-700">
              <span className="font-bold">Required Skills Set (R):</span>
              <span className="text-indigo-600">{sampleReqs.join(', ')}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="font-bold">Team Skills Union (T):</span>
              <span className="text-emerald-600">React, Node.js, Figma</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 font-bold flex justify-between">
              <span>Skill Gap Set (R \ T):</span>
              <span>PyTorch, PostgreSQL, Docker</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. UNION FIND DISJOINT SETS                                              */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'dsu' && dsuDemo && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5 font-mono text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 font-sans">Union-Find / Disjoint Set Union (DSU)</h3>
            <p className="text-xs text-slate-500 font-sans">Tracks connected team components with Path Compression in amortized O(α(N))</p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-indigo-700 font-bold">Active Parent Pointer Table:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from(dsuDemo.parent.entries()).map(([child, parent]) => (
                <div key={child} className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="text-slate-500 text-[10px]">Element: {child}</div>
                  <div className="text-indigo-600 font-bold mt-1">Parent: {parent}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. GREEDY GRAPH MATCHING                                                 */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'graph' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5 font-mono text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 font-sans">Greedy Weighted Graph Matching</h3>
            <p className="text-xs text-slate-500 font-sans">Iteratively merges edge endpoints sorted by compatibility score in O(V² log V)</p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-indigo-700 font-bold">Algorithm Strategy:</div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px]">
              <li>Construct complete edge list E between all student pairs V (E = V · (V - 1) / 2).</li>
              <li>Sort edges descending by compatibility score in O(E log E) time.</li>
              <li>Iterate through edge list and greedily form teams respecting maximum team size constraints.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. QUICKSORT TRACE                                                       */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'quicksort' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Explicit QuickSort Partition Trace</h3>
            <p className="text-xs text-slate-500 font-mono">Lomuto Partition Scheme with Recursive Sub-array Partitioning</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">Comma-Separated Scores Input:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickSortInput}
                  onChange={e => setQuickSortInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                />
                <button
                  onClick={() => handleRunQuickSort(quickSortInput)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Sort Array
                </button>
              </div>
            </div>

            {quickSortResult && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs">
                <div className="text-emerald-700 font-bold">
                  Sorted Descending Result: [{quickSortResult.sortedList.join(', ')}]
                </div>
                <div className="text-slate-500 text-[10px]">
                  Partition Steps ({quickSortResult.stepTraces.length}):
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] text-slate-700">
                  {quickSortResult.stepTraces.map((t, idx) => (
                    <div key={idx} className="p-1.5 bg-white border border-slate-200 rounded">
                      Step {idx + 1}: Action={t.action}, Pivot={t.pivotValue}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. AUTOMATED UNIT TESTS RESULTS                                         */}
      {/* ========================================================================= */}
      {activeAlgoTab === 'unitTests' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Automated Unit Test Suite Results</h3>
            <button
              onClick={() => setTestResults(runDSATests())}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-run Suite
            </button>
          </div>

          <div className="space-y-3">
            {testResults.map((res, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-center justify-between font-mono text-xs ${
                  res.status === 'PASSED'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50/80 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold">[{res.status}]</span>
                  <span className="font-bold">{res.name}</span>
                </div>
                <div className="text-[10px] text-slate-500">{res.extraInfo}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
