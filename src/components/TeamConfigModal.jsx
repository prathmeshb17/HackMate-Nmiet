import React, { useState, useEffect } from 'react';
import {
  X, Users, Trophy, Sparkles, Plus, Trash2, Check,
  Briefcase, Code2, Clock, Globe, ShieldAlert, AlertCircle
} from 'lucide-react';

const COMMON_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'AI / ML Specialist',
  'UI / UX Designer',
  'Fullstack Developer',
  'DevOps / Cloud Engineer',
  'Mobile Developer',
  'Blockchain / Web3 Dev',
  'Pitcher / Product Manager',
  'Data Scientist'
];

const POPULAR_SKILLS = [
  'React', 'Python', 'FastAPI', 'Node.js', 'Next.js',
  'PyTorch', 'TensorFlow', 'TypeScript', 'Figma', 'Docker',
  'PostgreSQL', 'MongoDB', 'Solidity', 'Tailwind', 'Git'
];

export default function TeamConfigModal({
  isOpen,
  onClose,
  onSubmit,
  initialTeam = null,
  hackathons = [],
  currentStudent
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(initialTeam && initialTeam.id);

  const [name, setName] = useState('');
  const [hackathonTitle, setHackathonTitle] = useState('');
  const [hackathonId, setHackathonId] = useState('');
  const [pitch, setPitch] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [status, setStatus] = useState('Recruiting');
  const [workingMode, setWorkingMode] = useState('Online');
  const [lookingForRoles, setLookingForRoles] = useState([]);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [minExperience, setMinExperience] = useState('Open to All');
  const [timeCommitment, setTimeCommitment] = useState('Weekend Sprint (24-48 hrs)');
  const [requirementsNote, setRequirementsNote] = useState('');
  const [hackathonSearch, setHackathonSearch] = useState('');

  // Hydrate form on open
  useEffect(() => {
    if (initialTeam) {
      setName(initialTeam.name || '');
      setHackathonTitle(initialTeam.hackathonTitle || '');
      setHackathonId(initialTeam.hackathonId || '');
      setPitch(initialTeam.pitch || initialTeam.description || '');
      setMaxMembers(initialTeam.maxMembers || 4);
      setStatus(initialTeam.status || 'Recruiting');
      setWorkingMode(initialTeam.workingMode || 'Online');
      setLookingForRoles(initialTeam.lookingForRoles || ['Backend Developer', 'UI / UX Designer']);
      setRequiredSkills(initialTeam.requiredSkills || ['React', 'Python']);
      setMinExperience(initialTeam.minExperience || 'Open to All');
      setTimeCommitment(initialTeam.timeCommitment || 'Weekend Sprint (24-48 hrs)');
      setRequirementsNote(initialTeam.requirementsNote || '');
    } else {
      setName('');
      const defaultHack = hackathons[0] || null;
      setHackathonTitle(defaultHack ? defaultHack.title : 'AI Product Hackathon 2026');
      setHackathonId(defaultHack ? defaultHack.id : 'hack-default');
      setPitch('');
      setMaxMembers(defaultHack ? (defaultHack.maxTeamSize || 4) : 4);
      setStatus('Recruiting');
      setWorkingMode('Online');
      setLookingForRoles(['Frontend Developer', 'Backend Developer', 'AI / ML Specialist']);
      setRequiredSkills(defaultHack ? (defaultHack.requiredSkills || ['React', 'Python']) : ['React', 'Python']);
      setMinExperience('Open to All');
      setTimeCommitment('Weekend Sprint (24-48 hrs)');
      setRequirementsNote('');
    }
  }, [initialTeam, hackathons, isOpen]);

  const handleSelectHackathon = (hack) => {
    setHackathonTitle(hack.title);
    setHackathonId(hack.id);
    if (!isEditing && hack.maxTeamSize) {
      setMaxMembers(hack.maxTeamSize);
    }
    if (!isEditing && hack.requiredSkills && hack.requiredSkills.length > 0) {
      setRequiredSkills(Array.from(new Set([...requiredSkills, ...hack.requiredSkills])));
    }
  };

  const handleToggleRole = (role) => {
    if (lookingForRoles.includes(role)) {
      setLookingForRoles(lookingForRoles.filter(r => r !== role));
    } else {
      setLookingForRoles([...lookingForRoles, role]);
    }
  };

  const handleAddCustomRole = (e) => {
    e.preventDefault();
    if (!customRoleInput.trim()) return;
    const r = customRoleInput.trim();
    if (!lookingForRoles.includes(r)) {
      setLookingForRoles([...lookingForRoles, r]);
    }
    setCustomRoleInput('');
  };

  const handleToggleSkill = (skill) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(requiredSkills.filter(s => s !== skill));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    const s = customSkillInput.trim();
    if (!requiredSkills.includes(s)) {
      setRequiredSkills([...requiredSkills, s]);
    }
    setCustomSkillInput('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedHack = hackathons.find(h => h.title.toLowerCase() === hackathonTitle.toLowerCase());

    const teamData = {
      ...(initialTeam || {}),
      id: initialTeam?.id || `team-${Date.now()}`,
      name: name.trim(),
      hackathonId: matchedHack ? matchedHack.id : (hackathonId || `hack-custom-${Date.now()}`),
      hackathonTitle: hackathonTitle.trim() || 'General Hackathon',
      leaderId: initialTeam?.leaderId || currentStudent?.id || 'leader-user',
      members: initialTeam?.members || [currentStudent?.id || 'leader-user'],
      createdDate: initialTeam?.createdDate || new Date().toISOString().split('T')[0],
      pitch: pitch.trim(),
      description: pitch.trim(),
      maxMembers: parseInt(maxMembers) || 4,
      status,
      workingMode,
      lookingForRoles: lookingForRoles.length > 0 ? lookingForRoles : ['Teammate'],
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['Problem Solving'],
      minExperience,
      timeCommitment,
      requirementsNote: requirementsNote.trim()
    };

    onSubmit(teamData);
    onClose();
  };

  const filteredHackathonsList = hackathons.filter(h =>
    !hackathonSearch.trim() ||
    h.title.toLowerCase().includes(hackathonSearch.toLowerCase()) ||
    h.organizer?.toLowerCase().includes(hackathonSearch.toLowerCase())
  ).slice(0, 15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-slate-900 space-y-6">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {isEditing ? 'Configure Team & Custom Requirements' : 'Form a New Squad & Set Requirements'}
              </h2>
              <p className="text-xs text-slate-500">
                As the Team Leader, you have full control over team settings, required roles, and tech stack options.
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

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="space-y-6">

          {/* Section 1: Team Identity */}
          <div className="space-y-4">
            <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> 1. Team Identity & Target Hackathon
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Team Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AlgoWizards AI, VectorVanguard, QuantumBytes"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            {/* Target Hackathon Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Target Hackathon <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Choose from live feeds or type custom</span>
              </label>
              <input
                type="text"
                required
                placeholder="Type or select hackathon below..."
                value={hackathonTitle}
                onChange={e => {
                  setHackathonTitle(e.target.value);
                  setHackathonSearch(e.target.value);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white mb-2"
              />

              {/* Hackathon Picker Dropdown */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold px-1 mb-1">
                  Click to select target hackathon:
                </div>
                {filteredHackathonsList.map(h => {
                  const isSelected = hackathonTitle.trim().toLowerCase() === h.title.toLowerCase();
                  return (
                    <div
                      key={h.id}
                      onClick={() => handleSelectHackathon(h)}
                      className={`p-2 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
                          : 'bg-white hover:bg-indigo-50/60 text-slate-800 border border-slate-200'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="truncate flex items-center gap-1.5">
                          <span>{h.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {h.platform} • {h.organizer}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                        isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {h.prizePool || 'Open'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Pitch / Idea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Team Project Pitch / Mission Statement
              </label>
              <textarea
                rows={2}
                placeholder="What is your team building or aiming to solve? (e.g. Autonomous AI agent workflow for medical diagnosis)"
                value={pitch}
                onChange={e => setPitch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
              />
            </div>

            {/* Squad Size & Status & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Squad Size</label>
                <select
                  value={maxMembers}
                  onChange={e => setMaxMembers(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                >
                  <option value={2}>2 Members (Pair)</option>
                  <option value={3}>3 Members</option>
                  <option value={4}>4 Members (Standard)</option>
                  <option value={5}>5 Members</option>
                  <option value={6}>6 Members</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Recruitment Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                >
                  <option value="Recruiting">🟢 Open for Recruitment</option>
                  <option value="Squad Full">🔴 Squad Full (Locked)</option>
                  <option value="Invite Only">🔒 Invite Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Working Mode</label>
                <select
                  value={workingMode}
                  onChange={e => setWorkingMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                >
                  <option value="Online">Online / Discord</option>
                  <option value="In-Person">In-Person (Campus)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Requirements Options (Roles Needed) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 2. Open Roles Needed in Team
              </div>
              <span className="text-[10px] text-slate-400 font-bold">Select all roles you are recruiting</span>
            </div>

            {/* Common roles pills */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ROLES.map(role => {
                const isSelected = lookingForRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleToggleRole(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>{role}</span>
                    {isSelected ? <Check className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-slate-400" />}
                  </button>
                );
              })}
            </div>

            {/* Custom role input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add custom specialized role (e.g. Prompt Engineer, Cloud Architect)..."
                value={customRoleInput}
                onChange={e => setCustomRoleInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomRole(e);
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomRole}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                + Add Role
              </button>
            </div>
          </div>

          {/* Section 3: Tech Stack & Skills Needed */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> 3. Target Tech Stack & Required Skills
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{requiredSkills.length} selected</span>
            </div>

            {/* Selected Skills Chips */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 min-h-[44px]">
              {requiredSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 shadow-sm"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className="hover:text-rose-600 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {requiredSkills.length === 0 && (
                <span className="text-xs text-slate-400 italic p-1">No specific skills added yet. Select from below or type.</span>
              )}
            </div>

            {/* Quick-add popular skills */}
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Quick Add:</span>
              {POPULAR_SKILLS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-medium transition-all ${
                    requiredSkills.includes(skill)
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            {/* Custom Skill Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type any custom tech skill (e.g. LangChain, Go, WebAssembly)..."
                value={customSkillInput}
                onChange={e => setCustomSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill(e);
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                + Add Skill
              </button>
            </div>
          </div>

          {/* Section 4: Experience & Commitment Preferences */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> 4. Commitment & Prerequisites
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Candidate Experience Level</label>
                <select
                  value={minExperience}
                  onChange={e => setMinExperience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                >
                  <option value="Open to All">🌱 Open to All / Beginners Welcome</option>
                  <option value="Intermediate">🚀 Intermediate (1+ hackathons or strong projects)</option>
                  <option value="Advanced">🏆 Advanced / Competitive (Aiming for podium)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Time Commitment Expected</label>
                <select
                  value={timeCommitment}
                  onChange={e => setTimeCommitment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                >
                  <option value="Weekend Sprint (24-48 hrs)">⚡ Weekend Sprint (24-48 hrs intense)</option>
                  <option value="5-10 Hours / Week">⏱ 5-10 Hours / Week</option>
                  <option value="15-20 Hours / Week">⏱ 15-20 Hours / Week</option>
                  <option value="Full-Time Dedicated">🔥 Full-Time Dedicated</option>
                </select>
              </div>
            </div>

            {/* Custom Prerequisites Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Leader's Custom Prerequisites / Requirements Note</span>
                <span className="text-[10px] text-slate-400 font-normal">Shown to candidates applying</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Please share GitHub profile or Figma link. Must be comfortable doing voice syncs on Discord."
                value={requirementsNote}
                onChange={e => setRequirementsNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEditing ? 'Save All Team Changes' : 'Form Squad & Publish Requirements'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
