import React, { useState, useEffect } from 'react';
import { GraduationCap, Code, ArrowRight, ArrowLeft, Check, CheckSquare, Square, Link2 } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './BrandIcons.jsx';
import { SkillTrie } from '../dsa/trie.js';
import { ALL_PREDEFINED_SKILLS } from '../data/initialStudents.js';

const AVAILABLE_ROLES = [
  { id: 'Frontend', name: 'Frontend Developer' },
  { id: 'Backend', name: 'Backend Engineer' },
  { id: 'UI/UX', name: 'UI/UX Designer' },
  { id: 'AI/ML', name: 'AI / Machine Learning' },
  { id: 'Fullstack', name: 'Fullstack Developer' },
  { id: 'DevOps', name: 'DevOps & Cloud' }
];

export default function OnboardingModal({ isOpen, onClose, onRegisterSuccess, onOpenLogin }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    branch: 'Computer Engineering',
    div: 'Div A',
    email: '',
    github: '',
    linkedin: '',
    phone: '',
    resume: '',
    title: '',
    preferredRoles: ['Frontend'],
    experienceLevel: 'Intermediate',
    availabilityHours: 20,
    pastHackathons: 1,
    bio: '',
    skills: ['React', 'JavaScript']
  });

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

  const handleFinalSubmit = () => {
    const avatarSeed = formData.name.replace(/\s+/g, '').toLowerCase() || 'student';
    const primaryRole = formData.preferredRoles[0] || 'Fullstack';
    const newStudent = {
      ...formData,
      id: `std-${Date.now()}`,
      preferredRole: primaryRole,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`,
      title: formData.title || `${formData.preferredRoles.join(' & ')} Specialist`,
      bio: formData.bio || `Student at ${formData.college || 'Engineering University'}. Passionate about building software.`
    };
    onRegisterSuccess(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative text-slate-900">

        {/* Top Stepper Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
              {step}/2
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Registration</h2>
              <p className="text-[11px] text-slate-500 font-mono">HackMate Matcher Network</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100"
          >
            Cancel
          </button>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-indigo-600 flex-shrink-0" />
              <div className="text-xs text-indigo-900">
                Welcome to <strong>HackMate</strong>! Enter your academic details to get matched based on your skills & branch.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College / University *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COEP / IIT Bombay"
                  value={formData.college}
                  onChange={e => setFormData({ ...formData, college: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch / Major</label>
                <input
                  type="text"
                  placeholder="Computer Engineering"
                  value={formData.branch}
                  onChange={e => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Division / Section</label>
                <input
                  type="text"
                  placeholder="Div A"
                  value={formData.div}
                  onChange={e => setFormData({ ...formData, div: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Email</label>
                <input
                  type="email"
                  placeholder="rahul@college.edu"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                  Optional — can add later
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <GithubIcon className="w-3 h-3 text-slate-400" />
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={formData.github}
                    onChange={e => setFormData({ ...formData, github: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <LinkedinIcon className="w-3 h-3 text-slate-400" />
                    LinkedIn Profile URL
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

              <p className="text-[10px] text-slate-400 leading-tight">
                Used to pre-fill your squad's 1-Click Registration Packet for Unstop & Devpost hackathon forms. You can skip this now and add it later in your profile.
              </p>
            </div>

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
                onClick={() => {
                  if (!formData.name.trim()) return alert('Please enter your full name');
                  setStep(2);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                Next: Technical Profile <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Select Your Role(s) (Multiple Selection Allowed) *</span>
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
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Skill Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-indigo-600" /> Skill Tags (Trie Autocomplete)
                </span>
                <span className="text-[10px] text-indigo-600 font-mono">O(L + K)</span>
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(idx)} className="hover:text-rose-600 text-indigo-500">×</button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Type skill (e.g. 'Re' for React, 'Py' for Python)..."
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
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
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                Complete Registration & Launch <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
