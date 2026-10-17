import React, { useState } from 'react';
import { X, Calendar, Trophy, Globe, MapPin, Users, Tag, Sparkles, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export default function HostHackathonModal({ isOpen, onClose, onHostSuccess }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    mode: 'Online',
    location: '',
    startDate: '',
    endDate: '',
    registrationUrl: '',
    prizePool: '₹50,000',
    maxTeamSize: 4,
    category: 'AI/ML',
    requiredSkillsStr: 'React, Python, FastAPI',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);

    const skills = formData.requiredSkillsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Format display date
    const dateStr = formData.startDate && formData.endDate
      ? `${formData.startDate} - ${formData.endDate}`
      : (formData.startDate || 'Upcoming 2026');

    const newHackathon = {
      id: `hosted-${Date.now()}`,
      title: formData.title.trim(),
      organizer: formData.organizer.trim() || 'Student Tech Chapter',
      platform: 'Community Hosted',
      status: 'UPCOMING',
      registrationUrl: formData.registrationUrl.trim() || 'https://hackmate.dev',
      date: dateStr,
      startDate: formData.startDate,
      endDate: formData.endDate,
      mode: formData.mode,
      location: formData.location.trim(),
      prizePool: formData.prizePool.trim() || '₹25,000',
      maxTeamSize: parseInt(formData.maxTeamSize) || 4,
      requiredSkills: skills.length > 0 ? skills : ['React', 'Python'],
      category: formData.category,
      description: formData.description.trim() || 'Join our campus hackathon to innovate, build real-world software, and win exciting prizes!',
      bannerColor: 'from-purple-600 via-indigo-600 to-blue-700',
      badgeText: '🌟 Hosted on HackMate',
      isHosted: true
    };

    setTimeout(() => {
      onHostSuccess(newHackathon);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm font-sans animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-slate-900 space-y-6">

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Host / Post a Hackathon</h2>
              <p className="text-xs text-slate-500">
                Publish your college or community hackathon to thousands of eager student hackers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hackathon Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. National Campus AI Challenge 2026"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Host / Organizer Organization
              </label>
              <input
                type="text"
                placeholder="e.g. ACM Student Chapter, Google Developer Group"
                value={formData.organizer}
                onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Event Format & Mode
              </label>
              <select
                value={formData.mode}
                onChange={e => setFormData({ ...formData, mode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              >
                <option value="Online">Online / Virtual</option>
                <option value="In-Person">In-Person (Offline)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {formData.mode !== 'Online' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Venue Location / City
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Campus Auditorium, Tech Park, Bengaluru"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Direct Registration Page URL / Website</span>
              <span className="text-[10px] text-indigo-600 font-normal">Redirects applicants directly</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="url"
                placeholder="e.g. https://unstop.com/o/... or https://your-fest.dev/register"
                value={formData.registrationUrl}
                onChange={e => setFormData({ ...formData, registrationUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Prize Pool</label>
              <input
                type="text"
                placeholder="e.g. ₹1,00,000 or $5,000"
                value={formData.prizePool}
                onChange={e => setFormData({ ...formData, prizePool: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Team Size</label>
              <select
                value={formData.maxTeamSize}
                onChange={e => setFormData({ ...formData, maxTeamSize: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value={2}>2 Members</option>
                <option value={3}>3 Members</option>
                <option value={4}>4 Members</option>
                <option value={5}>5 Members</option>
                <option value={6}>6 Members</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Track</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="AI/ML">AI / Machine Learning</option>
                <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                <option value="Fullstack Web">Fullstack Web & Cloud</option>
                <option value="Open Innovation">Open Innovation</option>
                <option value="FinTech">FinTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="AR/VR">AR / VR & Spatial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Required / Recommended Skills (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. React, Python, FastAPI, UI/UX, PostgreSQL"
              value={formData.requiredSkillsStr}
              onChange={e => setFormData({ ...formData, requiredSkillsStr: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hackathon Description & Theme
            </label>
            <textarea
              rows={3}
              placeholder="Outline the problem statements, judging criteria, or guidelines..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isSubmitting ? 'Publishing...' : 'Publish Hackathon Live'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
