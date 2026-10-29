import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, Check, Code, User, Users, CheckSquare, Square, Mail, GraduationCap, Phone, FileText, Link2 } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './BrandIcons.jsx';
import { SkillTrie } from '../dsa/trie.js';
import { ALL_PREDEFINED_SKILLS } from '../data/initialStudents.js';

const AVAILABLE_ROLES = [
  { id: 'Frontend', name: 'Frontend' },
  { id: 'Backend', name: 'Backend' },
  { id: 'UI/UX', name: 'UI/UX Designer' },
  { id: 'AI/ML', name: 'AI / ML' },
  { id: 'Fullstack', name: 'Fullstack' },
  { id: 'DevOps', name: 'DevOps & Cloud' }
];

export default function ProfileModal({ isOpen, onClose, student, onSave, onLogout, onSwitchProfile }) {
  if (!isOpen || !student) return null;

  const [formData, setFormData] = useState({
    name: student.name || '',
    title: student.title || '',
    email: student.email || '',
    college: student.college || '',
    phone: student.phone || '',
    github: student.github || '',
    linkedin: student.linkedin || '',
    resume: student.resume || '',
    preferredRoles: Array.isArray(student.preferredRoles) && student.preferredRoles.length > 0
      ? student.preferredRoles
      : [student.preferredRole || 'Fullstack'],
    experienceLevel: student.experienceLevel || 'Intermediate',
    availabilityHours: student.availabilityHours || 20,
    pastHackathons: student.pastHackathons || 0,
    bio: student.bio || '',
    skills: [...(student.skills || [])]
  });

  const [trie, setTrie] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const t = new SkillTrie();
    ALL_PREDEFINED_SKILLS.forEach(item => {
      t.insert(item.name, item.category);
    });
    setTrie(t);
  }, []);

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);

    if (trie && value.trim().length > 0) {
      const matches = trie.autocomplete(value.trim(), 6);
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
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, clean]
      }));
    }
    setSkillInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeSkill = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== indexToRemove)
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...student,
      ...formData,
      preferredRole: formData.preferredRoles[0] || 'Fullstack'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-900 relative">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit Student Profile</h2>
              <p className="text-xs text-slate-500 font-mono">Trie-Powered Skill Autocomplete Active</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headline / Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Full Stack & AI Enthusiast"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Hackathon Registration & Verification Details */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                Unstop & Devpost Registration Details
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Auto-populates Squad Packets</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  Official / College Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-slate-400" />
                  College / Institute
                </label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={e => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. National Institute of Technology"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <GithubIcon className="w-3 h-3 text-slate-400" />
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={e => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <LinkedinIcon className="w-3 h-3 text-slate-400" />
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" />
                  Resume / Portfolio Link
                </label>
                <input
                  type="url"
                  value={formData.resume}
                  onChange={e => setFormData({ ...formData, resume: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Preferred Roles (Multiple Selection Allowed)</span>
              <span className="text-[10px] text-indigo-600 font-mono font-bold">{formData.preferredRoles.length} Selected</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_ROLES.map(role => {
                const isSelected = formData.preferredRoles.includes(role.id);
                return (
                  <div
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-xs truncate">{role.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
              <select
                value={formData.experienceLevel}
                onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
            <textarea
              rows="3"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
            />
          </div>

          {/* Skill Tag Input with TRIE Autocomplete */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-600" />
                Skills & Tech Stack Tags
              </span>
              <span className="text-[10px] text-indigo-600 font-mono">Trie Prefix Search</span>
            </label>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {formData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="hover:text-rose-600 text-indigo-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="relative">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  placeholder="Type skill tag (e.g. 'Re' for React, 'Py' for Python)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-indigo-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1 font-sans">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => addSkill(item.skill)}
                      className="px-3 py-2 hover:bg-indigo-50 rounded-lg cursor-pointer flex items-center justify-between text-xs text-slate-800"
                    >
                      <span className="font-bold text-slate-900">{item.skill}</span>
                      <span className="text-[10px] text-slate-500">{item.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit & Logout & Switch Profile */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {onLogout && (
                <button
                  type="button"
                  onClick={() => { onLogout(); onClose(); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  Log Out
                </button>
              )}
              {onSwitchProfile && (
                <button
                  type="button"
                  onClick={() => { onClose(); onSwitchProfile(); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200 transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  Switch Profile
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
              >
                Save Profile
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
