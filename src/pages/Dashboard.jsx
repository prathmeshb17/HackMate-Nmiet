import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar, Users, Trophy, ArrowRight, PlusCircle, Search,
  ExternalLink, Globe, Sparkles, RefreshCw, Filter, CheckCircle2,
  Clock, MapPin, Activity, Bell
} from 'lucide-react';
import SkillGapBadge from '../components/SkillGapBadge';
import { PLATFORMS } from '../services/hackathonService';

export default function Dashboard({
  hackathons,
  currentStudent,
  teams,
  allStudents,
  setActiveTab,
  openNewHackathonModal,
  openOnboardingModal,
  openLoginModal,
  setSelectedHackathonForMatch,

  onOpenTeamChat,
  onRefreshLiveHackathons,
  onDeepSyncAll,
  isRefreshingLive = false,
  isDeepSyncing = false,
  deepSyncProgress = null,
  totalUnstop = 6788,
  totalDevpost = 194,
  lastSyncedTime = new Date(),
  autoSyncAlert = null,
  onDismissSyncAlert = () => {}
}) {
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'LIVE_NOW' | 'UPCOMING'
  const [searchQuery, setSearchQuery] = useState('');
  const [syncToast, setSyncToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  const formatSyncTime = (date) => {
    if (!date) return 'Just now';
    try {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const myTeam = currentStudent ? teams.find(t => t.members.includes(currentStudent.id)) : null;
  const myTeamMembers = myTeam ? allStudents.filter(s => myTeam.members.includes(s.id)) : [];

  // Reset page when any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPlatform, statusFilter, searchQuery]);

  // Platform Counts
  const platformCounts = useMemo(() => {
    const counts = { ALL: hackathons.length, Unstop: 0, Devpost: 0, Devfolio: 0, MLH: 0, HackCulture: 0, Community: 0 };
    hackathons.forEach(h => {
      if (h.isHosted || h.platform === 'Community Hosted') counts.Community++;
      if (h.platform === 'Unstop') counts.Unstop++;
      if (h.platform === 'Devpost') counts.Devpost++;
      if (h.platform === 'Devfolio') counts.Devfolio++;
      if (h.platform === 'MLH') counts.MLH++;
      if (h.platform === 'HackCulture') counts.HackCulture++;
    });
    return counts;
  }, [hackathons]);

  // Filtered Hackathons
  const filteredHackathons = useMemo(() => {
    return hackathons.filter(h => {
      // Platform filter
      if (selectedPlatform !== 'ALL') {
        if (selectedPlatform === 'Community Hosted') {
          if (!h.isHosted && h.platform !== 'Community Hosted') return false;
        } else if (h.platform !== selectedPlatform) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && h.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = h.title?.toLowerCase().includes(q);
        const orgMatch = h.organizer?.toLowerCase().includes(q);
        const platMatch = h.platform?.toLowerCase().includes(q);
        const categoryMatch = h.category?.toLowerCase().includes(q);
        const skillMatch = (h.requiredSkills || []).some(s => s.toLowerCase().includes(q));
        if (!titleMatch && !orgMatch && !platMatch && !categoryMatch && !skillMatch) return false;
      }

      return true;
    });
  }, [hackathons, selectedPlatform, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredHackathons.length / ITEMS_PER_PAGE) || 1;
  const paginatedHackathons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHackathons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHackathons, currentPage]);

  const liveCount = useMemo(() => hackathons.filter(h => h.status === 'LIVE_NOW').length, [hackathons]);
  const upcomingCount = useMemo(() => hackathons.filter(h => h.status === 'UPCOMING').length, [hackathons]);

  const handleSyncClick = async () => {
    if (onRefreshLiveHackathons) {
      await onRefreshLiveHackathons();
      setSyncToast('Live hackathons refreshed from Unstop and Devpost!');
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  const getPlatformBadgeColor = (platform) => {
    switch (platform) {
      case 'Unstop':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Devpost':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Devfolio':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'MLH':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'Community Hosted':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">

      {/* Auto-Sync Alert Notification (when new live hackathons arrive via background polling) */}
      {autoSyncAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {autoSyncAlert}
            </span>
          </div>
          <button
            onClick={onDismissSyncAlert}
            className="text-emerald-700 hover:text-emerald-950 px-2 py-0.5 rounded-lg hover:bg-emerald-100 font-extrabold text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Deep Sync Progress Banner */}
      {isDeepSyncing && (
        <div className="p-4 rounded-3xl bg-indigo-950 text-white border border-indigo-800 shadow-xl space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="font-extrabold text-amber-300">
                Deep Syncing 1,000+ Hackathons ({hackathons.length} Synced)
              </span>
            </div>
            <span className="text-[11px] text-indigo-300 font-mono">
              Unstop Pool: {totalUnstop.toLocaleString()} • Devpost: {totalDevpost}
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-indigo-900/60">
            <div
              className="bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 h-full rounded-full transition-all duration-300"
              style={{
                width: `${deepSyncProgress?.currentPage ? Math.min(100, Math.max(15, (deepSyncProgress.currentPage / (deepSyncProgress.maxPages || 10)) * 100)) : 30}%`
              }}
            />
          </div>

          <p className="text-[11px] text-indigo-200 flex items-center justify-between">
            <span>{deepSyncProgress?.status || 'Streaming pages across Unstop and Devpost...'}</span>
            <span className="font-mono text-amber-300 font-bold">1,000+ Target</span>
          </p>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" /> Live Hackathon Feed
              </span>

              {/* Continuous Live Polling Indicator */}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Auto-Sync Active</span>
                <span className="text-emerald-400">•</span>
                <span className="text-[11px] font-medium text-emerald-700 font-mono">
                  Synced: {formatSyncTime(lastSyncedTime)}
                </span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {hackathons.length.toLocaleString()} Loaded ({totalUnstop.toLocaleString()} on Unstop)
              </span>

              <span className="flex items-center gap-1 text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {liveCount} Live Now
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • {upcomingCount} Upcoming
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentStudent ? `Welcome, ${currentStudent.name}` : 'Welcome to HackMate'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore <strong>1,000+ live and upcoming hackathons</strong> continuously synced from <strong>Unstop</strong> ({totalUnstop.toLocaleString()} available), <strong>Devpost</strong>, <strong>Devfolio</strong>, and <strong>MLH</strong>.
              Register directly on their official portals with one click, or host your own community event.
            </p>

            {!currentStudent && (
              <div className="mt-3 p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-700 font-medium">
                  👋 <strong>Viewing as Guest on this Device:</strong> Log in to form squads, receive team invitations, and join live team chats.
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={openLoginModal}
                    className="px-3 py-1 bg-white hover:bg-slate-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 shadow-sm transition-all"
                  >
                    Log In
                  </button>
                  <button
                    onClick={openOnboardingModal}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>


          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onDeepSyncAll}
              disabled={isDeepSyncing}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 shadow-md shadow-indigo-950/20 transition-all active:scale-95 disabled:opacity-60"
              title="Sync 1,000+ hackathons across all 10 pages of Unstop and Devpost"
            >
              <Sparkles className={`w-4 h-4 text-amber-400 ${isDeepSyncing ? 'animate-spin' : ''}`} />
              <span>{isDeepSyncing ? 'Syncing 1,000+...' : 'Sync All (1,000+)'}</span>
            </button>

            <button
              onClick={openNewHackathonModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Host Event
            </button>

            <button
              onClick={() => setActiveTab('recruit')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              Recruit
            </button>
          </div>

        </div>
      </div>

      {/* Manual Sync Toast Feedback */}
      {syncToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncToast}</span>
          </div>
          <button onClick={() => setSyncToast(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* User Active Team Widget */}
      {myTeam && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-600 font-mono font-bold uppercase">Active Team</span>
              <h3 className="text-xl font-extrabold text-slate-900">{myTeam.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{myTeam.hackathonTitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenTeamChat(myTeam)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                Open Team Chat
              </button>

              <button
                onClick={() => setActiveTab('teams')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <SkillGapBadge
            requiredSkills={(() => {
              const h = hackathons.find(item => item.id === myTeam.hackathonId);
              return h ? h.requiredSkills : [];
            })()}
            teamMembers={myTeamMembers}
            onFindMissingRole={() => setActiveTab('recruit')}
          />
        </div>
      )}

      {/* Live & Upcoming Hackathons Section */}
      <div className="space-y-5">

        {/* Section Header & Sync / Host Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Live & Upcoming Hackathons ({filteredHackathons.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time aggregated challenges. Click direct register to open the official event portal.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Auto-Polling (45s)
            </span>

            <button
              onClick={handleSyncClick}
              disabled={isRefreshingLive}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title="Refresh live hackathon feeds from online sources"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshingLive ? 'animate-spin' : ''}`} />
              {isRefreshingLive ? 'Syncing...' : 'Sync Now'}
            </button>

            <button
              onClick={openNewHackathonModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Host Event
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by hackathon name, skill (React, Python), track, or organizer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'LIVE_NOW', label: '🔴 Live Now' },
                { id: 'UPCOMING', label: '📅 Upcoming' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === s.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

          </div>

          {/* Platform Pills Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
            <span className="text-slate-400 text-[11px] font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Source:
            </span>
            {[
              { id: 'ALL', label: 'All Platforms', count: platformCounts.ALL },
              { id: PLATFORMS.UNSTOP, label: 'Unstop', count: platformCounts.Unstop },
              { id: PLATFORMS.DEVPOST, label: 'Devpost', count: platformCounts.Devpost },
              { id: PLATFORMS.DEVFOLIO, label: 'Devfolio', count: platformCounts.Devfolio },
              { id: PLATFORMS.MLH, label: 'MLH', count: platformCounts.MLH },
              { id: PLATFORMS.HACKCULTURE, label: 'HackCulture', count: platformCounts.HackCulture },
              { id: 'Community Hosted', label: '🌟 Community Hosted', count: platformCounts.Community }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap text-xs flex items-center gap-1.5 ${
                  selectedPlatform === p.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{p.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  selectedPlatform === p.id ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {p.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Hackathons Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedHackathons.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all p-6 flex flex-col justify-between group shadow-sm hover:shadow-xl relative"
            >
              <div>
                {/* Platform Badge & Live Status */}
                <div className="flex items-center justify-between text-xs mb-3.5 gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 ${getPlatformBadgeColor(h.platform)}`}>
                    <Globe className="w-3 h-3" />
                    {h.platform || 'Hackathon'}
                  </span>

                  {h.status === 'LIVE_NOW' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[10px] flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      LIVE ONGOING
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[10px]">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Title & Organizer */}
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 leading-snug">
                  {h.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3 font-medium flex items-center gap-1.5">
                  <span>{h.organizer}</span>
                  {h.category && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-600 font-semibold">{h.category}</span>
                    </>
                  )}
                </p>

                {/* Date, Mode & Prize Metadata Row */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 font-medium bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span className="truncate">{h.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold justify-end">
                    <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{h.prizePool || 'Swag & Certificates'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{h.mode || 'Online'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                    <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Max {h.maxTeamSize} Members</span>
                  </div>
                </div>

                {/* Location if offline */}
                {h.location && (
                  <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                    <span className="truncate">{h.location}</span>
                  </p>
                )}

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed font-sans">
                  {h.description}
                </p>

                {/* Required Skills */}
                {h.requiredSkills && h.requiredSkills.length > 0 && (
                  <div className="mb-5">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Target Tech Stack:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {h.requiredSkills.map((req, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] border border-slate-200 font-medium">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Direct Registration Link + Team Recruitment */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">

                {/* 1. Direct External Registration Link */}
                <a
                  href={h.registrationUrl || 'https://unstop.com/hackathons'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
                  title={`Open official registration page on ${h.platform || 'website'}`}
                >
                  <span>Register on {h.platform || 'Official Site'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Direct domain preview */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
                  <span className="truncate max-w-[190px]" title={h.registrationUrl}>
                    🔗 {(() => {
                      try {
                        const parsed = new URL(h.registrationUrl);
                        return parsed.hostname.replace('www.', '') + (parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.slice(0, 16) + '...' : '');
                      } catch {
                        return h.platform?.toLowerCase() || 'official site';
                      }
                    })()}
                  </span>
                  <span className="text-indigo-600 font-sans font-bold flex items-center gap-0.5">Direct Portal ↗</span>
                </div>

                {/* 2. HackMate Squad Formation Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedHackathonForMatch(h.id);
                      setActiveTab('recruit');
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center justify-center gap-1 transition-all"
                    title="Find teammates looking to participate in this hackathon"
                  >
                    <Users className="w-3 h-3" />
                    <span>Recruit Squad</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedHackathonForMatch(h.id);
                      setActiveTab('findTeams');
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1 transition-all"
                    title="Find teams looking for members for this hackathon"
                  >
                    <Search className="w-3 h-3" />
                    <span>Find Teams</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Pagination & Progressive Navigation Controls */}
        {filteredHackathons.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm text-xs">
            <div className="text-slate-500 font-medium">
              Showing <span className="font-extrabold text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredHackathons.length)}</span> of <span className="font-extrabold text-indigo-600">{filteredHackathons.length.toLocaleString()}</span> Hackathons (Page {currentPage} of {totalPages})
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </button>

              {/* Render dynamic page window */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                let p = idx + 1;
                if (totalPages > 5 && currentPage > 3) {
                  p = currentPage - 2 + idx;
                  if (p > totalPages) p = totalPages - (4 - idx);
                }
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setCurrentPage(p);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                      currentPage === p
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-slate-400 px-1 font-bold">...</span>
                  <button
                    onClick={() => {
                      setCurrentPage(totalPages);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className="w-8 h-8 rounded-xl font-bold text-xs bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Empty State when filter matches nothing */}
        {filteredHackathons.length === 0 && (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No hackathons match the selected filters</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try changing your platform or status filter, or host your own community hackathon for students.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedPlatform('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Clear All Filters
              </button>
              <button
                onClick={openNewHackathonModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
              >
                Host a Hackathon
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
