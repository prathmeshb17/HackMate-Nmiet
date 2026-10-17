import React, { useState } from 'react';
import { Cpu, Users, Sparkles, RefreshCw, Layers, CheckCircle2, ArrowRight, Share2 } from 'lucide-react';
import { formOptimalTeamsGraph } from '../dsa/graphMatching.js';

export default function AutoTeamGenerator({ students = [], hackathons = [] }) {
  const [selectedHackathonId, setSelectedHackathonId] = useState(hackathons[0]?.id || '');
  const [targetTeamSize, setTargetTeamSize] = useState(3);
  const [generatedResults, setGeneratedResults] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedHackathon = hackathons.find(h => h.id === selectedHackathonId) || hackathons[0];

  const handleGenerateTeams = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const res = formOptimalTeamsGraph(students, targetTeamSize, selectedHackathon);
      setGeneratedResults(res);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" /> GREEDY WEIGHTED GRAPH MATCHING ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Graph-Based Auto Team Generator</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automatically group available students into balanced squads by solving weighted graph clustering (Nodes = Students, Edges = Compatibility).
          </p>
        </div>

        <button
          onClick={handleGenerateTeams}
          disabled={isGenerating || students.length < 2}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-200" />}
          Run Graph Matching Algorithm
        </button>
      </div>

      {/* Control Configuration Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Hackathon Context</label>
          <select
            value={selectedHackathonId}
            onChange={e => setSelectedHackathonId(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-medium"
          >
            {hackathons.map(h => (
              <option key={h.id} value={h.id}>{h.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Team Size Limit</label>
          <select
            value={targetTeamSize}
            onChange={e => setTargetTeamSize(parseInt(e.target.value))}
            className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-medium"
          >
            <option value={2}>2 Members (Pairs)</option>
            <option value={3}>3 Members (Trio)</option>
            <option value={4}>4 Members (Quad)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Student Candidate Pool</label>
          <div className="w-full bg-slate-50 text-xs text-slate-700 px-3 py-2 rounded-xl border border-slate-200 flex items-center justify-between font-mono">
            <span>{students.length} Registered Students</span>
            <span className="text-[10px] text-indigo-600 font-bold">{(students.length * Math.max(0, students.length - 1)) / 2} Edges</span>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {generatedResults && (
        <div className="space-y-6 animate-fadeIn">

          {/* Execution Specs Banner */}
          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-indigo-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Generated <strong className="text-indigo-900">{generatedResults.teams.length}</strong> optimal squads using Greedy Edge Selection.
              </span>
            </div>
            <div className="text-[10px] text-indigo-700 bg-white px-3 py-1 rounded-lg border border-indigo-200 font-bold">
              Time Complexity: O(V² log V)
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedResults.teams.map((team) => (
              <div key={team.teamId} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {team.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      {team.memberCount} Members
                    </span>
                  </div>

                  <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold font-mono">
                    Avg Compat: {team.avgCompatibilityScore}%
                  </div>
                </div>

                {/* Member Roster */}
                <div className="space-y-2">
                  {team.members.map(member => (
                    <div key={member.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{member.name}</div>
                          <div className="text-[11px] text-slate-500">{member.preferredRole}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-[160px] justify-end">
                        {member.skills.slice(0, 3).map((sk, i) => (
                          <span key={i} className="px-1.5 py-0.5 text-[10px] bg-white text-slate-600 rounded border border-slate-200">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

          {/* Graph Steps Trace Log for Examiners */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-indigo-700 font-bold">
              <span>Greedy Graph Matching Trace Log ({generatedResults.executionSteps.length} Steps)</span>
              <span className="text-[10px] text-slate-500">Sorted Edge Evaluation</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 text-[11px] text-slate-700 pr-2">
              {generatedResults.executionSteps.map((step, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-indigo-600 font-bold">[{step.action}]</span>{' '}
                    {step.students ? step.students.join(' ↔ ') : step.addedStudent || step.mergedTeam}
                  </div>
                  <div className="text-emerald-700 font-bold">
                    Edge Weight: {step.edgeWeight}%
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {!generatedResults && (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Share2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {students.length < 2 ? 'Need at least 2 students to generate graph clusters' : 'Click "Run Graph Matching Algorithm" to form teams'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            The algorithm constructs a weighted complete graph of students and iteratively merges highest compatibility edges.
          </p>
        </div>
      )}

    </div>
  );
}
