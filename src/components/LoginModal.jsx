import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Mail, User, LogIn, ArrowRight, CheckCircle2,
  Shield, Search, Lock, Eye, EyeOff, AlertCircle, Loader2, Users, Trash2
} from 'lucide-react';
import { hashPassword, findCloudStudent } from '../services/supabaseClient.js';

export default function LoginModal({
  isOpen,
  onClose,
  allStudents = [],
  myCreatedProfileIds = [],
  currentStudent = null,
  initialTab = 'direct',
  onLoginSuccess,
  onOpenSignUp,
  onRemoveProfileFromDevice
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab); // 'direct' | 'picker'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search in account picker
  const [accountSearch, setAccountSearch] = useState('');

  // Reset tab and messages when opened with a specific initialTab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialTab]);

  // Compute ONLY the profiles created or authorized on this device
  const myCreatedStudents = useMemo(() => {
    const idSet = new Set(myCreatedProfileIds || []);
    if (currentStudent && currentStudent.id) {
      idSet.add(currentStudent.id);
    }
    const matched = allStudents.filter(s => idSet.has(s.id));

    // Fallback: check localStorage for any locally saved student data if Supabase sync is pending
    try {
      const localSaved = localStorage.getItem('hackmate_students');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          parsed.forEach(s => {
            if (idSet.has(s.id) && !matched.some(m => m.id === s.id)) {
              matched.push(s);
            }
          });
        }
      }
    } catch (e) {}

    return matched;
  }, [allStudents, myCreatedProfileIds, currentStudent]);

  const handleDirectLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const query = identifier.trim().toLowerCase();

    if (!query) {
      setErrorMsg('Please enter your Username or Email');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check local state first
      let matched = allStudents.find(s => {
        const email = (s.email || '').toLowerCase();
        const username = (s.username || '').toLowerCase();
        const name = (s.name || '').toLowerCase();
        const github = (s.github || '').toLowerCase().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
        return email === query || username === query || name === query || github === query || s.id.toLowerCase() === query;
      });

      // 2. If not found locally, query Supabase cloud directly
      if (!matched) {
        matched = await findCloudStudent(query);
      }

      if (!matched) {
        setErrorMsg(`No account found matching "${identifier}". Please verify your credentials or create a new profile.`);
        setIsLoading(false);
        return;
      }

      // 3. Verify Password if user has a password set
      if (matched.passwordHash) {
        const inputHash = await hashPassword(password);
        if (inputHash !== matched.passwordHash) {
          setErrorMsg('Incorrect password. Please verify and try again.');
          setIsLoading(false);
          return;
        }
      }

      // 4. Success!
      setSuccessMsg(`Welcome back, ${matched.name}! Logging you in...`);
      setTimeout(() => {
        onLoginSuccess(matched);
        onClose();
      }, 500);

    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAccounts = myCreatedStudents.filter(s => {
    if (!accountSearch.trim()) return true;
    const q = accountSearch.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.username || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.college || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all font-sans">

        {/* Modal Header */}
        <div className="relative p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono mb-2">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            DEVICE LOGIN & AUTH
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            {activeTab === 'picker' ? 'Switch Profile' : 'Log In to HackMate'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'picker'
              ? 'Switch between profiles you have created on this device.'
              : 'Access your squads, live chats, and registration packets on this device.'}
          </p>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-4 border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('direct'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('picker'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'picker'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Switch Profile ({myCreatedStudents.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4">

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {errorMsg}
                {errorMsg.includes('create a new profile') && (
                  <button
                    onClick={() => { onClose(); onOpenSignUp(); }}
                    className="block mt-1 font-bold text-indigo-600 hover:underline"
                  >
                    Click here to create a new profile →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Direct Username/Email & Password Login */}
          {activeTab === 'direct' && (
            <form onSubmit={handleDirectLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul17 or rahul@college.edu"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setErrorMsg(''); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Log In to This Device
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: Switch Profile (ONLY Profiles Created / Authorized on This Device) */}
          {activeTab === 'picker' && (
            <div className="space-y-3">
              {myCreatedStudents.length > 1 && (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your created profiles..."
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {myCreatedStudents.length === 0 ? (
                  <div className="text-center py-7 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 font-display">No Profiles Created on This Device</h4>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                        For your account privacy, only profiles created by you on this device appear here. To log in to an existing account, use Password Login.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('direct')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm transition-all"
                      >
                        Use Password Login
                      </button>
                      <button
                        type="button"
                        onClick={() => { onClose(); onOpenSignUp(); }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
                      >
                        Create New Profile
                      </button>
                    </div>
                  </div>
                ) : filteredAccounts.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 font-medium">
                    No matching profile found in your created profiles.
                  </p>
                ) : (
                  filteredAccounts.map(student => {
                    const isActive = currentStudent && currentStudent.id === student.id;
                    return (
                      <div
                        key={student.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isActive
                            ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div
                          onClick={() => {
                            if (!isActive) {
                              onLoginSuccess(student);
                              onClose();
                            }
                          }}
                          className={`flex items-center gap-3 flex-1 min-w-0 ${isActive ? '' : 'cursor-pointer group'}`}
                        >
                          <img
                            src={student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.name}`}
                            alt={student.name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate font-display">
                                {student.name}
                              </span>
                              {isActive && (
                                <span className="text-[9px] font-mono font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              @{student.username || student.email?.split('@')[0] || 'student'} • {student.college || 'Engineering'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isActive ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onLoginSuccess(student);
                                onClose();
                              }}
                              className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200 px-2.5 py-1 rounded-lg transition-all active:scale-95 font-display"
                            >
                              Switch →
                            </button>
                          )}

                          {onRemoveProfileFromDevice && (
                            <button
                              type="button"
                              onClick={() => onRemoveProfileFromDevice(student.id)}
                              title="Remove profile from this device"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Action buttons inside picker */}
              {myCreatedStudents.length > 0 && (
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('direct')}
                    className="text-slate-600 hover:text-indigo-600 font-medium text-[11px] flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Log In to Another Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenSignUp(); }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 text-[11px] flex items-center gap-1"
                  >
                    + Create New Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Link */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">New to HackMate?</span>
            <button
              type="button"
              onClick={() => { onClose(); onOpenSignUp(); }}
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              Create New Profile
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
