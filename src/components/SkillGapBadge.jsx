import React from 'react';
import { AlertCircle, CheckCircle2, Layers, Sparkles, UserPlus } from 'lucide-react';
import { analyzeTeamSkillGap } from '../dsa/setDifference.js';

export default function SkillGapBadge({ requiredSkills = [], teamMembers = [], onFindMissingRole = null }) {
  const gapAnalysis = analyzeTeamSkillGap(requiredSkills, teamMembers);

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm font-sans">

      {/* Header & Percentage Ring */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Team Completeness Analysis
            </h4>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 rounded border border-indigo-200">
              Set Difference: R \ T
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            {gapAnalysis.isComplete
              ? 'All required skill categories are covered by your team!'
              : `${gapAnalysis.missingSkills.length} skill requirement(s) missing.`}
          </p>
        </div>

        {/* Coverage Percentage Wheel */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-200"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={113}
                strokeDashoffset={113 - (113 * gapAnalysis.coveragePercentage) / 100}
                className={gapAnalysis.coveragePercentage === 100 ? 'text-emerald-500' : 'text-indigo-600'}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-extrabold text-slate-900">
              {gapAnalysis.coveragePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Fulfilled vs Missing Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

        {/* Covered Skills */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Covered Skills ({gapAnalysis.fulfilledSkills.length}/{gapAnalysis.totalRequired})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gapAnalysis.fulfilledSkills.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1"
                title={`Covered by: ${item.coveredBy.join(', ')}`}
              >
                {item.skill}
                <span className="text-[9px] text-emerald-600">({item.coveredBy.length})</span>
              </span>
            ))}
            {gapAnalysis.fulfilledSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic">No skills covered yet</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Skill Gap Set R \ T ({gapAnalysis.missingSkills.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gapAnalysis.missingSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold animate-pulse"
              >
                ! {skill}
              </span>
            ))}
            {gapAnalysis.missingSkills.length === 0 && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                ✓ No skill gaps! Ready to build.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Suggested Missing Roles */}
      {gapAnalysis.roleGaps.length > 0 && (
        <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-indigo-900">Recommended Next Teammate Role:</div>
              <div className="text-xs text-indigo-800 font-medium">
                Recruit a <span className="font-bold underline">{gapAnalysis.roleGaps.join(' or ')}</span> to complete your stack.
              </div>
            </div>
          </div>

          {onFindMissingRole && (
            <button
              onClick={() => onFindMissingRole(gapAnalysis.roleGaps[0])}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-all whitespace-nowrap shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Find {gapAnalysis.roleGaps[0]}
            </button>
          )}
        </div>
      )}

    </div>
  );
}
