import React, { useEffect } from 'react';
import {
  X, RefreshCw, CheckCircle2, ShieldAlert, Sparkles,
  Trophy, Globe, Clock, ArrowRight, Activity, Filter, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RealTimeScanModal({
  isOpen,
  onClose,
  isScanning,
  scanProgress,
  scanReport
}) {
  useEffect(() => {
    if (!isScanning && scanReport) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  }, [isScanning, scanReport]);

  if (!isOpen) return null;

  const steps = [
    { id: 'DEVPOST', label: 'Devpost Live Feeds', desc: 'Scanning official open & upcoming hackathons' },
    { id: 'UNSTOP', label: 'Unstop Opportunity Index', desc: 'Fetching active student challenges' },
    { id: 'BUNDLED', label: 'Devfolio & MLH Seasons', desc: 'Verifying flagship & collegiate competitions' },
    { id: 'COMMUNITY', label: 'Community & Hosted Squads', desc: 'Ingesting newly registered student events' },
    { id: 'PRUNING', label: 'Date & Deadline Verification', desc: 'Purging ended events & refreshing live countdowns' }
  ];

  const getStepStatus = (stepId) => {
    if (!isScanning && scanReport) return 'DONE';
    if (!scanProgress) return 'PENDING';
    const order = ['INIT', 'DEVPOST', 'UNSTOP', 'BUNDLED', 'COMMUNITY', 'PRUNING', 'COMPLETE'];
    const currentIdx = order.indexOf(scanProgress.stage);
    const stepIdx = order.indexOf(stepId);

    if (currentIdx > stepIdx) return 'DONE';
    if (currentIdx === stepIdx) return 'ACTIVE';
    return 'PENDING';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all text-slate-900">

        {/* Modal Header */}
        <div className="relative p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white">
          {!isScanning && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono mb-2 border border-indigo-500/30">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            REAL-TIME DATA ENGINE
          </div>

          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5 font-display">
            {isScanning ? (
              <>
                <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                Live Cross-Platform Scanner
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Live Synchronization Complete!
              </>
            )}
          </h2>

          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {isScanning
              ? 'Inspecting dates and deadlines across all platforms in real-time. Finished events are pruned automatically.'
              : 'All platforms scanned, expired competitions purged, and newly registered hackathons synchronized.'}
          </p>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-300">
              <span>{scanProgress?.message || (isScanning ? 'Scanning in progress...' : 'Verification Complete')}</span>
              <span className="font-bold text-amber-300">{scanProgress?.percent || 100}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${scanProgress?.percent || (isScanning ? 25 : 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Body: Real-time Stages */}
        <div className="p-6 sm:p-7 space-y-5">

          {/* Scanning Steps */}
          <div className="space-y-2.5">
            {steps.map((st) => {
              const status = getStepStatus(st.id);
              return (
                <div
                  key={st.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    status === 'ACTIVE'
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300 shadow-sm'
                      : status === 'DONE'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all">
                      {status === 'DONE' ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : status === 'ACTIVE' ? (
                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{st.label}</div>
                      <div className="text-[10px] text-slate-500">{st.desc}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    status === 'DONE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : status === 'ACTIVE'
                      ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {status === 'DONE' ? 'Verified' : status === 'ACTIVE' ? 'Scanning...' : 'Queued'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Report Summary Card (Shown when finished) */}
          {scanReport && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-extrabold text-emerald-950">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Live Sync Summary
                </span>
                <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  Just now
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-xl font-display font-black text-rose-600">
                    {scanReport.removedCount}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600">
                    Ended Events Removed
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-xl font-display font-black text-indigo-600">
                    +{scanReport.addedCount}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600">
                    Newly Registered
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-xl font-display font-black text-emerald-600">
                    {scanReport.activeCount}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600">
                    Total Active Now
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          {!isScanning && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>View Live Hackathons</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
