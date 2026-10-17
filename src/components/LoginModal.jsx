import React, { useState } from 'react';
import {
  X, Mail, User, LogIn, ArrowRight, CheckCircle2,
  Shield, Search, Lock, Eye, EyeOff, AlertCircle, Loader2, Users
} from 'lucide-react';
import { hashPassword, findCloudStudent } from '../services/supabaseClient.js';

export default function LoginModal({
  isOpen,
  onClose,
  allStudents = [],
  onLoginSuccess,
  onOpenSignUp
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'picker'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search in account picker
  const [accountSearch, setAccountSearch] = useState('');

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

  const filteredAccounts = allStudents.filter(s => {
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Log In to HackMate</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your squads, live chats, and registration packets on this device.
          </p>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-4 border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('direct'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Password Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('picker'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'picker'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Profiles ({allStudents.length})
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

          {/* TAB 2: Registered Profile Picker */}
          {activeTab === 'picker' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search profiles by name, username, email..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredAccounts.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 font-medium">
                    No registered profiles found.
                  </p>
                ) : (
                  filteredAccounts.map(student => (
                    <div
                      key={student.id}
                      onClick={() => {
                        onLoginSuccess(student);
                        onClose();
                      }}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.name}`}
                          alt={student.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            @{student.username || student.email?.split('@')[0] || 'student'} • {student.college || 'Engineering'}
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        Select
                      </div>
                    </div>
                  ))
                )}
              </div>
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
