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

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' },
    { id: 'recruit', label: 'Recruit', icon: Users, activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20', iconColor: 'text-indigo-600' },
    { id: 'findTeams', label: 'Find Teams', icon: Search, activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20', iconColor: 'text-emerald-600' },
    { id: 'teams', label: 'My Teams', icon: ShieldCheck, activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' },
    { id: 'autoteam', label: 'Auto Squads', icon: Cpu, activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20', iconColor: 'text-indigo-600' },
    { id: 'invites', label: 'Invites', icon: Bell, activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20', iconColor: 'text-pink-600', badge: pendingNotifCount }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm font-sans">
      {/* 1. Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Sleek Brand Logo */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer group flex-shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors font-display">
                HackMate
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full font-mono">
                NMIET
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></span>
            </div>
          </div>

          {/* Desktop Main Navigation Menu (>= lg) */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 space-x-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? `${item.activeColor} font-bold`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.iconColor || 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full font-bold text-[10px] ${
                      isActive ? 'bg-white text-indigo-700' : 'bg-pink-600 text-white animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section (Login / Sign Up / Profile) */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">

            {!currentStudent ? (
              /* GUEST MODE: Show Log In & Sign Up */
              <div className="flex items-center space-x-2">
                <button
                  onClick={openLoginModal}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={openOnboardingModal}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              /* LOGGED-IN MODE: Show Current User & Log Out */
              <div className="flex items-center space-x-2">
                <div
                  onClick={openProfileModal}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-indigo-50 p-1 pr-2.5 sm:pr-3 rounded-xl border border-slate-200 hover:border-indigo-200 cursor-pointer transition-all group"
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

      {/* 2. Mobile & Tablet Upper Navigation Bar (< lg) */}
      <nav className="lg:hidden border-t border-slate-200/80 bg-slate-50/95 backdrop-blur-md px-3 py-2 overflow-x-auto no-scrollbar shadow-inner">
        <div className="flex items-center space-x-1.5 min-w-max">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? `${item.activeColor} font-bold scale-[1.02]`
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 active:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.iconColor || 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full font-bold text-[10px] ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-pink-600 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
