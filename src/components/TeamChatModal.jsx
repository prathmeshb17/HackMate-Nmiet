import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Users,
  Sparkles,
  Code,
  Layout,
  ListTodo,
  Globe,
  Presentation,
  FileCode,
  ExternalLink,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Edit3,
  Save,
  Plus,
  Trash2,
  FileSpreadsheet,
  Columns,
  Share2
} from 'lucide-react';
import { GithubIcon } from './BrandIcons.jsx';

const DEFAULT_MILESTONES = [
  { id: 'm1', title: '🎯 Finalize Problem Statement & Architecture', completed: false },
  { id: 'm2', title: '🎨 UI/UX Wireframing in Figma', completed: false },
  { id: 'm3', title: '⚙️ Core Backend API & Database Schema', completed: false },
  { id: 'm4', title: '💻 Frontend UI connected to Backend', completed: false },
  { id: 'm5', title: '📹 Demo Video & Pitch Deck Slides', completed: false },
  { id: 'm6', title: '🚀 Official Hackathon Submission on Unstop/Devpost', completed: false }
];

export default function TeamChatModal({
  isOpen,
  onClose,
  team,
  currentStudent,
  teamMembers = [],
  messages = [],
  onSendMessage,
  onUpdateTeam,
  onOpenRegistrationPacket
}) {
  if (!isOpen || !team) return null;

  // View state: 'chat', 'canvas', or 'split'
  const [activeView, setActiveView] = useState('split'); // on wide screens default to split
  const [inputMessage, setInputMessage] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Canvas State
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [copiedLinkKey, setCopiedLinkKey] = useState(null);
  const [newMilestoneInput, setNewMilestoneInput] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const projectLinks = team.projectLinks || {
    githubRepo: '',
    figmaUrl: '',
    presentationUrl: '',
    liveDemoUrl: '',
    problemDoc: ''
  };

  const [linksForm, setLinksForm] = useState({
    githubRepo: projectLinks.githubRepo || '',
    figmaUrl: projectLinks.figmaUrl || '',
    presentationUrl: projectLinks.presentationUrl || '',
    liveDemoUrl: projectLinks.liveDemoUrl || '',
    problemDoc: projectLinks.problemDoc || ''
  });

  const [canvasNotes, setCanvasNotes] = useState(team.canvasNotes || team.pitch || '');
  const milestones = Array.isArray(team.milestones) && team.milestones.length > 0
    ? team.milestones
    : DEFAULT_MILESTONES;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeView]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    onSendMessage(team.id, {
      id: `msg-${Date.now()}`,
      senderId: currentStudent.id,
      senderName: currentStudent.name,
      senderAvatar: currentStudent.avatar,
      senderRole: currentStudent.preferredRole || (currentStudent.preferredRoles ? currentStudent.preferredRoles[0] : 'Dev'),
      text: inputMessage.trim(),
      isCode: isCodeMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setInputMessage('');
    setIsCodeMode(false);
  };

  const handleSaveLinks = () => {
    const updatedTeam = {
      ...team,
      projectLinks: { ...linksForm }
    };
    if (onUpdateTeam) onUpdateTeam(updatedTeam);

    if (onSendMessage) {
      onSendMessage(team.id, {
        id: `sys-${Date.now()}`,
        isSystem: true,
        text: `⚡ ${currentStudent.name} updated the squad's project links!`
      });
    }
    setIsEditingLinks(false);
  };

  const handleSaveNotes = () => {
    const updatedTeam = {
      ...team,
      canvasNotes
    };
    if (onUpdateTeam) onUpdateTeam(updatedTeam);

    if (onSendMessage) {
      onSendMessage(team.id, {
        id: `sys-${Date.now()}`,
        isSystem: true,
        text: `⚡ ${currentStudent.name} updated the squad project scratchpad notes!`
      });
    }
    setIsEditingNotes(false);
  };

  const handleToggleMilestone = (mId) => {
    const nextMilestones = milestones.map(m => {
      if (m.id === mId) {
        const nextDone = !m.completed;
        return {
          ...m,
          completed: nextDone,
          completedBy: nextDone ? currentStudent.name : null,
          completedAt: nextDone ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
        };
      }
      return m;
    });

    const targetM = nextMilestones.find(m => m.id === mId);
    const updatedTeam = {
      ...team,
      milestones: nextMilestones
    };

    if (onUpdateTeam) onUpdateTeam(updatedTeam);

    if (onSendMessage) {
      onSendMessage(team.id, {
        id: `sys-${Date.now()}`,
        isSystem: true,
        text: `⚡ ${currentStudent.name} ${targetM.completed ? 'completed milestone' : 'reopened'}: "${targetM.title}"`
      });
    }
  };

  const handleAddCustomMilestone = (e) => {
    e.preventDefault();
    if (!newMilestoneInput.trim()) return;

    const newM = {
      id: `m-${Date.now()}`,
      title: newMilestoneInput.trim(),
      completed: false
    };

    const nextMilestones = [...milestones, newM];
    const updatedTeam = {
      ...team,
      milestones: nextMilestones
    };

    if (onUpdateTeam) onUpdateTeam(updatedTeam);

    if (onSendMessage) {
      onSendMessage(team.id, {
        id: `sys-${Date.now()}`,
        isSystem: true,
        text: `⚡ ${currentStudent.name} added a new squad milestone: "${newM.title}"`
      });
    }

    setNewMilestoneInput('');
    setShowAddMilestone(false);
  };

  const handleDeleteMilestone = (mId) => {
    const nextMilestones = milestones.filter(m => m.id !== mId);
    const updatedTeam = {
      ...team,
      milestones: nextMilestones
    };
    if (onUpdateTeam) onUpdateTeam(updatedTeam);
  };

  const handleCopyLink = (url, key) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLinkKey(key);
    setTimeout(() => setCopiedLinkKey(null), 2000);
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercent = Math.round((completedCount / (milestones.length || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-900">

        {/* Top Header */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-slate-900">{team.name} Squad Hub</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Team Active
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {completedCount}/{milestones.length} Milestones ({progressPercent}%)
                </span>
              </div>
              <p className="text-xs text-slate-500">Competing in: <strong className="text-slate-700">{team.hackathonTitle}</strong></p>
            </div>
          </div>

          {/* Header Action Buttons & View Mode Toggles */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* 1-Click Registration Packet Button */}
            {onOpenRegistrationPacket && (
              <button
                onClick={() => onOpenRegistrationPacket(team)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-indigo-600 border border-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                title="Open 1-Click Squad Registration Packet for Unstop & Devpost"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Registration Packet</span>
              </button>
            )}

            {/* View Mode Switcher */}
            <div className="bg-slate-200/70 p-1 rounded-xl flex items-center space-x-1 text-xs font-bold">
              <button
                onClick={() => setActiveView('chat')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeView === 'chat'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Show only Chat"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Chat</span>
              </button>

              <button
                onClick={() => setActiveView('split')}
                className={`hidden lg:flex px-2.5 py-1 rounded-lg items-center gap-1 transition-all ${
                  activeView === 'split'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Split View: Chat + Project Canvas Side-by-Side"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>

              <button
                onClick={() => setActiveView('canvas')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeView === 'canvas'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Show Project Canvas & Milestones"
              >
                <Layout className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Canvas</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Container */}
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT CHAT PANE (Rendered if 'chat' or 'split') */}
          {(activeView === 'chat' || activeView === 'split') && (
            <div className={`flex flex-col h-full border-r border-slate-200 ${activeView === 'split' ? 'w-full lg:w-1/2' : 'w-full'}`}>

              {/* Chat Body */}
              <div className="flex-1 flex overflow-hidden">

                {/* Left Mini Roster (hidden on mobile or split view to save space) */}
                {activeView === 'chat' && (
                  <div className="hidden sm:flex flex-col w-48 bg-slate-50/60 border-r border-slate-200 p-3 space-y-3 flex-shrink-0">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      Roster ({teamMembers.length})
                    </div>

                    <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                      {teamMembers.map(member => (
                        <div key={member.id} className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center space-x-2">
                          <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-lg object-cover" />
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                              {member.name}
                              {member.id === team.leaderId && <span className="text-[9px] text-amber-500 font-bold">★</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">{member.preferredRole || 'Dev'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages Stream */}
                <div className="flex-1 flex flex-col bg-white p-4 overflow-y-auto space-y-3.5">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-indigo-100 text-center space-y-1">
                    <Sparkles className="w-4 h-4 text-indigo-600 mx-auto" />
                    <div className="text-xs font-bold text-slate-900">Welcome to #{team.name.toLowerCase().replace(/\s+/g, '')}</div>
                    <p className="text-[11px] text-slate-600">
                      Collaborate in real-time. Share code snippets and track hackathon milestones on the project canvas!
                    </p>
                  </div>

                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentStudent.id;

                    if (msg.isSystem) {
                      return (
                        <div key={msg.id || idx} className="py-1 text-center">
                          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-semibold text-indigo-800">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
                      >
                        <img src={msg.senderAvatar} alt={msg.senderName} className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 mt-0.5" />

                        <div className={`max-w-[78%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isMe ? 'justify-end' : ''}`}>
                            <span className="font-bold text-slate-900">{msg.senderName}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">{msg.senderRole}</span>
                            <span>{msg.timestamp}</span>
                          </div>

                          <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                            msg.isCode
                              ? 'bg-slate-900 font-mono text-emerald-300 border border-emerald-500/30'
                              : isMe
                              ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/20 font-medium'
                              : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none font-medium'
                          }`}>
                            {msg.isCode && <div className="text-[9px] font-bold text-emerald-400 mb-1 font-mono">// Code Snippet / Link</div>}
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCodeMode(!isCodeMode)}
                  className={`p-2 rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-1 ${
                    isCodeMode
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-600 border border-slate-300 hover:text-slate-900'
                  }`}
                  title="Toggle Code/Link Snippet Mode"
                >
                  <Code className="w-4 h-4" />
                  Code
                </button>

                <input
                  type="text"
                  placeholder={isCodeMode ? "Paste code snippet or repo link..." : `Message #${team.name.toLowerCase().replace(/\s+/g, '')}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-white text-xs text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-sans"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>

            </div>
          )}

          {/* RIGHT PROJECT CANVAS PANE (Rendered if 'canvas' or 'split') */}
          {(activeView === 'canvas' || activeView === 'split') && (
            <div className={`flex flex-col h-full bg-slate-50/60 overflow-y-auto p-4 sm:p-5 space-y-5 ${activeView === 'split' ? 'w-full lg:w-1/2' : 'w-full'}`}>

              {/* Canvas Header & Project Links Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">Essential Hackathon Links</h3>
                  </div>

                  <button
                    onClick={() => setIsEditingLinks(!isEditingLinks)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3 text-indigo-600" />
                    <span>{isEditingLinks ? 'Close Editor' : 'Edit Links'}</span>
                  </button>
                </div>

                {isEditingLinks ? (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs animate-fadeIn">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">GitHub Repository URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/org/repo"
                        value={linksForm.githubRepo}
                        onChange={e => setLinksForm({ ...linksForm, githubRepo: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Figma Wireframe / Design Board URL</label>
                      <input
                        type="url"
                        placeholder="https://figma.com/file/..."
                        value={linksForm.figmaUrl}
                        onChange={e => setLinksForm({ ...linksForm, figmaUrl: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Presentation Deck URL (Google Slides / Canva)</label>
                      <input
                        type="url"
                        placeholder="https://docs.google.com/presentation/..."
                        value={linksForm.presentationUrl}
                        onChange={e => setLinksForm({ ...linksForm, presentationUrl: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Live Demo / Deployment URL</label>
                      <input
                        type="url"
                        placeholder="https://hackmate-demo.vercel.app"
                        value={linksForm.liveDemoUrl}
                        onChange={e => setLinksForm({ ...linksForm, liveDemoUrl: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleSaveLinks}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Links
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">

                    {/* GitHub Link */}
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <GithubIcon className="w-4 h-4 text-slate-900 flex-shrink-0" />
                        <span className="font-bold text-slate-800 truncate">GitHub Repo</span>
                      </div>
                      {projectLinks.githubRepo ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyLink(projectLinks.githubRepo, 'github')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500"
                            title="Copy link"
                          >
                            {copiedLinkKey === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={projectLinks.githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-slate-200 text-indigo-600"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Not set</span>
                      )}
                    </div>

                    {/* Figma Link */}
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Share2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="font-bold text-slate-800 truncate">Figma Board</span>
                      </div>
                      {projectLinks.figmaUrl ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyLink(projectLinks.figmaUrl, 'figma')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500"
                            title="Copy link"
                          >
                            {copiedLinkKey === 'figma' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={projectLinks.figmaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-slate-200 text-purple-600"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Not set</span>
                      )}
                    </div>

                    {/* Presentation Deck */}
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Presentation className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="font-bold text-slate-800 truncate">Slide Deck</span>
                      </div>
                      {projectLinks.presentationUrl ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyLink(projectLinks.presentationUrl, 'slides')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500"
                            title="Copy link"
                          >
                            {copiedLinkKey === 'slides' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={projectLinks.presentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-slate-200 text-amber-600"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Not set</span>
                      )}
                    </div>

                    {/* Live Demo */}
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-bold text-slate-800 truncate">Live Demo</span>
                      </div>
                      {projectLinks.liveDemoUrl ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyLink(projectLinks.liveDemoUrl, 'demo')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500"
                            title="Copy link"
                          >
                            {copiedLinkKey === 'demo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={projectLinks.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-slate-200 text-emerald-600"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Not set</span>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Hackathon Milestones Checklist Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">Hackathon Roadmap & Milestones</h3>
                  </div>

                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {completedCount} of {milestones.length} Done ({progressPercent}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Milestones List */}
                <div className="space-y-2">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMilestone(m.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        m.completed
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${m.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800'}`}>
                          {m.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {m.completed && m.completedBy && (
                          <span className="text-[10px] text-emerald-700 font-mono hidden sm:inline">
                            Done by {m.completedBy}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMilestone(m.id);
                          }}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete milestone"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Milestone */}
                {showAddMilestone ? (
                  <form onSubmit={handleAddCustomMilestone} className="flex items-center gap-2 pt-1 animate-fadeIn">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Integrate payment gateway / Test YOLOv8 model..."
                      value={newMilestoneInput}
                      onChange={e => setNewMilestoneInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddMilestone(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowAddMilestone(true)}
                    className="w-full py-2 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Team Milestone</span>
                  </button>
                )}
              </div>

              {/* Collaborative Squad Scratchpad & Notes */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">Shared Squad Scratchpad</h3>
                  </div>

                  {isEditingNotes ? (
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Save className="w-3 h-3" />
                      Save Notes
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-indigo-600" />
                      Edit Notes
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows={6}
                    value={canvasNotes}
                    onChange={e => setCanvasNotes(e.target.value)}
                    placeholder="Jot down problem statement pitch, architecture details, judge presentation outline, demo credentials, etc..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono leading-relaxed"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed min-h-[90px]">
                    {canvasNotes || (
                      <span className="text-slate-400 italic font-sans">
                        No notes yet. Click 'Edit Notes' to draft problem statement pitches, API credentials, or judge talking points.
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
