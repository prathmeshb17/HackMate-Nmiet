import React from 'react';
import { Users, Code2, UserPlus, Bell, Home, Search, ShieldCheck, Cpu } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentStudent,
  allStudents,
  setCurrentStudentId,
  pendingNotifCount,
  openProfileModal,
  openOnboardingModal
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* 1. Sleek Brand Logo */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                HackMate
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></span>
            </div>
          </div>

          {/* 2. Main Navigation Menu */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('recruit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'recruit'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                  : 'text-indigo-700 hover:text-indigo-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Recruit
            </button>

            <button
              onClick={() => setActiveTab('findTeams')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'findTeams'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-emerald-700 hover:text-emerald-900 hover:bg-white/60'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              Find Teams
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'teams'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              My Teams
            </button>

            <button
              onClick={() => setActiveTab('autoteam')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'autoteam'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Auto Squads
            </button>

            <button
              onClick={() => setActiveTab('invites')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'invites'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-pink-600" />
              Invites
              {pendingNotifCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-pink-600 text-white font-bold text-[10px] animate-pulse">
                  {pendingNotifCount}
                </span>
              )}
            </button>
          </nav>

          {/* 3. Clean Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            <button
              onClick={openOnboardingModal}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up
            </button>

            {/* User Avatar & Selector (only shown if students exist) */}
            {allStudents.length > 0 && (
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <select
                  value={currentStudent.id}
                  onChange={(e) => setCurrentStudentId(e.target.value)}
                  className="bg-transparent text-slate-800 text-xs font-semibold rounded-lg px-2 py-0.5 border-none focus:outline-none max-w-[120px] truncate cursor-pointer"
                >
                  {allStudents.map(std => (
                    <option key={std.id} value={std.id} className="bg-white text-slate-900">
                      {std.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={openProfileModal}
                  title="Edit My Profile"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src={currentStudent.avatar}
                    alt={currentStudent.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300"
                  />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
