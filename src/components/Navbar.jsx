import React from 'react';
import { Users, Code2, UserPlus, Bell, Home, Search, ShieldCheck, Cpu, LogIn, LogOut } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentStudent,
  allStudents,
  setCurrentStudentId,
  pendingNotifCount,
  openProfileModal,
  openOnboardingModal,
  openLoginModal,
  onLogout
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

            {!currentStudent ? (
              /* GUEST MODE: Show Log In & Sign Up */
              <div className="flex items-center space-x-2">
                <button
                  onClick={openLoginModal}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  Log In
                </button>
                <button
                  onClick={openOnboardingModal}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </button>
              </div>
            ) : (
              /* LOGGED-IN MODE: Show Current User & Log Out */
              <div className="flex items-center space-x-2">
                <div
                  onClick={openProfileModal}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-indigo-50 p-1 pr-3 rounded-xl border border-slate-200 hover:border-indigo-200 cursor-pointer transition-all group"
                  title="Click to view & edit your profile"
                >
                  <img
                    src={currentStudent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentStudent.name}`}
                    alt={currentStudent.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300 group-hover:ring-indigo-400"
                  />
                  <div className="text-left hidden sm:block max-w-[120px] truncate">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight truncate">
                      {currentStudent.name}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight truncate">
                      {currentStudent.preferredRole || 'Hacker'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={openLoginModal}
                  title="Switch account on this device"
                  className="hidden md:flex text-[11px] font-semibold text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Switch
                </button>

                <button
                  onClick={onLogout}
                  title="Log out of this device"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>


        </div>
      </div>
    </header>
  );
}
