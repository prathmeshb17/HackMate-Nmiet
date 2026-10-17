import React, { useState } from 'react';
import { Bell, Check, X, Sparkles, UserCheck, Clock, Mail, Users, ArrowRight } from 'lucide-react';

export default function NotificationsTab({
  notifications,
  currentStudent,
  teams,
  hackathons,
  onAcceptInvite,
  onDeclineInvite
}) {
  const [filter, setFilter] = useState('ALL');

  const myNotifications = notifications.filter(n => n.recipientId === currentStudent.id);

  const filteredNotifs = myNotifications.filter(n => {
    if (filter === 'ALL') return true;
    return n.status === filter;
  });

  const pendingCount = myNotifications.filter(n => n.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fadeIn font-sans">

      {/* Top Header Banner - Bright White Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-pink-50 text-pink-700 border border-pink-200 rounded-full flex items-center gap-1">
              <Bell className="w-3 h-3 text-pink-600" /> TEAM REQUESTS & INVITATIONS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Invites & Join Requests Box</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review recruitment offers and incoming student join requests for <span className="text-pink-700 font-bold">{currentStudent.name}</span>
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm font-mono text-xs">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-base border border-pink-200">
            {pendingCount}
          </div>
          <div>
            <div className="text-slate-900 font-bold">Pending Invites/Requests</div>
            <div className="text-[10px] text-slate-500">Awaiting your approval</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Bright White Theme */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-md">
        <div className="flex items-center space-x-2">
          {['ALL', 'PENDING', 'ACCEPTED', 'DECLINED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === status
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'All Inbox' : status}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-mono font-bold">
          Showing {filteredNotifs.length} item(s)
        </span>
      </div>

      {/* Requests & Invitations List */}
      <div className="space-y-4">
        {filteredNotifs.map(notif => {
          const isPending = notif.status === 'PENDING';
          const isAccepted = notif.status === 'ACCEPTED';
          const isDeclined = notif.status === 'DECLINED';
          const isJoinRequest = notif.type === 'JOIN_REQUEST';

          return (
            <div
              key={notif.id}
              className={`p-6 rounded-3xl border transition-all shadow-md relative overflow-hidden ${
                isPending
                  ? 'bg-white border-slate-200 hover:border-pink-300 hover:shadow-xl'
                  : isAccepted
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-slate-50 border-slate-200/80 opacity-75'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Content */}
                <div className="space-y-3 max-w-2xl">

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${
                      isJoinRequest
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {isJoinRequest ? '⚡ Incoming Join Request' : `Offered Role: ${notif.roleOffered || 'Teammate'}`}
                    </span>

                    {notif.matchScore && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-mono">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {notif.matchScore}% Match
                      </span>
                    )}

                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono font-medium">
                      <Clock className="w-3 h-3" />
                      {notif.timestamp || 'Recently'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-pink-600" />
                      {isJoinRequest ? (
                        <span><strong className="text-pink-700">{notif.applicantName}</strong> requested to join team <strong className="text-slate-900">{notif.senderTeamName}</strong></span>
                      ) : (
                        <span>Team <strong className="text-pink-700">{notif.senderTeamName}</strong> invited you to join!</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Hackathon: <strong className="text-slate-800">{notif.hackathonTitle}</strong>
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans italic">
                    "{notif.message}"
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isPending && (
                    <>
                      <button
                        onClick={() => onDeclineInvite(notif.id)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>

                      <button
                        onClick={() => onAcceptInvite(notif)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        {isJoinRequest ? 'Approve & Add to Team' : 'Accept & Join Team'}
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      Approved & Union-Find Connected!
                    </div>
                  )}

                  {isDeclined && (
                    <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
                      Declined
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        {filteredNotifs.length === 0 && (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-md">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No requests or invites found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              When teammates send requests to join your squad or recruiters invite you, they will appear here!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
