import React, { useState } from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface AlertInspectorModalProps {
  initialSeverityFilter: 'ALL' | 'CRITICAL' | 'WARNING' | 'NORMAL';
  alerts: Array<{
    id: string;
    title: string;
    asset_tag: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'NORMAL' | string;
    timestamp: string;
    timeAgo?: string;
  }>;
  onClose: () => void;
}

export const AlertInspectorModal: React.FC<AlertInspectorModalProps> = ({
  initialSeverityFilter,
  alerts,
  onClose,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'NORMAL'>(initialSeverityFilter);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAcknowledgedIds((prev) => new Set(prev).add(id));
  };

  const filteredAlerts = alerts.filter((item) => {
    const sev = (item.severity || '').toUpperCase();
    if (filter === 'CRITICAL') return sev === 'CRITICAL';
    if (filter === 'WARNING') return sev === 'WARNING';
    if (filter === 'NORMAL') return sev === 'INFO' || sev === 'NORMAL';
    return true;
  });

  const criticalCount = alerts.filter((a) => (a.severity || '').toUpperCase() === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => (a.severity || '').toUpperCase() === 'WARNING').length;
  const normalCount = alerts.filter((a) => (a.severity || '').toUpperCase() === 'INFO' || (a.severity || '').toUpperCase() === 'NORMAL').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-mono text-xs">
      <div className="industrial-card w-full max-w-2xl p-6 space-y-5 shadow-2xl relative border-amber-500/40 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] font-sans">
                  Active ISA-18.2 Alarm Inspector
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  REAL-TIME ALERTS
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                ISA-18.2 compliant priority-ranked alarm console stream
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)]">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                filter === 'ALL'
                  ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All ({alerts.length})
            </button>

            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center space-x-1.5 ${
                filter === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Critical ({criticalCount})</span>
            </button>

            <button
              onClick={() => setFilter('WARNING')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center space-x-1.5 ${
                filter === 'WARNING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Warning ({warningCount})</span>
            </button>

            <button
              onClick={() => setFilter('NORMAL')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center space-x-1.5 ${
                filter === 'NORMAL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Normal ({normalCount})</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              navigate('/alarms');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--brand-primary)] hover:underline inline-flex items-center space-x-1"
          >
            <span>Open Alarm Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alert List Stream */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-color)] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-bold text-[var(--text-primary)]">No Active {filter} Alarms</div>
              <p className="text-xs">All equipment telemetry channels operating within nominal parameters.</p>
            </div>
          ) : (
            filteredAlerts.map((item) => {
              const isAck = acknowledgedIds.has(item.id);
              const sev = (item.severity || '').toUpperCase();
              const isCrit = sev === 'CRITICAL';
              const isWarn = sev === 'WARNING';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all space-y-2 ${
                    isAck
                      ? 'bg-[var(--bg-canvas)]/50 border-[var(--border-color)] opacity-60'
                      : isCrit
                      ? 'bg-rose-500/10 border-rose-500/40'
                      : isWarn
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-emerald-500/10 border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                          isCrit
                            ? 'bg-rose-500 text-white'
                            : isWarn
                            ? 'bg-amber-500 text-black'
                            : 'bg-emerald-500 text-black'
                        }`}
                      >
                        {sev === 'INFO' ? 'NORMAL' : sev}
                      </span>
                      <span className="font-extrabold text-[var(--text-primary)] font-sans text-xs">
                        {item.title}
                      </span>
                    </div>

                    <span className="text-[11px] text-[var(--text-secondary)]">{item.timeAgo || item.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-[var(--text-secondary)]">
                      Asset Tag: <span className="font-bold text-[var(--brand-primary)]">{item.asset_tag}</span> • ISA-18.2 Priority 1
                    </div>

                    {isAck ? (
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ACKNOWLEDGED
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleAcknowledge(item.id, e)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-[var(--text-primary)] font-bold text-[10px] transition-all"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertInspectorModal;
