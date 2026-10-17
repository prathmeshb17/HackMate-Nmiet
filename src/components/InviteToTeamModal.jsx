import React, { useState, useEffect } from 'react';
import {
  X, Users, Trophy, Check, Send, Sparkles, Briefcase,
  AlertCircle, ShieldCheck, Clock
} from 'lucide-react';

export default function InviteToTeamModal({
  isOpen,
  onClose,
  candidate,
  ledTeams = [],
  currentStudent,
  onConfirmInvite
}) {
  if (!isOpen || !candidate) return null;

  const [selectedTeamId, setSelectedTeamId] = useState(ledTeams[0]?.id || '');
  const [roleOffered, setRoleOffered] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const selectedTeam = ledTeams.find(t => t.id === selectedTeamId) || ledTeams[0] || null;

  useEffect(() => {
    if (ledTeams.length > 0) {
      const defaultTeam = ledTeams[0];
      setSelectedTeamId(defaultTeam.id);

      // Pre-fill role offered based on team needs or candidate preferred role
      const candidateRole = candidate.preferredRole || (candidate.preferredRoles ? candidate.preferredRoles[0] : '');
      const teamRoleNeeded = (defaultTeam.lookingForRoles || [])[0] || '';
      setRoleOffered(candidateRole || teamRoleNeeded || 'Teammate');

      setCustomMessage(
        `Hi ${candidate.name}, I would love for you to join our squad "${defaultTeam.name}" for ${defaultTeam.hackathonTitle}!`
      );
    }
  }, [candidate, ledTeams, isOpen]);

  const handleSelectTeam = (team) => {
    setSelectedTeamId(team.id);
    const candidateRole = candidate.preferredRole || (candidate.preferredRoles ? candidate.preferredRoles[0] : '');
    const teamRoleNeeded = (team.lookingForRoles || [])[0] || '';
    setRoleOffered(candidateRole || teamRoleNeeded || 'Teammate');
    setCustomMessage(
      `Hi ${candidate.name}, I would love for you to join our squad "${team.name}" for ${team.hackathonTitle}!`
    );
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!selectedTeam) return;

    onConfirmInvite({
      team: selectedTeam,
      candidate,
      roleOffered: roleOffered.trim() || 'Teammate',
      message: customMessage.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl text-slate-900 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Choose Squad for Invitation
              </h2>
              <p className="text-xs text-slate-500">
                Select which of your squads you want to recruit <strong>{candidate.name}</strong> into.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Summary Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3.5">
          <img
            src={candidate.avatar}
            alt={candidate.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 flex-shrink-0"
          />
          <div className="overflow-hidden flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-extrabold text-slate-900 truncate">{candidate.name}</h4>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md flex-shrink-0">
                {candidate.preferredRole || (candidate.preferredRoles ? candidate.preferredRoles[0] : 'Developer')}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {candidate.college || 'Engineering'} • {candidate.branch || 'CSE'}
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(candidate.skills || []).slice(0, 4).map((sk, idx) => (
                <span key={idx} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-700 font-medium">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Team Selection List */}
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Select Target Squad ({ledTeams.length} available): <span className="text-rose-500">*</span></span>
              {ledTeams.length > 1 && (
                <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Select 1 Squad
                </span>
              )}
            </label>

            {ledTeams.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>No squads formed yet</span>
                </div>
                <p className="text-slate-600">
                  You haven't formed a squad as a leader yet. Please visit the <strong>Teams</strong> tab to form a squad first!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {ledTeams.map(team => {
                  const isSelected = team.id === selectedTeamId;
                  const memberCount = team.members ? team.members.length : 1;
                  const maxCount = team.maxMembers || 4;
                  const openSlots = Math.max(0, maxCount - memberCount);

                  return (
                    <div
                      key={team.id}
                      onClick={() => handleSelectTeam(team)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{team.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600 font-bold" />}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                            <Trophy className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span>{team.hackathonTitle}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          openSlots > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {memberCount} / {maxCount} ({openSlots} Open)
                        </span>
                      </div>

                      {/* Open Roles Pill Preview */}
                      {team.lookingForRoles && team.lookingForRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 items-center">
                          <span className="text-[10px] font-mono font-bold text-slate-400">Needed:</span>
                          {team.lookingForRoles.map((r, i) => (
                            <span key={i} className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100/70 text-indigo-800 border border-indigo-200">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {ledTeams.length > 0 && (
            <>
              {/* Role Offered */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Role Offered to {candidate.name}
                </label>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI / ML Specialist, Frontend Developer"
                    value={roleOffered}
                    onChange={e => setRoleOffered(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                {/* Quick suggestions from selected team's needed roles */}
                {selectedTeam?.lookingForRoles && selectedTeam.lookingForRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                    <span className="text-[10px] text-slate-400 font-bold">From Team Needs:</span>
                    {selectedTeam.lookingForRoles.map((r, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setRoleOffered(r)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-all ${
                          roleOffered === r
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Personalized Invitation Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Invitation Message Note
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
                />
              </div>
            </>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>

            {ledTeams.length > 0 && (
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Squad Invite</span>
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
