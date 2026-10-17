import React, { useState } from 'react';
import { X, Mail, User, LogIn, ArrowRight, Sparkles, CheckCircle2, Shield, Search } from 'lucide-react';
import { GithubIcon, GoogleIcon } from './BrandIcons.jsx';
import { supabase } from '../services/supabaseClient.js';

export default function LoginModal({
  isOpen,
  onClose,
  allStudents = [],
  onLoginSuccess,
  onOpenSignUp
}) {
  if (!isOpen) return null;

  const [inputVal, setInputVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'picker'

  const handleDirectLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const query = inputVal.trim().toLowerCase();
    if (!query) {
      setErrorMsg('Please enter your email or username/GitHub handle');
      return;
    }

    // Match against allStudents
    const matched = allStudents.find(s => {
      const email = (s.email || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      const github = (s.github || '').toLowerCase().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
      return email === query || name === query || github === query || s.id.toLowerCase() === query;
    });

    if (matched) {
      onLoginSuccess(matched);
      onClose();
    } else {
      setErrorMsg(`No account found matching "${inputVal}". Please verify your email or sign up below.`);
    }
  };

  const handleSelectAccount = (student) => {
    onLoginSuccess(student);
    onClose();
  };

  const handleOAuthLogin = async (provider) => {
    setErrorMsg('');
    try {
      if (!supabase) {
        setErrorMsg('Supabase is not configured.');
        return;
      }
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.href
        }
      });
      if (error) {
        setErrorMsg(`OAuth (${provider}) error: ${error.message}. You can log in directly with your email above.`);
      }
    } catch (err) {
      setErrorMsg(`Could not connect to ${provider} OAuth. Please log in directly with your email.`);
    }
  };

  const filteredAccounts = allStudents.filter(s => {
    if (!accountSearch.trim()) return true;
    const q = accountSearch.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.college || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all font-sans">
        
        {/* Header */}
        <div className="relative p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono mb-2">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            SECURE DEVICE LOGIN
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Log In to HackMate</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your joined squads, invitations, and chat on this device.
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-4 border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('direct'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'direct'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Email / Username
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('picker'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'picker'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registered Profiles ({allStudents.length})
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-5">

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
              <span className="text-rose-500 font-bold">⚠️</span>
              <div className="flex-1">
                {errorMsg}
                {errorMsg.includes('No account found') && (
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

          {activeTab === 'direct' ? (
            <>
              {/* Direct Login Form */}
              <form onSubmit={handleDirectLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Registered Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. alex@mit.edu or Alex Rivera"
                      value={inputVal}
                      onChange={(e) => { setInputVal(e.target.value); setErrorMsg(''); }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <LogIn className="w-4 h-4" />
                  Log In to this Device
                </button>
              </form>

              {/* Social Login Options */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <span className="bg-white px-2">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('github')}
                  className="py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <GithubIcon className="w-4 h-4 text-slate-900" />
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  className="py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <GoogleIcon className="w-4 h-4" />
                  Google
                </button>
              </div>
            </>
          ) : (
            /* Account Picker for multi-user / testing */
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search profiles by name, email, college..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredAccounts.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 font-medium">
                    No matching registered profiles found.
                  </p>
                ) : (
                  filteredAccounts.map(student => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectAccount(student)}
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
                            {student.email || student.college || 'Registered Student'}
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        Select
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Footer Call to Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">New to HackMate?</span>
            <button
              type="button"
              onClick={() => { onClose(); onOpenSignUp(); }}
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              Create Account
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
