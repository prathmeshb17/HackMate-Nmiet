import React, { useState } from 'react';
import { Award, Clock, Sparkles, Code, GraduationCap, HelpCircle, UserPlus } from 'lucide-react';

export default function StudentCard({ student, matchResult = null, onInvite = null, isCurrent = false }) {
  const [showMathDetails, setShowMathDetails] = useState(false);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Frontend': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Backend': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UI/UX': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'AI/ML': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Fullstack': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const roles = Array.isArray(student.preferredRoles) && student.preferredRoles.length > 0
    ? student.preferredRoles
    : [student.preferredRole || 'Fullstack'];

  return (
    <div className="relative bg-white rounded-3xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all group flex flex-col justify-between">

      {/* Top Header & Match Score Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 group-hover:ring-indigo-500 transition-all"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {student.name}
                </h3>
                {isCurrent && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-700 rounded border border-indigo-200">
                    You
                  </span>
                )}
              </div>

              {/* College & Academic info */}
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                {student.college || 'Engineering College'} • {student.branch || 'CSE'} ({student.div || 'Div A'})
              </p>
            </div>
          </div>

          {/* Match Score Badge */}
          {matchResult && (
            <div className="flex flex-col items-end">
              <div className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm ${
                matchResult.compositeScore >= 80
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : matchResult.compositeScore >= 60
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-300'
                  : 'bg-amber-50 text-amber-700 border border-amber-300'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                {matchResult.compositeScore}% Match
              </div>
              <button
                onClick={() => setShowMathDetails(!showMathDetails)}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 mt-1 flex items-center gap-0.5 font-mono underline underline-offset-2"
              >
                <HelpCircle className="w-2.5 h-2.5" />
                DSA Math
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-sans">
          {student.bio}
        </p>

        {/* Roles & Specs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {roles.map((r, i) => (
            <span key={i} className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getRoleBadgeColor(r)}`}>
              {r}
            </span>
          ))}
          <span className="px-2 py-0.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md border border-slate-200">
            {student.experienceLevel}
          </span>
          <span className="px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-md border border-slate-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {student.availabilityHours}h/wk
          </span>
        </div>

        {/* Skill Chips */}
        <div className="mb-4">
          <div className="text-[11px] text-slate-500 mb-1.5 font-semibold flex items-center gap-1">
            <Code className="w-3 h-3 text-indigo-600" />
            Skill Vector:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {student.skills.map((skill, idx) => {
              const isMatched = matchResult && matchResult.details.intersection.some(
                s => s.toLowerCase() === skill.toLowerCase()
              );
              return (
                <span
                  key={idx}
                  className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-all ${
                    isMatched
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {skill} {isMatched && '✓'}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Jaccard & Cosine Math Breakdown Modal */}
      {showMathDetails && matchResult && (
        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-indigo-200 text-xs font-mono">
          <div className="flex items-center justify-between text-indigo-900 font-bold mb-2 pb-1 border-b border-slate-200">
            <span>Explicit Math Calculation</span>
            <span className="text-[10px] text-slate-500">Jaccard & Cosine</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-700">
              <span>Jaccard Index J(A, B):</span>
              <span className="text-emerald-700 font-bold">
                {matchResult.details.intersection.length} / {matchResult.details.union.length} = {matchResult.details.jaccardScore}
              </span>
            </div>

            <div className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-200">
              <div>Intersection A ∩ B ({matchResult.details.intersection.length}): {matchResult.details.intersection.join(', ') || 'None'}</div>
              <div>Union A ∪ B ({matchResult.details.union.length}): {matchResult.details.union.join(', ')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="truncate max-w-[140px]">@{student.github || student.name.toLowerCase().replace(/\s+/g, '')}</span>
        </div>

        {!isCurrent && onInvite && (
          <button
            onClick={() => onInvite(student)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite / Connect
          </button>
        )}
      </div>

    </div>
  );
}
