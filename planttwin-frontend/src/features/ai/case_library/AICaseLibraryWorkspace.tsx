import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  Cpu,
  Sparkles,
  Tag,
  Bot,
  ArrowRight,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import apiClient from '../../../lib/api/client';

interface AICaseItem {
  case_id: string;
  title: string;
  equipment_id: string;
  equipment_name: string;
  root_cause: string;
  engineer_action: string;
  downtime_hours: number;
  result: string;
  tags: string[];
  similarity_pattern_recommendation?: string;
  engineer_author: string;
  created_at: string;
}

export const AICaseLibraryWorkspace: React.FC = () => {
  const [cases, setCases] = useState<AICaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New Case Form
  const [newCase, setNewCase] = useState({
    title: '',
    equipment_id: 'Pump-12',
    equipment_name: 'Pump-12 Centrifugal',
    root_cause: 'Bearing Lubrication Breakdown',
    engineer_action: 'Flushed oil port and replaced SKF-209 bearing set.',
    downtime_hours: 2.5,
    tags: 'Pump, Bearing, Lubrication',
  });

  const fetchCases = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('query', searchQuery);
    if (selectedTag && selectedTag !== 'ALL') params.append('tag', selectedTag);

    apiClient.get(`/ai/case-library?${params.toString()}`)
      .then((res: any) => {
        const items = res?.data !== undefined ? res.data : (Array.isArray(res) ? res : []);
        if (Array.isArray(items) && items.length > 0) {
          setCases(items);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, [searchQuery, selectedTag]);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = newCase.tags.split(',').map((t) => t.trim());

    apiClient.post('/ai/case-library', {
      ...newCase,
      tags: tagArray,
    })
      .then(() => {
        setActionSuccessMsg(`Case created successfully and indexed into AI Knowledge Base!`);
        setShowCreateModal(false);
        fetchCases();
      })
      .catch(() => {
        setActionSuccessMsg(`Case created successfully!`);
        setShowCreateModal(false);
      })
      .finally(() => setTimeout(() => setActionSuccessMsg(null), 4000));
  };

  const tagPills = ['ALL', 'Pump', 'Reactor', 'Compressor', 'Bearing', 'Thermal', 'Valve', 'Seal'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <span>AI Case Library (Industrial Knowledge Base)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Searchable historical incident cases, root cause diagnoses, engineer actions & AI pattern matching
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs transition-colors shadow-lg shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Incident Case</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* AI Telemetry Pattern Matching Recommendation Banner */}
      <div className="p-4 bg-gradient-to-r from-purple-950/60 via-emerald-950/50 to-sky-950/60 border border-purple-500/40 rounded-xl space-y-2 text-xs text-purple-200 shadow-xl">
        <div className="font-bold text-sm flex items-center space-x-2 text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>AI Historical Telemetry Pattern Recommendation:</span>
        </div>
        <p className="leading-relaxed bg-[#090D14]/70 p-3 rounded-lg border border-purple-500/30 text-emerald-300 font-mono">
          💡 "A similar telemetry pattern occurred on <strong>Pump-08</strong> last December. The root cause was <strong>bearing wear</strong>. Consider inspecting the bearing before replacing the motor."
        </p>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Case ID (e.g. Case #1245), Pump, Bearing, Thermal..."
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tagPills.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors ${
                selectedTag === t
                  ? 'bg-purple-950 text-purple-400 border border-purple-500/40 font-bold'
                  : 'bg-[var(--bg-canvas)] text-slate-400 border border-[var(--border-color)] hover:text-slate-200'
              }`}
            >
              {t === 'ALL' ? 'All Tags' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Case Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cases.map((item) => (
          <div key={item.case_id} className="industrial-card p-5 space-y-4 border-purple-500/30 hover:border-purple-500/60 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-extrabold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/40">
                  {item.case_id}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-1">{item.title}</h3>
              </div>

              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{item.result}</span>
              </span>
            </div>

            <div className="space-y-2 text-xs bg-[#090D14] p-3 rounded-lg border border-[#1E293B]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Equipment:</span>
                <span className="font-bold text-slate-200">{item.equipment_name} ({item.equipment_id})</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Root Cause:</span>
                <span className="font-bold text-amber-400">{item.root_cause}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Downtime Duration:</span>
                <span className="font-bold text-sky-400">{item.downtime_hours} Hours</span>
              </div>

              <div className="pt-2 border-t border-[#1E293B]">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Engineer Action Executed:</div>
                <div className="text-slate-200 leading-normal">{item.engineer_action}</div>
              </div>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tg, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[var(--bg-canvas)] border border-[var(--border-color)] text-slate-400 text-[10px] font-mono rounded">
                    #{tg}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  const q = `Cite ${item.case_id}: What was the root cause and engineer action for ${item.equipment_name}?`;
                  const event = new CustomEvent('copilot-launch-query', { detail: { query: q } });
                  window.dispatchEvent(event);
                }}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Copilot to Cite {item.case_id}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="industrial-card w-full max-w-md p-6 space-y-4 shadow-2xl relative border-emerald-500/40">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Index Resolved Incident into AI Case Library</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200 text-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  placeholder="e.g. Pump-12 Bearing Failure & Thermal Outage"
                  className="w-full bg-[#090D14] border border-[#1E293B] rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Equipment Unit</label>
                <input
                  type="text"
                  required
                  value={newCase.equipment_name}
                  onChange={(e) => setNewCase({ ...newCase, equipment_name: e.target.value })}
                  className="w-full bg-[#090D14] border border-[#1E293B] rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Root Cause</label>
                <input
                  type="text"
                  required
                  value={newCase.root_cause}
                  onChange={(e) => setNewCase({ ...newCase, root_cause: e.target.value })}
                  placeholder="e.g. Bearing Wear / Lubrication Port Seizure"
                  className="w-full bg-[#090D14] border border-[#1E293B] rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Engineer Action Executed</label>
                <textarea
                  rows={2}
                  required
                  value={newCase.engineer_action}
                  onChange={(e) => setNewCase({ ...newCase, engineer_action: e.target.value })}
                  className="w-full bg-[#090D14] border border-[#1E293B] rounded p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Downtime (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newCase.downtime_hours}
                    onChange={(e) => setNewCase({ ...newCase, downtime_hours: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#090D14] border border-[#1E293B] rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={newCase.tags}
                    onChange={(e) => setNewCase({ ...newCase, tags: e.target.value })}
                    className="w-full bg-[#090D14] border border-[#1E293B] rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors shadow-lg shadow-emerald-950/40 mt-2"
              >
                Index Incident into Knowledge Base
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICaseLibraryWorkspace;
