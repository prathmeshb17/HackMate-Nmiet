import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Code, ArrowRight, ArrowLeft, Check, CheckSquare, Square,
  Link2, Eye, EyeOff, Lock, User, Mail, ShieldAlert, Sparkles
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './BrandIcons.jsx';
import { SkillTrie } from '../dsa/trie.js';
import { ALL_PREDEFINED_SKILLS } from '../data/initialStudents.js';
import { hashPassword } from '../services/supabaseClient.js';

const AVAILABLE_ROLES = [
  { id: 'Frontend', name: 'Frontend Developer' },
  { id: 'Backend', name: 'Backend Engineer' },
  { id: 'UI/UX', name: 'UI/UX Designer' },
  { id: 'AI/ML', name: 'AI / Machine Learning' },
  { id: 'Fullstack', name: 'Fullstack Developer' },
  { id: 'DevOps', name: 'DevOps & Cloud' }
];

export default function OnboardingModal({ isOpen, onClose, onRegisterSuccess, onOpenLogin, initialData = null }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    confirmPassword: '',
    college: initialData?.college || '',
    branch: 'Computer Engineering',
    div: 'Div A',
    github: initialData?.github || '',
    linkedin: initialData?.linkedin || '',
    phone: '',
    resume: '',
    title: '',
    preferredRoles: ['Frontend'],
    experienceLevel: 'Intermediate',
    availabilityHours: 20,
    pastHackathons: 1,
    bio: initialData?.bio || '',
    skills: ['React', 'JavaScript']
  });

  const [showPassword, setShowPassword] = useState(false);
  const [step1Error, setStep1Error] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [trie, setTrie] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const t = new SkillTrie();
    ALL_PREDEFINED_SKILLS.forEach(item => t.insert(item.name, item.category));
    setTrie(t);
  }, []);

  const handleSkillInputChange = (e) => {
    const val = e.target.value;
    setSkillInput(val);
    if (trie && val.trim()) {
      const matches = trie.autocomplete(val.trim(), 6);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addSkill = (skillName) => {
    if (!skillName || !skillName.trim()) return;
    const clean = skillName.trim();
    if (!formData.skills.some(s => s.toLowerCase() === clean.toLowerCase())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, clean] }));
    }
    setSkillInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeSkill = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idxToRemove)
    }));
  };

  const toggleRole = (roleId) => {
    setFormData(prev => {
      const current = prev.preferredRoles || [];
      if (current.includes(roleId)) {
        if (current.length === 1) return prev;
        return { ...prev, preferredRoles: current.filter(r => r !== roleId) };
      } else {
        return { ...prev, preferredRoles: [...current, roleId] };
      }
    });
  };

  const handleStep1Next = () => {
    setStep1Error('');

    if (!formData.name.trim()) {
      setStep1Error('Please enter your full name');
      return;
    }

    const cleanUsername = formData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setStep1Error('Please choose a username with at least 3 characters (letters, numbers, underscores)');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setStep1Error('Please enter a valid email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setStep1Error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStep1Error('Passwords do not match. Please verify.');
      return;
    }

    if (!formData.college.trim()) {
      setStep1Error('Please enter your College or University name');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cleanUsername = formData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const avatarSeed = cleanUsername || formData.name.replace(/\s+/g, '').toLowerCase() || 'student';
      const primaryRole = formData.preferredRoles[0] || 'Fullstack';
      const passwordHash = await hashPassword(formData.password);

      const newStudent = {
        ...formData,
        id: `std-${Date.now()}`,
        username: cleanUsername,
        passwordHash: passwordHash,
        preferredRole: primaryRole,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`,
        title: formData.title || `${formData.preferredRoles.join(' & ')} Specialist`,
        bio: formData.bio || `Student at ${formData.college || 'Engineering University'}. Passionate about building software.`
      };

      // Strip plaintext passwords from memory
      delete newStudent.password;
      delete newStudent.confirmPassword;

      await onRegisterSuccess(newStudent);
      onClose();
    } catch (e) {
      console.error('Registration failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-7 relative text-slate-900">

        {/* Top Stepper Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
              {step}/2
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Create HackMate Profile</h2>
              <p className="text-[11px] text-slate-500 font-mono">Universal Account & Squad Matcher</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* STEP 1: Account & Academic Credentials */}
        {step === 1 && (
          <div className="space-y-4">

            {step1Error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{step1Error}</span>
              </div>
            )}

            <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-indigo-600 flex-shrink-0" />
              <div className="text-xs text-indigo-900 leading-relaxed">
                Create your permanent profile. You can log in anytime from any device using your <strong>Username</strong> or <strong>Email</strong> with your <strong>Password</strong>!
              </div>
            </div>

            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={e => {
                      const name = e.target.value;
                      const autoUsername = formData.username ? formData.username : name.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setFormData({ ...formData, name, username: autoUsername });
                      setStep1Error('');
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username (Login ID) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul17"
                    value={formData.username}
                    onChange={e => {
                      setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') });
                      setStep1Error('');
                    }}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student / Personal Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@college.edu or rahul@gmail.com"
                  value={formData.email}
                  onChange={e => {
                    setFormData({ ...formData, email: e.target.value });
                    setStep1Error('');
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Create Password *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Min. 6 chars</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => {
                      setFormData({ ...formData, password: e.target.value });
                      setStep1Error('');
                    }}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      setStep1Error('');
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                  />
                </div>
              </div>
            </div>

            {/* College, Branch & Division */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">College / University *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COEP / IIT Bombay"
                  value={formData.college}
                  onChange={e => {
                    setFormData({ ...formData, college: e.target.value });
                    setStep1Error('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch</label>
                <input
                  type="text"
                  placeholder="Computer Eng"
                  value={formData.branch}
                  onChange={e => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Optional Registration Packet Links (GitHub & LinkedIn) */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                  Code & Profile Links (Registration Packet)
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Optional
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <GithubIcon className="w-3 h-3 text-slate-400" />
                    GitHub Profile or Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. prathmeshb17"
                    value={formData.github}
                    onChange={e => setFormData({ ...formData, github: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <LinkedinIcon className="w-3 h-3 text-slate-400" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Step 1 Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              {onOpenLogin ? (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenLogin(); }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Already registered? Log In
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={handleStep1Next}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Next: Technical Profile <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: Roles, Skills & Bio */}
        {step === 2 && (
          <div className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Select Your Preferred Role(s) *</span>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">
                  {formData.preferredRoles.length} Selected
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_ROLES.map(role => {
                  const isSelected = formData.preferredRoles.includes(role.id);
                  return (
                    <div
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="text-xs truncate">{role.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                >
                  <option value="Beginner">Beginner (1st/2nd Hackathon)</option>
                  <option value="Intermediate">Intermediate (3-5 Hackathons)</option>
                  <option value="Advanced">Advanced (Experienced)</option>
                  <option value="Expert">Expert (Hackathon Winner)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weekly Availability (Hours)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={formData.availabilityHours}
                  onChange={e => setFormData({ ...formData, availabilityHours: parseInt(e.target.value) || 15 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Skill Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Technical Skills & Tools</span>
                <span className="text-[10px] text-slate-400">Trie auto-complete</span>
              </label>

              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-300 rounded-xl min-h-[44px] mb-2">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-white border border-slate-200 text-indigo-700 text-xs px-2.5 py-0.5 rounded-lg shadow-2xs font-semibold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="text-slate-400 hover:text-red-500 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a skill (e.g. React, Python, Docker, PyTorch)..."
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-indigo-200 rounded-xl shadow-xl z-50 max-h-36 overflow-y-auto p-1 font-sans">
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => addSkill(item.skill)}
                        className="px-3 py-1.5 hover:bg-indigo-50 rounded-lg cursor-pointer flex items-center justify-between text-xs text-slate-800"
                      >
                        <span className="font-bold text-slate-900">{item.skill}</span>
                        <span className="text-[10px] text-slate-500">{item.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
              <textarea
                rows="2"
                placeholder="e.g. CS Sophomore passionate about frontend design and real-time backend web APIs."
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none font-medium"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Profile...' : 'Complete Registration & Launch'} <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
