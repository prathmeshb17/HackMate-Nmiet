import React, { useState } from 'react';
import {
  ShieldCheck, Plus, UserPlus, LogOut, Layers, Sparkles,
  AlertCircle, CheckCircle, Users, MessageSquare, Trophy, Check,
  Settings, Briefcase, Code2, Clock, Globe, Lock, AlertTriangle,
  FileSpreadsheet, ListTodo, Share2, Search
} from 'lucide-react';
import { GithubIcon } from '../components/BrandIcons.jsx';
import SkillGapBadge from '../components/SkillGapBadge';
import TeamConfigModal from '../components/TeamConfigModal';

export default function TeamsHub({
  teams,
  students,
  hackathons,
  currentStudent,
  onCreateTeam,
  onUpdateTeam,
  onJoinTeam,
  onLeaveTeam,
  dsuInstance,
  onOpenTeamChat,
  onSendJoinRequest,
  onOpenRegistrationPacket,
  onNavigateToFindTeams,
  openLoginModal
}) {

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedTeamToEdit, setSelectedTeamToEdit] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Strictly show joined teams only (members or leader)
  const myJoinedTeams = teams.filter(team => {
    if (!currentStudent) return false;
    return (
      (Array.isArray(team.members) && team.members.includes(currentStudent.id)) ||
      team.leaderId === currentStudent.id
    );
  });

  const handleOpenCreate = () => {
    if (!currentStudent) {
      if (openLoginModal) openLoginModal();
      else alert('Please log in or sign up first!');
      return;
    }
    setSelectedTeamToEdit(null);
    setIsConfigModalOpen(true);
  };

  const handleOpenEdit = (team) => {
    setSelectedTeamToEdit(team);
    setIsConfigModalOpen(true);
  };

  const handleConfigModalSubmit = (teamData) => {
    if (selectedTeamToEdit) {
      if (onUpdateTeam) onUpdateTeam(teamData);
      setFeedbackMsg({
        type: 'success',
        text: `Team "${teamData.name}" and all custom requirements updated successfully!`
      });
    } else {
      onCreateTeam(teamData);
      setFeedbackMsg({
        type: 'success',
        text: `Team "${teamData.name}" created! Open roles and requirements published.`
      });
    }
    setIsConfigModalOpen(false);
    setSelectedTeamToEdit(null);
  };

  const handleRequestToJoin = (team) => {
    if (!currentStudent) {
      if (openLoginModal) openLoginModal();
      else alert('Please log in or sign up first!');
      return;
    }
    if (team.members.includes(currentStudent.id)) return;

    onSendJoinRequest(team, currentStudent);
    setFeedbackMsg({
      type: 'success',
      text: `Join request sent to ${team.name}'s leader! Awaiting approval in their Invites box.`
    });
  };


  return (
    <div className="space-y-6 animate-fadeIn font-sans">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> MY SQUADS & JOINED TEAMS
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {myJoinedTeams.length} {myJoinedTeams.length === 1 ? 'Squad' : 'Squads'} Joined
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Teams & Squad Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Workspace for your joined and led hackathon squads. Manage team members, track milestones on the project canvas, and export official Unstop/Devpost registration packets.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Form New Squad</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn ${
          feedbackMsg.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-800">✕</button>
        </div>
      )}

      {/* Joined Teams Grid */}
      <div className="space-y-6">
        {myJoinedTeams.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-extrabold text-slate-900">You Haven't Joined Any Squads Yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                This workspace shows only the squads you belong to or lead. You can form your own squad right now or discover teams currently recruiting teammates in Find Teams.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Form New Squad</span>
              </button>

              {onNavigateToFindTeams && (
                <button
                  onClick={onNavigateToFindTeams}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span>Explore Open Teams</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          myJoinedTeams.map((team) => {
          const hackathon = hackathons.find(h => h.id === team.hackathonId);
          const teamMembersList = students.filter(s => team.members.includes(s.id));
          const isMember = currentStudent && team.members.includes(currentStudent.id);
          const isLeader = currentStudent && currentStudent.id === team.leaderId;
          const maxSquadSize = team.maxMembers || (hackathon ? hackathon.maxTeamSize : 4);
          const openSlots = Math.max(0, maxSquadSize - teamMembersList.length);
          const leaderStudent = students.find(s => s.id === team.leaderId);

          return (
            <div key={team.id} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-md hover:shadow-xl transition-all">

              {/* Team Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-extrabold text-slate-900">{team.name}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border flex items-center gap-1 ${
                      team.status === 'Recruiting'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : team.status === 'Squad Full'
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${team.status === 'Recruiting' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {team.status || 'Recruiting'}
                    </span>

                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                      {teamMembersList.length} / {maxSquadSize} Members ({openSlots} Open)
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                    <span>Competing in:</span>
                    <strong className="text-slate-800">{team.hackathonTitle}</strong>
                    {hackathon?.prizePool && (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 text-[10px]">
                        {hackathon.prizePool}
                      </span>
                    )}
                    {leaderStudent && (
                      <span className="text-indigo-600 font-medium">
                        • Formed by <strong>{leaderStudent.name}</strong>
                      </span>
                    )}
                  </p>
                </div>

                {/* Team Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Leader Specific Settings / Edit Button */}
                  {isLeader && (
                    <button
                      onClick={() => handleOpenEdit(team)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      title="Edit team name, project pitch, required roles, skills, and member slots"
                    >
                      <Settings className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Edit Team & Requirements</span>
                    </button>
                  )}

                  {isMember ? (
                    <>
                      <button
                        onClick={() => onOpenTeamChat(team)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Team Chat & Canvas
                      </button>

                      {onOpenRegistrationPacket && (
                        <button
                          onClick={() => onOpenRegistrationPacket(team)}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 hover:text-indigo-600 border border-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                          title="Export Squad Registration Packet (emails, phones, college, GitHubs) for Unstop and Devpost"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Registration Packet</span>
                        </button>
                      )}

                      <button
                        onClick={() => onLeaveTeam(team.id, currentStudent.id)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 font-semibold text-xs flex items-center gap-1 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {isLeader ? 'Disband / Leave' : 'Leave'}
                      </button>
                    </>
                  ) : (
                    <>
                      {onOpenRegistrationPacket && (
                        <button
                          onClick={() => onOpenRegistrationPacket(team)}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-indigo-600 border border-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                          title="View Squad Registration Roster"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="hidden sm:inline">Roster Packet</span>
                        </button>
                      )}

                      {team.status === 'Squad Full' || openSlots === 0 ? (
                        <span className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          Roster Full
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestToJoin(team)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                        >
                          <UserPlus className="w-4 h-4" />
                          Send Join Request
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Project Mission / Pitch (if configured by leader) */}
              {team.pitch && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed font-sans">
                  <span className="font-bold text-indigo-950 mr-1.5">💡 Project Pitch / Mission:</span>
                  {team.pitch}
                </div>
              )}

              {/* Squad Canvas Quick Info & Milestone Roadmap Summary */}
              {((team.milestones && team.milestones.length > 0) || (team.projectLinks && Object.values(team.projectLinks).some(Boolean))) && (
                <div className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs">
                  {/* Milestones Progress */}
                  {team.milestones && team.milestones.length > 0 && (
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-bold text-slate-700">Squad Roadmap:</span>
                      <span className="font-mono text-indigo-700 font-bold text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {team.milestones.filter(m => m.completed).length} / {team.milestones.length} Done ({Math.round((team.milestones.filter(m => m.completed).length / team.milestones.length) * 100)}%)
                      </span>
                    </div>
                  )}

                  {/* Pinned Links */}
                  {team.projectLinks && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {team.projectLinks.githubRepo && (
                        <a
                          href={team.projectLinks.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <GithubIcon className="w-3 h-3 text-slate-900" /> Repo
                        </a>
                      )}
                      {team.projectLinks.figmaUrl && (
                        <a
                          href={team.projectLinks.figmaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-purple-700 hover:text-purple-900 text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Share2 className="w-3 h-3 text-purple-600" /> Figma
                        </a>
                      )}
                      {team.projectLinks.liveDemoUrl && (
                        <a
                          href={team.projectLinks.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-emerald-700 hover:text-emerald-900 text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Globe className="w-3 h-3 text-emerald-600" /> Demo
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Leader's Configured Requirements Section */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">

                {/* Open Roles Needed */}
                {team.lookingForRoles && team.lookingForRoles.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Roles Needed in Team ({team.lookingForRoles.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {team.lookingForRoles.map((role, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-white text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          <span>{role}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Tech Stack */}
                {team.requiredSkills && team.requiredSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Target Tech Stack:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {team.requiredSkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-white text-slate-700 font-medium text-xs border border-slate-200 shadow-sm"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commitment & Working Preferences Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200/60 font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Experience: <strong className="text-slate-800">{team.minExperience || 'Open to All'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Commitment: <strong className="text-slate-800">{team.timeCommitment || 'Weekend Sprint'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:justify-end">
                    <Globe className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>Mode: <strong className="text-slate-800">{team.workingMode || 'Online'}</strong></span>
                  </div>
                </div>

                {/* Custom Leader Note */}
                {team.requirementsNote && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs text-amber-900 space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5 text-[11px] text-amber-800">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Leader's Custom Prerequisites Note:</span>
                    </div>
                    <p className="text-slate-700 font-medium pl-5">{team.requirementsNote}</p>
                  </div>
                )}

              </div>

              {/* Skill Gap Analysis Widget */}
              <SkillGapBadge
                requiredSkills={team.requiredSkills && team.requiredSkills.length > 0 ? team.requiredSkills : (hackathon ? hackathon.requiredSkills : [])}
                teamMembers={teamMembersList}
              />

              {/* Roster of Team Members */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
                  <span>Current Roster ({teamMembersList.length} / {maxSquadSize} Members):</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {openSlots > 0 ? `${openSlots} Open Slot${openSlots > 1 ? 's' : ''}` : 'Roster Full'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {teamMembersList.map(member => (
                    <div key={member.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center space-x-3 shadow-sm">
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200" />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                          {member.name}
                          {member.id === team.leaderId && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                              ★ Leader
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate font-medium">
                          {member.preferredRole || (member.preferredRoles ? member.preferredRoles.join(', ') : 'Dev')}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty Slot Placeholders */}
                  {Array.from({ length: Math.min(openSlots, 3) }, (_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="p-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 flex items-center justify-center text-xs text-slate-400 font-medium gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                      <span>Open Slot ({team.lookingForRoles?.[i] || 'Teammate'})</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        }))}
      </div>

      {/* Team Configuration & Requirements Modal (Used for both Create and Edit) */}
      <TeamConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedTeamToEdit(null);
        }}
        onSubmit={handleConfigModalSubmit}
        initialTeam={selectedTeamToEdit}
        hackathons={hackathons}
        currentStudent={currentStudent}
      />

    </div>
  );
}
