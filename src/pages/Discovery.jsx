import React, { useState, useMemo } from 'react';
import { Users, Filter, Sparkles, Code, Cpu, Trophy, Search, UserPlus, CheckCircle, ShieldCheck } from 'lucide-react';
import StudentCard from '../components/StudentCard';
import SkillGapBadge from '../components/SkillGapBadge';
import { calculateStudentCompatibility, calculateJaccardSimilarity } from '../dsa/similarity.js';
import { MaxHeap } from '../dsa/maxHeap.js';

export default function Discovery({
  students,
  currentStudent,
  teams,
  hackathons,
  userMode,
  selectedHackathonId,
  setSelectedHackathonId,
  onInviteStudent,
  onSendJoinRequest,
  openLoginModal
}) {

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [topKCount, setTopKCount] = useState(5);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const selectedHackathon = useMemo(() => {
    return hackathons.find(h => h.id === selectedHackathonId) || null;
  }, [hackathons, selectedHackathonId]);

  // MODE A: Recruiter searching for candidates open for team
  const { rankedMatches, totalCandidates } = useMemo(() => {
    if (userMode !== 'RECRUITING') return { rankedMatches: [], totalCandidates: 0 };

    let candidates = students.filter(s => s.id !== (currentStudent ? currentStudent.id : ''));

    // Filter by role
    if (roleFilter !== 'ALL') {
      candidates = candidates.filter(s => {
        const roles = Array.isArray(s.preferredRoles) ? s.preferredRoles : [s.preferredRole];
        return roles.includes(roleFilter);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      candidates = candidates.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.college && s.college.toLowerCase().includes(q)) ||
        (s.branch && s.branch.toLowerCase().includes(q)) ||
        s.skills.some(sk => sk.toLowerCase().includes(q))
      );
    }

    // Insert into Max Heap Priority Queue
    const heap = new MaxHeap();
    candidates.forEach(candidate => {
      const matchResult = calculateStudentCompatibility(currentStudent, candidate, selectedHackathon);
      heap.insert({ candidate, matchResult }, matchResult.compositeScore);
    });

    const topHeapNodes = heap.getTopK(topKCount);
    const matches = topHeapNodes.map(node => ({
      student: node.data.candidate,
      matchResult: node.data.matchResult,
      priorityKey: node.priorityKey
    }));

    return {
      rankedMatches: matches,
      totalCandidates: candidates.length
    };
  }, [students, currentStudent, selectedHackathon, roleFilter, searchQuery, topKCount, userMode]);

  // MODE B: Talent searching for Recruiting Teams (excludes squads already joined by current user)
  const rankedTeams = useMemo(() => {
    if (userMode !== 'OPEN_FOR_TEAM') return [];

    let recruitingTeams = teams.filter(t => {
      const isJoined = currentStudent && (
        (Array.isArray(t.members) && t.members.includes(currentStudent.id)) ||
        t.leaderId === currentStudent.id
      );
      return t.status === 'Recruiting' && !isJoined;
    });

    if (selectedHackathonId) {
      recruitingTeams = recruitingTeams.filter(t => t.hackathonId === selectedHackathonId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      recruitingTeams = recruitingTeams.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.hackathonTitle.toLowerCase().includes(q)
      );
    }

    return recruitingTeams.map(t => {
      const hackathon = hackathons.find(h => h.id === t.hackathonId);
      const reqSkills = (t.requiredSkills && t.requiredSkills.length > 0)
        ? t.requiredSkills
        : (hackathon ? hackathon.requiredSkills : []);
      const studentSkills = currentStudent ? currentStudent.skills : [];
      const jaccard = calculateJaccardSimilarity(studentSkills, reqSkills);

      return {
        team: t,
        hackathon,
        jaccardScore: jaccard.score,
        matchPercentage: Math.round(jaccard.score * 100),
        intersection: jaccard.intersection
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [teams, hackathons, currentStudent, searchQuery, userMode, selectedHackathonId]);

  const handleRequestJoin = (team) => {
    if (!currentStudent) {
      if (openLoginModal) openLoginModal();
      else alert('Please log in or sign up first!');
      return;
    }
    onSendJoinRequest(team, currentStudent);
    setFeedbackMsg(`Join request sent to ${team.name}'s leader! Awaiting approval in their Invites box.`);
  };


  return (
    <div className="space-y-6 animate-fadeIn font-sans">

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-800">✕</button>
        </div>
      )}

      {/* Top Header Banner - Bright White Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" /> MAX-HEAP & JACCARD MATCH ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {userMode === 'RECRUITING' ? 'Teammate Discovery & Ranking' : 'Explore Recruiting Hackathon Teams'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {userMode === 'RECRUITING'
              ? `Finding open candidate matches for ${currentStudent ? currentStudent.name : 'your squad'}`
              : `Showing hackathon teams matching ${currentStudent ? currentStudent.name : 'your profile'}`}
          </p>
        </div>

        {/* Hackathon Context Filter */}
        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-sm">
          <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div className="text-xs font-bold text-slate-700">Hackathon:</div>
          <select
            value={selectedHackathonId || ''}
            onChange={(e) => setSelectedHackathonId(e.target.value || null)}
            className="bg-white text-xs text-slate-900 font-semibold rounded-xl px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-indigo-600 shadow-sm cursor-pointer"
          >
            <option value="">All Hackathons</option>
            {hackathons.map(h => (
              <option key={h.id} value={h.id}>{h.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Control Bar: Filters & Search - Bright White Theme */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={userMode === 'RECRUITING' ? "Search by skill (React, Python), college, or name..." : "Search team name or hackathon..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
          />
        </div>

        {userMode === 'RECRUITING' && (
          <>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 text-xs text-slate-900 font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 shadow-sm cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="UI/UX">UI/UX Designer</option>
                <option value="AI/ML">AI / ML Engineer</option>
                <option value="Fullstack">Fullstack</option>
              </select>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 shadow-sm">
              <span className="font-bold">Top K:</span>
              <select
                value={topKCount}
                onChange={(e) => setTopKCount(parseInt(e.target.value))}
                className="bg-white text-indigo-700 font-bold px-2.5 py-0.5 rounded-lg border border-slate-300 focus:outline-none"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* RECRUITER VIEW: Candidate Cards Grid */}
      {userMode === 'RECRUITING' && (
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-xs font-mono flex items-center justify-between text-indigo-900 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Extracted Top-{topKCount} Candidates from <strong className="text-indigo-950 font-extrabold">{totalCandidates}</strong> student vectors via Max-Heap.</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-bold">O(N + K log N)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rankedMatches.map(({ student, matchResult }) => (
              <StudentCard
                key={student.id}
                student={student}
                matchResult={matchResult}
                onInvite={onInviteStudent}
              />
            ))}
          </div>
        </div>
      )}

      {/* OPEN FOR TEAM VIEW: Recruiting Teams Grid */}
      {userMode === 'OPEN_FOR_TEAM' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs font-mono flex items-center justify-between text-emerald-900 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Matching teams ordered by Jaccard Skill Overlap with your profile.</span>
            </div>
          </div>

          {rankedTeams.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">No Other Recruiting Squads Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {currentStudent
                  ? "All active recruiting squads are either already joined by you, or no other teams are currently seeking teammates for this hackathon."
                  : "No recruiting teams available matching this filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rankedTeams.map(({ team, hackathon, matchPercentage }) => {
                const teamMembersList = students.filter(s => team.members.includes(s.id));

                return (
                  <div key={team.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">{team.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{team.hackathonTitle}</p>
                      </div>

                      <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono whitespace-nowrap">
                        {matchPercentage}% Skill Match
                      </div>
                    </div>

                    {/* Team Pitch */}
                    {team.pitch && (
                      <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <strong className="text-slate-800">Mission:</strong> {team.pitch}
                      </p>
                    )}

                    {/* Open Roles Needed */}
                    {team.lookingForRoles && team.lookingForRoles.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Leader is looking for:</div>
                        <div className="flex flex-wrap gap-1">
                          {team.lookingForRoles.map((role, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prerequisites Note */}
                    {team.requirementsNote && (
                      <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                        <span className="font-bold">Prerequisite:</span> {team.requirementsNote}
                      </div>
                    )}

                    <SkillGapBadge
                      requiredSkills={team.requiredSkills && team.requiredSkills.length > 0 ? team.requiredSkills : (hackathon ? hackathon.requiredSkills : [])}
                      teamMembers={teamMembersList}
                    />

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleRequestJoin(team)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <UserPlus className="w-4 h-4" /> Send Join Request
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
