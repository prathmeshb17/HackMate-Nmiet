import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  Users,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Save,
  Share2,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './BrandIcons.jsx';

export default function SquadRegistrationPacketModal({
  isOpen,
  onClose,
  team,
  teamMembers = [],
  hackathon,
  currentStudent,
  onUpdateStudent,
  onUpdateTeam
}) {
  if (!isOpen || !team) return null;

  const [activeTab, setActiveTab] = useState('members'); // 'members', 'unstop', 'devpost', 'audit'
  const [copiedFieldKey, setCopiedFieldKey] = useState(null);
  const [globalCopiedType, setGlobalCopiedType] = useState(null); // 'unstop', 'devpost', 'emails', 'csv'
  const [isEditingMyDetails, setIsEditingMyDetails] = useState(false);

  // Editable fields for current student in-place
  const myMemberObj = teamMembers.find(m => m.id === currentStudent?.id) || currentStudent;
  const [myDetails, setMyDetails] = useState({
    name: myMemberObj?.name || '',
    email: myMemberObj?.email || `${(myMemberObj?.name || 'student').toLowerCase().replace(/\s+/g, '.')}@college.edu`,
    college: myMemberObj?.college || 'National Engineering College',
    phone: myMemberObj?.phone || '+91 98765 43210',
    github: myMemberObj?.github || `https://github.com/${(myMemberObj?.name || 'developer').toLowerCase().replace(/\s+/g, '')}`,
    linkedin: myMemberObj?.linkedin || `https://linkedin.com/in/${(myMemberObj?.name || 'developer').toLowerCase().replace(/\s+/g, '')}`,
    resume: myMemberObj?.resume || 'https://drive.google.com/file/d/sample-resume/view'
  });

  const handleCopyText = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedFieldKey(key);
    setTimeout(() => {
      setCopiedFieldKey(null);
    }, 2000);
  };

  const getMemberData = (member) => {
    const isMe = member.id === currentStudent?.id;
    const name = member.name || 'Hacker';
    const cleanHandle = name.toLowerCase().replace(/\s+/g, '');

    return {
      id: member.id,
      name,
      role: member.preferredRole || (member.preferredRoles ? member.preferredRoles[0] : 'Developer'),
      email: isMe && isEditingMyDetails ? myDetails.email : (member.email || `${cleanHandle}@college.edu`),
      college: isMe && isEditingMyDetails ? myDetails.college : (member.college || 'Engineering Institute'),
      phone: isMe && isEditingMyDetails ? myDetails.phone : (member.phone || ''),
      github: isMe && isEditingMyDetails ? myDetails.github : (member.github || `https://github.com/${cleanHandle}`),
      linkedin: isMe && isEditingMyDetails ? myDetails.linkedin : (member.linkedin || `https://linkedin.com/in/${cleanHandle}`),
      resume: isMe && isEditingMyDetails ? myDetails.resume : (member.resume || ''),
      skills: member.skills || [],
      isLeader: member.id === team.leaderId
    };
  };

  const resolvedMembers = teamMembers.map(getMemberData);

  // Generate Unstop Form Bundle text
  const generateUnstopBundle = () => {
    let output = `====================================================\n`;
    output += `🏆 UNSTOP TEAM REGISTRATION PACKET\n`;
    output += `====================================================\n`;
    output += `Hackathon: ${team.hackathonTitle}\n`;
    output += `Team Name: ${team.name}\n`;
    output += `Squad Size: ${resolvedMembers.length} Members\n`;
    if (team.pitch) output += `Project Pitch: ${team.pitch}\n`;
    output += `\n--- TEAM ROSTER DETAILS ---\n\n`;

    resolvedMembers.forEach((m, idx) => {
      output += `[MEMBER ${idx + 1}: ${m.isLeader ? 'TEAM LEADER' : m.role.toUpperCase()}]\n`;
      output += `Full Name: ${m.name}\n`;
      output += `Role: ${m.role}\n`;
      output += `Email: ${m.email}\n`;
      output += `College/Institute: ${m.college}\n`;
      if (m.phone) output += `Contact Phone: ${m.phone}\n`;
      if (m.github) output += `GitHub: ${m.github}\n`;
      if (m.linkedin) output += `LinkedIn: ${m.linkedin}\n`;
      if (m.resume) output += `Resume / Portfolio: ${m.resume}\n`;
      if (m.skills?.length > 0) output += `Key Skills: ${m.skills.join(', ')}\n`;
      output += `\n`;
    });

    output += `====================================================\n`;
    output += `Generated via HackMate Team Formation Engine\n`;
    return output;
  };

  // Generate Devpost Form Bundle text
  const generateDevpostBundle = () => {
    let output = `====================================================\n`;
    output += `🚀 DEVPOST SUBMISSION & TEAM PACKET\n`;
    output += `====================================================\n`;
    output += `Project Title: ${team.name} Solution\n`;
    output += `Hackathon: ${team.hackathonTitle}\n`;
    output += `Elevator Pitch: ${team.pitch || 'A modern solution built for ' + team.hackathonTitle}\n`;
    if (team.projectLinks?.githubRepo) output += `GitHub Repo: ${team.projectLinks.githubRepo}\n`;
    if (team.projectLinks?.figmaUrl) output += `Figma Board: ${team.projectLinks.figmaUrl}\n`;
    if (team.projectLinks?.liveDemoUrl) output += `Live Demo URL: ${team.projectLinks.liveDemoUrl}\n`;
    output += `\n--- TEAM MEMBERS TO INVITE ---\n`;
    resolvedMembers.forEach(m => {
      output += `• ${m.name} (${m.role}) - Email: ${m.email} - GitHub: ${m.github}\n`;
    });
    output += `====================================================\n`;
    return output;
  };

  // Generate CSV download
  const handleDownloadCsv = () => {
    const headers = ['Role', 'Full Name', 'Email', 'College', 'Phone', 'GitHub', 'LinkedIn', 'Resume', 'Skills'];
    const rows = resolvedMembers.map(m => [
      m.isLeader ? 'Leader' : m.role,
      `"${m.name}"`,
      `"${m.email}"`,
      `"${m.college}"`,
      `"${m.phone}"`,
      `"${m.github}"`,
      `"${m.linkedin}"`,
      `"${m.resume}"`,
      `"${m.skills.join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${team.name.replace(/\s+/g, '_')}_Registration_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setGlobalCopiedType('csv');
    setTimeout(() => setGlobalCopiedType(null), 2500);
  };

  // Copy Comma Separated Emails
  const handleCopyAllEmails = () => {
    const emails = resolvedMembers.map(m => m.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emails);
    setGlobalCopiedType('emails');
    setTimeout(() => setGlobalCopiedType(null), 2000);
  };

  const handleCopyUnstopBundle = () => {
    navigator.clipboard.writeText(generateUnstopBundle());
    setGlobalCopiedType('unstop');
    setTimeout(() => setGlobalCopiedType(null), 2000);
  };

  const handleCopyDevpostBundle = () => {
    navigator.clipboard.writeText(generateDevpostBundle());
    setGlobalCopiedType('devpost');
    setTimeout(() => setGlobalCopiedType(null), 2000);
  };

  const handleSaveMyDetails = () => {
    if (onUpdateStudent && currentStudent) {
      onUpdateStudent({
        ...currentStudent,
        name: myDetails.name,
        email: myDetails.email,
        college: myDetails.college,
        phone: myDetails.phone,
        github: myDetails.github,
        linkedin: myDetails.linkedin,
        resume: myDetails.resume
      });
    }
    setIsEditingMyDetails(false);
  };

  // Readiness Calculations
  const hasMinMembers = resolvedMembers.length >= 2;
  const emailsProvided = resolvedMembers.filter(m => m.email && m.email.includes('@')).length;
  const collegesProvided = resolvedMembers.filter(m => m.college && m.college.length > 2).length;
  const phonesProvided = resolvedMembers.filter(m => m.phone && m.phone.length > 5).length;
  const githubsProvided = resolvedMembers.filter(m => m.github && m.github.includes('github.com')).length;
  const pitchReady = Boolean(team.pitch && team.pitch.trim().length > 10);

  const checklistItems = [
    { label: 'Minimum 2 Squad Members Joined', passed: hasMinMembers, count: `${resolvedMembers.length} members` },
    { label: 'All Teammates have Verified Emails', passed: emailsProvided === resolvedMembers.length, count: `${emailsProvided}/${resolvedMembers.length}` },
    { label: 'All Teammates have College / Institute set', passed: collegesProvided === resolvedMembers.length, count: `${collegesProvided}/${resolvedMembers.length}` },
    { label: 'GitHub Profiles configured for Code Review', passed: githubsProvided === resolvedMembers.length, count: `${githubsProvided}/${resolvedMembers.length}` },
    { label: 'Emergency Contact Phone Numbers ready', passed: phonesProvided === resolvedMembers.length, count: `${phonesProvided}/${resolvedMembers.length}` },
    { label: 'Project Mission / Pitch prepared', passed: pitchReady, count: pitchReady ? 'Ready' : 'Not set' }
  ];

  const passedCount = checklistItems.filter(i => i.passed).length;
  const readinessPercent = Math.round((passedCount / checklistItems.length) * 100);

  const registrationLink = hackathon?.url || team.hackathonUrl || '#';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-900">

        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">1-Click Squad Registration Packet</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {team.name}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {readinessPercent}% Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>Target:</span>
                <strong className="text-slate-800">{team.hackathonTitle}</strong>
                {hackathon?.platform && (
                  <span className="text-[10px] font-mono uppercase bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                    {hackathon.platform}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {registrationLink !== '#' && (
              <a
                href={registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Open official hackathon registration page"
              >
                <span>Open Official Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global 1-Click Fast Actions Bar */}
        <div className="px-6 py-3 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="hidden sm:inline">Instant Clipboard Form Bundles:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyAllEmails}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title="Copy all member emails separated by commas for Unstop invite field"
            >
              {globalCopiedType === 'emails' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Emails Copied!</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Copy All Emails</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyUnstopBundle}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
              title="Copy complete pre-formatted Unstop team registration block"
            >
              {globalCopiedType === 'unstop' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Unstop Packet Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Unstop Bundle</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyDevpostBundle}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title="Copy Devpost project and team invitation format"
            >
              {globalCopiedType === 'devpost' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Devpost Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Copy Devpost Bundle</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
              title="Download CSV spreadsheet of all member records"
            >
              {globalCopiedType === 'csv' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>CSV Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .CSV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center space-x-1 sm:space-x-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Member Cards ({resolvedMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('unstop')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'unstop'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Unstop Pre-Fill Template</span>
          </button>

          <button
            onClick={() => setActiveTab('devpost')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'devpost'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Devpost Pre-Fill</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Submission Audit ({readinessPercent}%)</span>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">

          {/* TAB 1: MEMBER CARDS & FIELD-BY-FIELD COPY */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-slate-500">
                  Every field includes a 1-click clipboard button so you never have to retype information into Unstop or Devpost forms.
                </p>

                {myMemberObj && (
                  <button
                    onClick={() => setIsEditingMyDetails(!isEditingMyDetails)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isEditingMyDetails ? 'Close My Editor' : 'Edit My Details'}</span>
                  </button>
                )}
              </div>

              {/* In-place current student profile editor if toggled */}
              {isEditingMyDetails && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Update Your Registration Details (Auto-Saves to Profile)</span>
                    </div>
                    <button
                      onClick={handleSaveMyDetails}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm shadow-indigo-500/20"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={myDetails.name}
                        onChange={e => setMyDetails({ ...myDetails, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Email (Official / College)</label>
                      <input
                        type="email"
                        value={myDetails.email}
                        onChange={e => setMyDetails({ ...myDetails, email: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">College / University</label>
                      <input
                        type="text"
                        value={myDetails.college}
                        onChange={e => setMyDetails({ ...myDetails, college: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={myDetails.phone}
                        onChange={e => setMyDetails({ ...myDetails, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">GitHub Profile URL</label>
                      <input
                        type="text"
                        value={myDetails.github}
                        onChange={e => setMyDetails({ ...myDetails, github: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Resume / Portfolio URL</label>
                      <input
                        type="text"
                        value={myDetails.resume}
                        onChange={e => setMyDetails({ ...myDetails, resume: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Member Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolvedMembers.map((member, idx) => {
                  const isMe = member.id === currentStudent?.id;

                  return (
                    <div
                      key={member.id || idx}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-indigo-200 transition-all space-y-3"
                    >
                      {/* Member Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-extrabold text-slate-900">{member.name}</h4>
                              {member.isLeader && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                  Leader
                                </span>
                              )}
                              {isMe && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-indigo-600 font-semibold">{member.role}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopyText(
                            `${member.name} | ${member.role} | Email: ${member.email} | College: ${member.college} | GitHub: ${member.github} | Phone: ${member.phone}`,
                            `full-${member.id}`
                          )}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Copy full member summary"
                        >
                          {copiedFieldKey === `full-${member.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy All</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Field Rows with 1-Click Copy */}
                      <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 font-mono">

                        {/* Email */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            Email:
                          </span>
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-slate-900 truncate font-sans text-xs">{member.email}</span>
                            <button
                              onClick={() => handleCopyText(member.email, `email-${member.id}`)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                              title="Copy email"
                            >
                              {copiedFieldKey === `email-${member.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* College */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <GraduationCap className="w-3 h-3 text-slate-400" />
                            College:
                          </span>
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-slate-900 truncate font-sans text-xs">{member.college}</span>
                            <button
                              onClick={() => handleCopyText(member.college, `college-${member.id}`)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                              title="Copy college"
                            >
                              {copiedFieldKey === `college-${member.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            Phone:
                          </span>
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-slate-900 truncate font-sans text-xs">
                              {member.phone || <span className="text-slate-400 font-sans italic">Not provided</span>}
                            </span>
                            {member.phone && (
                              <button
                                onClick={() => handleCopyText(member.phone, `phone-${member.id}`)}
                                className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                                title="Copy phone"
                              >
                                {copiedFieldKey === `phone-${member.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* GitHub */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <GithubIcon className="w-3 h-3 text-slate-400" />
                            GitHub:
                          </span>
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <a
                              href={member.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline truncate font-sans text-xs"
                            >
                              {member.github.replace('https://', '')}
                            </a>
                            <button
                              onClick={() => handleCopyText(member.github, `github-${member.id}`)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                              title="Copy github link"
                            >
                              {copiedFieldKey === `github-${member.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Resume / Portfolio */}
                        {member.resume && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <FileText className="w-3 h-3 text-slate-400" />
                              Resume:
                            </span>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <a
                                href={member.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline truncate font-sans text-xs"
                              >
                                View Resume
                              </a>
                              <button
                                onClick={() => handleCopyText(member.resume, `resume-${member.id}`)}
                                className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                                title="Copy resume url"
                              >
                                {copiedFieldKey === `resume-${member.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Skills Chips */}
                      {member.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {member.skills.slice(0, 5).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 5 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px]">
                              +{member.skills.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UNSTOP PRE-FILL TEMPLATE */}
          {activeTab === 'unstop' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Unstop Team Registration Text Block</h3>
                  <p className="text-xs text-slate-500">
                    Formatted text bundle ready to copy and paste directly into Unstop's team registration notes or confirmation email.
                  </p>
                </div>
                <button
                  onClick={handleCopyUnstopBundle}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  {globalCopiedType === 'unstop' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Unstop Template</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={14}
                  value={generateUnstopBundle()}
                  className="w-full bg-slate-900 text-emerald-300 font-mono text-xs p-4 rounded-2xl border border-slate-700 focus:outline-none select-all leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Pro-Tip for Unstop Registration:</span>
                </div>
                <p>
                  When Unstop asks you to "Invite Team Members by Email", use the <strong>"Copy All Emails"</strong> button in the top bar to paste all emails at once instead of typing them one by one.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DEVPOST PRE-FILL TEMPLATE */}
          {activeTab === 'devpost' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Devpost Submission & Team Packet</h3>
                  <p className="text-xs text-slate-500">
                    Standardized format for Devpost hackathon project submissions, collaborator invites, and repo references.
                  </p>
                </div>
                <button
                  onClick={handleCopyDevpostBundle}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  {globalCopiedType === 'devpost' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Devpost Template</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={14}
                  value={generateDevpostBundle()}
                  className="w-full bg-slate-900 text-indigo-200 font-mono text-xs p-4 rounded-2xl border border-slate-700 focus:outline-none select-all leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SUBMISSION READINESS AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Official Submission Readiness Audit</h3>
                <p className="text-xs text-slate-500">
                  Pre-flight verification ensuring your squad has all mandatory information before submitting to {hackathon?.platform || 'Unstop / Devpost'}.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Audit Completion Score</span>
                  <span className="text-xs font-mono font-extrabold text-indigo-600">{readinessPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      readinessPercent >= 80 ? 'bg-emerald-500' : readinessPercent >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${readinessPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {readinessPercent === 100
                    ? '🎉 Your squad is 100% ready for official registration! No missing fields.'
                    : `⚠️ ${checklistItems.length - passedCount} requirement(s) pending before submission.`}
                </p>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      item.passed
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] opacity-75 font-mono">{item.count}</div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      item.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.passed ? 'READY' : 'ACTION REQUIRED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500">
            Squad: <strong className="text-slate-800">{team.name}</strong> • {resolvedMembers.length} verified members
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopyUnstopBundle}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Packet</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
