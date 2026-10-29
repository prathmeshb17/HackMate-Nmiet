import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Users, Trophy, Check, Send, Sparkles, Briefcase,
  Plus, ArrowLeft, Dices, Globe, Layers, AlertCircle, Clock
} from 'lucide-react';

const SQUAD_NAME_SUGGESTIONS = [
  'CyberVanguard', 'NeuralKnights', 'ByteBusters', 'QuantumCrew',
  'DevDynamos', 'CodeCrafters', 'BinaryBrigade', 'PixelPioneers',
  'AlgoAvengers', 'DataDynasty', 'SyntaxSlayers', 'CloudChallengers'
];

export default function InviteToTeamModal({
  isOpen,
  onClose,
  candidate,
  ledTeams = [],
  currentStudent,
  hackathons = [],
  onCreateTeam,
  onConfirmInvite
}) {
  if (!isOpen || !candidate) return null;

  const hasExistingTeams = ledTeams.length > 0;
  const [mode, setMode] = useState(hasExistingTeams ? 'select' : 'create'); // 'select' | 'create'

  // --- Select Existing Team State ---
  const [selectedTeamId, setSelectedTeamId] = useState(ledTeams[0]?.id || '');
  const [roleOffered, setRoleOffered] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // --- Create New Team State ---
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedHackathonId, setSelectedHackathonId] = useState(hackathons[0]?.id || '');
  const [hackathonSearch, setHackathonSearch] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [workingMode, setWorkingMode] = useState('Online');
  const [newRoleOffered, setNewRoleOffered] = useState('');
  const [newCustomMessage, setNewCustomMessage] = useState('');

  // Selected existing team
  const selectedTeam = ledTeams.find(t => t.id === selectedTeamId) || ledTeams[0] || null;

  // Selected hackathon for creation
  const selectedHackathon = hackathons.find(h => h.id === selectedHackathonId) || hackathons[0] || {
    id: 'hack-default',
    title: 'Global Tech Sprint 2026',
    platform: 'Unstop',
    maxTeamSize: 4
  };

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialMode = ledTeams.length > 0 ? 'select' : 'create';
      setMode(initialMode);

      const candidateRole = candidate.preferredRole || (candidate.preferredRoles ? candidate.preferredRoles[0] : 'Fullstack Developer');

      // Select mode defaults
      if (ledTeams.length > 0) {
        const defaultTeam = ledTeams[0];
        setSelectedTeamId(defaultTeam.id);
        const teamRoleNeeded = (defaultTeam.lookingForRoles || [])[0] || '';
        setRoleOffered(candidateRole || teamRoleNeeded || 'Teammate');
        setCustomMessage(
          `Hi ${candidate.name}, I would love for you to join our squad "${defaultTeam.name}" for ${defaultTeam.hackathonTitle}!`
        );
      }

      // Create mode defaults
      const randomName = SQUAD_NAME_SUGGESTIONS[Math.floor(Math.random() * SQUAD_NAME_SUGGESTIONS.length)];
      setNewTeamName(randomName);
      const defaultHack = hackathons[0] || null;
      if (defaultHack) {
        setSelectedHackathonId(defaultHack.id);
        setMaxMembers(defaultHack.maxTeamSize || 4);
      }
      setNewRoleOffered(candidateRole || 'Frontend Developer');
      setNewCustomMessage(
        `Hi ${candidate.name}, I formed this new squad for ${defaultHack?.title || 'the hackathon'} and would love to build with you as our ${candidateRole}!`
      );
    }
  }, [candidate, ledTeams.length, isOpen]);

  // When user picks an existing team
  const handleSelectTeam = (team) => {
    setSelectedTeamId(team.id);
    const candidateRole = candidate.preferredRole || (candidate.preferredRoles ? candidate.preferredRoles[0] : 'Teammate');
    const teamRoleNeeded = (team.lookingForRoles || [])[0] || '';
    setRoleOffered(candidateRole || teamRoleNeeded || 'Teammate');
    setCustomMessage(
      `Hi ${candidate.name}, I would love for you to join our squad "${team.name}" for ${team.hackathonTitle}!`
    );
  };

  // Suggest random squad name
  const handleSuggestSquadName = () => {
    const random = SQUAD_NAME_SUGGESTIONS[Math.floor(Math.random() * SQUAD_NAME_SUGGESTIONS.length)];
    setNewTeamName(random);
  };

  // 1. Submit existing team invitation
  const handleSendExistingInvite = (e) => {
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

  // 2. Form new team and immediately invite candidate
  const handleCreateAndInvite = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const targetHack = selectedHackathon;

    const newTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      hackathonTitle: targetHack.title,
      hackathonId: targetHack.id,
      leaderId: currentStudent?.id || 'std-lead',
      leaderName: currentStudent?.name || 'Squad Leader',
      pitch: `Formed to compete in ${targetHack.title}.`,
      maxMembers: Number(maxMembers) || 4,
      members: [currentStudent?.id || 'std-lead'],
      status: 'Recruiting',
      workingMode,
      lookingForRoles: [
        newRoleOffered.trim() || 'Frontend Developer',
        'Backend Developer',
        'UI / UX Designer'
      ],
      requiredSkills: targetHack.requiredSkills || ['React', 'Python'],
      createdAt: new Date().toISOString()
    };

    if (onCreateTeam) {
      onCreateTeam(newTeam);
    }

    if (onConfirmInvite) {
      onConfirmInvite({
        team: newTeam,
        candidate,
        roleOffered: newRoleOffered.trim() || 'Teammate',
        message: newCustomMessage.trim() || `Hi ${candidate.name}, I formed this new squad "${newTeam.name}" for ${targetHack.title} and would love for you to join!`
      });
    }

    onClose();
  };

  // Filtered hackathons for search dropdown
  const filteredHackathons = useMemo(() => {
    if (!hackathonSearch.trim()) return hackathons.slice(0, 30);
    const q = hackathonSearch.toLowerCase();
    return hackathons.filter(h =>
      (h.title || '').toLowerCase().includes(q) ||
      (h.platform || '').toLowerCase().includes(q) ||
      (h.category || '').toLowerCase().includes(q)
    ).slice(0, 30);
  }, [hackathons, hackathonSearch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl text-slate-900 space-y-5">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
              {mode === 'create' ? <Sparkles className="w-5 h-5 text-indigo-600" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-display">
                {mode === 'create'
                  ? `Form a Squad & Recruit ${candidate.name}`
                  : `Choose Squad for ${candidate.name}`}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'create'
                  ? `Create your squad in 1 click and automatically dispatch the invitation to ${candidate.name}.`
                  : `Select which squad to invite ${candidate.name} into, or form a new squad.`}
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
            src={candidate.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${candidate.name}`}
            alt={candidate.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 flex-shrink-0"
          />
          <div className="overflow-hidden flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-extrabold text-slate-900 truncate font-display">{candidate.name}</h4>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md flex-shrink-0 font-mono">
                {candidate.preferredRole || (candidate.preferredRoles ? candidate.preferredRoles[0] : 'Developer')}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {candidate.college || 'Engineering'} • {candidate.branch || 'CSE'}
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(candidate.skills || []).slice(0, 4).map((sk, idx) => (
                <span key={idx} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-700 font-mono font-medium">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MODE 1: SELECT EXISTING SQUAD */}
        {mode === 'select' && (
          <form onSubmit={handleSendExistingInvite} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Your Squads ({ledTeams.length}):</span>
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Form New Squad</span>
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
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
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 font-display truncate">
                            <span>{team.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600 font-bold flex-shrink-0" />}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate">
                            <Trophy className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span className="truncate">{team.hackathonTitle}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex-shrink-0 font-mono ${
                          openSlots > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {memberCount} / {maxCount} ({openSlots} Open)
                        </span>
                      </div>

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

              {/* Or Form New Squad Option Button */}
              <button
                type="button"
                onClick={() => setMode('create')}
                className="w-full mt-2.5 py-2.5 px-3 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all group font-display"
              >
                <Plus className="w-4 h-4 text-indigo-600 group-hover:rotate-90 transition-transform" />
                <span>Form a New Squad Instead</span>
              </button>
            </div>

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

              {selectedTeam?.lookingForRoles && selectedTeam.lookingForRoles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                  <span className="text-[10px] text-slate-400 font-bold">Suggested:</span>
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

            {/* Invitation Message Note */}
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 font-display"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Squad Invite</span>
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: FORM A NEW SQUAD */}
        {mode === 'create' && (
          <form onSubmit={handleCreateAndInvite} className="space-y-4">
            {hasExistingTeams && (
              <button
                type="button"
                onClick={() => setMode('select')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to my existing squads ({ledTeams.length})</span>
              </button>
            )}

            {/* Squad Name with Suggestion Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Squad Name <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSuggestSquadName}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Random Name</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. CyberVanguard, CodeCrafters, NeuralKnights"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                autoFocus
              />
            </div>

            {/* Target Hackathon Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Target Hackathon
              </label>

              {hackathons.length > 5 && (
                <input
                  type="text"
                  placeholder="Filter competitions by name or track..."
                  value={hackathonSearch}
                  onChange={e => setHackathonSearch(e.target.value)}
                  className="w-full mb-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              )}

              <select
                value={selectedHackathonId}
                onChange={e => {
                  setSelectedHackathonId(e.target.value);
                  const h = hackathons.find(item => item.id === e.target.value);
                  if (h?.maxTeamSize) setMaxMembers(h.maxTeamSize);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white truncate"
              >
                {filteredHackathons.map(h => (
                  <option key={h.id} value={h.id}>
                    [{h.platform || 'Event'}] {h.title} ({h.mode || 'Online'})
                  </option>
                ))}
              </select>
            </div>

            {/* Squad Size & Working Mode Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Max Members
                </label>
                <select
                  value={maxMembers}
                  onChange={e => setMaxMembers(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value={2}>2 Members (Duo)</option>
                  <option value={3}>3 Members (Trio)</option>
                  <option value={4}>4 Members (Standard)</option>
                  <option value={5}>5 Members</option>
                  <option value={6}>6 Members</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Working Mode
                </label>
                <select
                  value={workingMode}
                  onChange={e => setWorkingMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="Online">Online / Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="In-Person">In-Person / Onsite</option>
                </select>
              </div>
            </div>

            {/* Role Offered */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Role Assigned to {candidate.name}
              </label>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Developer, AI Specialist"
                  value={newRoleOffered}
                  onChange={e => setNewRoleOffered(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Personalized Invitation Note */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Invitation Note
              </label>
              <textarea
                rows={2}
                value={newCustomMessage}
                onChange={e => setNewCustomMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 font-display"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Squad & Send Invite</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
