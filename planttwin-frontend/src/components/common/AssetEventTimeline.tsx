import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  LineChart,
  AlertTriangle,
  XCircle,
  Wrench,
  Brain,
  Zap,
  FileText,
  User,
  CheckCircle2,
  Calendar,
  ClipboardList,
  Cpu,
  ChevronRight,
  X,
  Bot,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../lib/api/client';
import { usePlantTelemetry, LifecycleEvent } from '../../app/contexts/PlantTelemetryContext';

export interface TimelineEvent {
  id: string;
  event_type: string;
  category: 'Telemetry' | 'Alarm' | 'Failure' | 'Maintenance' | 'AI' | 'Configuration' | 'Documents' | 'User Actions' | 'Normal';
  title: string;
  description: string;
  timestamp: string;
  color: string;
  icon: string;
  related_data?: Record<string, any>;
}

interface ComponentProps {
  assetId?: string;
  assetTag?: string;
  assetName?: string;
  onLaunchCopilotQuery?: (query: string) => void;
}

export const AssetEventTimeline: React.FC<ComponentProps> = ({
  assetId = 'Reactor-001',
  assetTag,
  assetName = 'Reactor-001 Vessel',
  onLaunchCopilotQuery,
}) => {
  const targetAssetId = assetTag || assetId;
  const navigate = useNavigate();
  const { lifecycleEvents } = usePlantTelemetry();
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalEvent, setActiveModalEvent] = useState<TimelineEvent | null>(null);

  // Convert context lifecycle events for assetId to TimelineEvent format
  const contextEvents: TimelineEvent[] = (lifecycleEvents[targetAssetId] || []).map((evt: LifecycleEvent) => ({
    id: evt.id,
    event_type: evt.type,
    category: evt.type === 'Telemetry' ? 'Telemetry' : evt.type === 'Failures' ? 'Failure' : 'Alarm',
    title: evt.title,
    description: evt.detail,
    timestamp: new Date().toISOString(),
    color: evt.type === 'Failures' ? 'red' : 'sky',
    icon: evt.type === 'Failures' ? 'XCircle' : 'LineChart',
    related_data: { source: 'Siemens S7 & CSV Hub Ingestion', time: evt.timestamp },
  }));

  const defaultTimelineEvents: TimelineEvent[] = [
    {
      id: 'evt-10',
      event_type: 'Normal',
      category: 'Normal',
      title: `${assetName} Health Score Restored to 98.5%`,
      description: 'Vibration levels returned to baseline (0.02 mm/s). SCADA stream synchronized via Siemens PLCSIM.',
      timestamp: new Date().toISOString(),
      color: 'emerald',
      icon: 'CheckCircle2',
      related_data: { sensor: 'DB100.DBD12', telemetry_reading: '98.5% Health Index', work_order: 'WO-COMPLETED-101' },
    },
    {
      id: 'evt-09',
      event_type: 'Repair',
      category: 'Maintenance',
      title: `Technician Overhaul Completed on ${assetName}`,
      description: 'Replaced SKF-209 bearing set, flushed oil reservoir, recalibrated thermal sensor tag.',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      color: 'emerald',
      icon: 'Wrench',
      related_data: { technician: 'John Doe', work_order: 'WO-PMP-12-REPAIR', parts_replaced: ['SKF-209 Bearing Set', 'High-Temp O-Ring'] },
    },
    {
      id: 'evt-08',
      event_type: 'Work Order',
      category: 'Maintenance',
      title: `Emergency Work Order WO-PMP-12 Dispatched`,
      description: 'Dispatched maintenance crew for emergency bearing inspection following thermal trip.',
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      color: 'emerald',
      icon: 'ClipboardList',
      related_data: { work_order_id: 'WO-PMP-12-REPAIR', priority: 'HIGH', assigned_to: 'John Doe' },
    },
    {
      id: 'evt-07',
      event_type: 'Engineer Comment',
      category: 'User Actions',
      title: 'Engineer Feedback Recorded (Agentic Learning)',
      description: 'Reliability Engineer modified AI diagnosis: "Actually it was lubrication breakdown, bearing race undamaged."',
      timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      color: 'indigo',
      icon: 'User',
      related_data: { engineer: 'reliability.engineer@planttwin.ai', decision: 'MODIFIED', corrected_label: 'Lubrication Breakdown' },
    },
    {
      id: 'evt-06',
      event_type: 'AI Prediction',
      category: 'AI',
      title: 'AI Model Predicts Bearing Seizure Risk (PRED-RX-88)',
      description: 'LSTM RUL Degradation model calculated 142 days remaining useful life (Confidence: 98.4%).',
      timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      color: 'purple',
      icon: 'Brain',
      related_data: { prediction_id: 'PRED-RX-88', model: 'LSTM RUL Estimator v2.1.0', shap_top_feature: 'Vibration Amplitude (+42.1%)' },
    },
    {
      id: 'evt-05',
      event_type: 'Alarm',
      category: 'Alarm',
      title: 'ISA-18.2 Critical Alarm ALM-2024-001 Triggered',
      description: 'Thermal tag DB100.DBD12 spiked to 100°C (+3.4σ above 98.2°C median).',
      timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      color: 'amber',
      icon: 'AlertTriangle',
      related_data: { alarm_id: 'ALM-2024-001', severity: 'CRITICAL', source: 'DB100.DBD12' },
    },
  ];

  const allEvents = [...contextEvents, ...defaultTimelineEvents];

  const categoryPills = [
    { id: 'ALL', label: 'All Lifecycle Events' },
    { id: 'Telemetry', label: '🔵 Telemetry' },
    { id: 'Alarm', label: '🟠 Alarms' },
    { id: 'Failure', label: '🔴 Failures' },
    { id: 'Maintenance', label: '🟢 Maintenance' },
    { id: 'AI', label: '🟣 AI Predictions' },
    { id: 'Configuration', label: '⚙️ Configuration' },
    { id: 'User Actions', label: '👤 Engineer Actions' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Telemetry':
        return { text: 'text-sky-400', bg: 'bg-sky-950/40', border: 'border-sky-500/40', dot: 'bg-sky-400' };
      case 'Alarm':
        return { text: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-500/40', dot: 'bg-amber-400' };
      case 'Failure':
        return { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-500/40', dot: 'bg-red-400' };
      case 'Maintenance':
      case 'Normal':
        return { text: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-500/40', dot: 'bg-emerald-400' };
      case 'AI':
        return { text: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-500/40', dot: 'bg-purple-400' };
      case 'User Actions':
        return { text: 'text-indigo-400', bg: 'bg-indigo-950/40', border: 'border-indigo-500/40', dot: 'bg-indigo-400' };
      case 'Documents':
        return { text: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-500/40', dot: 'bg-cyan-400' };
      default:
        return { text: 'text-slate-300', bg: 'bg-slate-900', border: 'border-slate-700', dot: 'bg-slate-400' };
    }
  };

  const getIconComponent = (category: string) => {
    switch (category) {
      case 'Telemetry':
        return LineChart;
      case 'Alarm':
        return AlertTriangle;
      case 'Failure':
        return XCircle;
      case 'Maintenance':
        return Wrench;
      case 'AI':
        return Brain;
      case 'User Actions':
        return User;
      case 'Documents':
        return FileText;
      case 'Configuration':
        return Zap;
      default:
        return CheckCircle2;
    }
  };

  const filteredEvents = allEvents.filter(
    (evt) => selectedCategory === 'ALL' || evt.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Asset Event Timeline — {assetName}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological audit log: Equipment Created → PLC Connected → Telemetry → Maintenance → Alarms → AI → Repairs
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
          {filteredEvents.length} Lifecycle Events
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {categoryPills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setSelectedCategory(pill.id)}
            className={`px-3 py-1.5 rounded-full font-mono text-[11px] whitespace-nowrap transition-colors ${
              selectedCategory === pill.id
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'bg-[var(--bg-card)] text-slate-400 border border-[var(--border-color)] hover:text-slate-200'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Vertical Axis Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border-color)]">
        {filteredEvents.map((evt) => {
          const colors = getCategoryColor(evt.category);
          const IconC = getIconComponent(evt.category);

          return (
            <div key={evt.id} className="relative group">
              {/* Glowing Node Icon on Axis */}
              <div
                className={`absolute -left-6 top-1 w-6 h-6 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center ${colors.text} shadow-md group-hover:scale-110 transition-transform`}
              >
                <IconC className="w-3.5 h-3.5" />
              </div>

              {/* Event Card */}
              <div
                onClick={() => setActiveModalEvent(evt)}
                className="industrial-card p-4 space-y-2 cursor-pointer hover:border-emerald-500/50 transition-all shadow-lg group-hover:translate-x-1"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {evt.category.toUpperCase()}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                      {evt.title}
                    </h4>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(evt.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>

                {evt.related_data && (
                  <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                    {Object.entries(evt.related_data).map(([k, v]) => (
                      <span key={k} className="bg-[var(--bg-canvas)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                        <strong className="text-slate-300">{k}:</strong> {Array.isArray(v) ? v.join(', ') : String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Event Deep-Dive Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="industrial-card w-full max-w-lg p-6 space-y-5 shadow-2xl relative border-emerald-500/50">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Event Deep-Dive Inspector</h3>
              </div>
              <button onClick={() => setActiveModalEvent(null)} className="text-slate-400 hover:text-slate-200 text-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                  {activeModalEvent.category}
                </span>
                <h4 className="text-sm font-bold text-slate-100">{activeModalEvent.title}</h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#090D14] p-3 rounded-lg border border-[#1E293B]">
                {activeModalEvent.description}
              </p>

              <div className="text-[11px] text-slate-400 font-mono">
                Timestamp: {new Date(activeModalEvent.timestamp).toLocaleString()}
              </div>

              {activeModalEvent.related_data && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Associated Platform Data:</div>
                  <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                    {Object.entries(activeModalEvent.related_data).map(([k, v]) => (
                      <div key={k} className="p-2 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="font-bold text-emerald-400">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Entry Points to Related Data */}
            <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigate to Related Module:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveModalEvent(null);
                    navigate('/telemetry');
                  }}
                  className="p-2 bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-emerald-500/50 text-xs font-semibold text-sky-400 rounded flex items-center justify-between transition-colors"
                >
                  <span>View Live Telemetry</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setActiveModalEvent(null);
                    navigate('/work-orders');
                  }}
                  className="p-2 bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-emerald-500/50 text-xs font-semibold text-emerald-400 rounded flex items-center justify-between transition-colors"
                >
                  <span>Open Work Order</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  const q = `Explain incident '${activeModalEvent.title}' on ${assetName}`;
                  setActiveModalEvent(null);
                  if (onLaunchCopilotQuery) {
                    onLaunchCopilotQuery(q);
                  } else {
                    const event = new CustomEvent('copilot-launch-query', { detail: { query: q } });
                    window.dispatchEvent(event);
                  }
                }}
                className="w-full p-2 bg-gradient-to-r from-purple-900/60 to-emerald-900/60 border border-purple-500/40 hover:border-emerald-400 text-xs font-bold text-purple-200 rounded flex items-center justify-center space-x-2 transition-colors mt-2"
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>Ask Industrial AI Engineer Copilot to Explain Incident</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetEventTimeline;
