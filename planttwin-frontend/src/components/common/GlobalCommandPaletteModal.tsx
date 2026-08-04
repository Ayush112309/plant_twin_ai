import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Command,
  Cpu,
  Radio,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  Brain,
  Settings,
  ClipboardList,
  Layers,
  Sparkles,
  Plus,
  Play,
  RotateCcw,
  Compass,
  ArrowRight,
  Zap,
  Bot,
  Activity,
  X,
  CornerDownLeft,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  category: 'Entity' | 'Quick Action' | 'AI Command';
  type: string;
  title: string;
  subtitle: string;
  icon: any;
  action: () => void;
  badge?: string;
  color?: string;
  actionBadge?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCopilotQuery?: (query: string) => void;
}

export const GlobalCommandPaletteModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onLaunchCopilotQuery,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Keydown listener for ESC and number hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.ctrlKey && e.key === '1') setSelectedCategory('ALL');
      if (e.ctrlKey && e.key === '2') setSelectedCategory('AI');
      if (e.ctrlKey && e.key === '3') setSelectedCategory('ACTIONS');
      if (e.ctrlKey && e.key === '4') setSelectedCategory('ENTITIES');
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (item: PaletteItem) => {
    onClose();
    item.action();
  };

  const allItems: PaletteItem[] = [
    // --- QUICK ACTIONS ---
    {
      id: 'qa-1',
      category: 'Quick Action',
      type: 'Workflow Action',
      title: 'Create Work Order',
      subtitle: 'Dispatch technician and assign maintenance task',
      icon: Plus,
      color: 'text-emerald-400',
      actionBadge: '⚡ Instant Action',
      action: () => navigate('/work-orders'),
    },
    {
      id: 'qa-2',
      category: 'Quick Action',
      type: 'Hierarchy Config',
      title: 'Add Equipment',
      subtitle: 'Register new asset in plant hierarchy',
      icon: Cpu,
      color: 'text-sky-400',
      actionBadge: '⚡ Instant Action',
      action: () => navigate('/equipment'),
    },
    {
      id: 'qa-3',
      category: 'Quick Action',
      type: 'Sensor Mapping',
      title: 'Create Sensor Tag',
      subtitle: 'Configure new telemetry sensor tag mapping',
      icon: Radio,
      color: 'text-purple-400',
      actionBadge: '⚡ Tag Config',
      action: () => navigate('/assets'),
    },
    {
      id: 'qa-4',
      category: 'Quick Action',
      type: 'Protocol Gateway',
      title: 'Connect PLC (Siemens S7)',
      subtitle: 'Configure S7-1200 / S7-1500 / PLCSIM Advanced memory DB connection',
      icon: Zap,
      color: 'text-teal-400',
      actionBadge: '🔌 Connector',
      action: () => navigate('/connectivity'),
    },
    {
      id: 'qa-5',
      category: 'Quick Action',
      type: 'Reporting Output',
      title: 'Generate OEE & Monthly Report',
      subtitle: 'Create valid PDF-1.4 Spec executive report',
      icon: FileText,
      color: 'text-emerald-400',
      actionBadge: '📄 PDF Export',
      action: () => navigate('/reports'),
    },
    {
      id: 'qa-6',
      category: 'Quick Action',
      type: 'Layout Customizer',
      title: 'Create Custom Dashboard',
      subtitle: 'Customize drag & drop widget layout',
      icon: Layers,
      color: 'text-indigo-400',
      actionBadge: '🎨 Layout Builder',
      action: () => navigate('/reports'),
    },
    {
      id: 'qa-7',
      category: 'Quick Action',
      type: 'Virtual Load Test',
      title: 'Start Digital Twin Simulation',
      subtitle: 'Run virtual load scenario simulation',
      icon: Play,
      color: 'text-amber-400',
      actionBadge: '🎮 Simulator',
      action: () => navigate('/digital-twin'),
    },

    // --- AI COMMANDS ---
    {
      id: 'ai-1',
      category: 'AI Command',
      type: 'Incident Diagnosis',
      title: 'Why did Pump-12 stop?',
      subtitle: 'Run cross-module root cause search (Telemetry → Alarms → Twin)',
      icon: Sparkles,
      color: 'text-emerald-400',
      badge: 'Signature NLP',
      actionBadge: '🤖 AI Query',
      action: () => {
        if (onLaunchCopilotQuery) onLaunchCopilotQuery('Why did Pump-12 stop?');
        else navigate('/operations');
      },
    },
    {
      id: 'ai-2',
      category: 'AI Command',
      type: 'Anomaly Detection',
      title: 'Show abnormal sensors',
      subtitle: 'Scan all 128 telemetry tags for Z-Score statistical outliers',
      icon: Activity,
      color: 'text-cyan-400',
      badge: 'Real-time ML',
      actionBadge: '🤖 AI Query',
      action: () => {
        if (onLaunchCopilotQuery) onLaunchCopilotQuery('Show abnormal sensors.');
        else navigate('/telemetry');
      },
    },
    {
      id: 'ai-3',
      category: 'AI Command',
      type: 'RUL Prediction',
      title: 'Predict failures for next 7 days',
      subtitle: 'Run XGBoost RUL degradation models across active assets',
      icon: Brain,
      color: 'text-purple-400',
      badge: 'Predictive RUL',
      actionBadge: '🤖 AI Query',
      action: () => {
        if (onLaunchCopilotQuery) onLaunchCopilotQuery('Predict failures for the next 7 days.');
        else navigate('/ai');
      },
    },
    {
      id: 'ai-4',
      category: 'AI Command',
      type: 'Explainability XAI',
      title: 'Explain Reactor-001 temperature spike',
      subtitle: 'Inspect SHAP & LIME feature attributions for thermal tag',
      icon: Compass,
      color: 'text-amber-400',
      badge: 'SHAP / LIME',
      actionBadge: '🤖 XAI Analysis',
      action: () => {
        if (onLaunchCopilotQuery) onLaunchCopilotQuery('Why is temperature increasing in Reactor-3?');
        else navigate('/ai');
      },
    },

    // --- PLATFORM ENTITIES ---
    {
      id: 'ent-1',
      category: 'Entity',
      type: 'Critical Asset',
      title: 'Reactor-001 (EQ-RX-001)',
      subtitle: 'Hydrocracking Area 01 • Status: Critical (42% Health)',
      icon: Cpu,
      color: 'text-red-400',
      actionBadge: '📊 Asset View',
      action: () => navigate('/equipment'),
    },
    {
      id: 'ent-2',
      category: 'Entity',
      type: 'Equipment Asset',
      title: 'Pump-002 (EQ-PMP-002)',
      subtitle: 'Centrifugal Pump • Status: Warning (74% Health)',
      icon: Cpu,
      color: 'text-amber-400',
      actionBadge: '📊 Asset View',
      action: () => navigate('/equipment'),
    },
    {
      id: 'ent-3',
      category: 'Entity',
      type: 'Equipment Asset',
      title: 'Compressor-001 (EQ-CMP-001)',
      subtitle: 'Gas Compressor • Status: Healthy (98% Health)',
      icon: Cpu,
      color: 'text-emerald-400',
      actionBadge: '📊 Asset View',
      action: () => navigate('/equipment'),
    },
    {
      id: 'ent-4',
      category: 'Entity',
      type: 'SCADA Tag',
      title: 'DB1.DBD4 (Bearing Temp Sensor)',
      subtitle: 'Current: 68.4 °C • Siemens S7-1200 Connected',
      icon: Radio,
      color: 'text-sky-400',
      actionBadge: '📡 Telemetry Tag',
      action: () => navigate('/telemetry'),
    },
    {
      id: 'ent-5',
      category: 'Entity',
      type: 'Plant Site',
      title: 'Refinery Alpha',
      subtitle: 'Primary Operational Facility • 5 Registered Assets',
      icon: Building2,
      color: 'text-emerald-400',
      actionBadge: '🏭 Site Overview',
      action: () => navigate('/plant-explorer'),
    },
    {
      id: 'ent-6',
      category: 'Entity',
      type: 'ISA Alarm',
      title: 'ALM-2024-001 (High Temperature Spike)',
      subtitle: 'ISA-18.2 Critical • Source: Reactor-001',
      icon: AlertTriangle,
      color: 'text-red-400',
      actionBadge: '🚨 ISA Alarm',
      action: () => navigate('/alerts'),
    },
    {
      id: 'ent-7',
      category: 'Entity',
      type: 'Work Order',
      title: 'WO-101 (Sensor Calibration)',
      subtitle: 'Assigned to Lead Tech • Status: IN_PROGRESS',
      icon: ClipboardList,
      color: 'text-amber-400',
      actionBadge: '📋 Maintenance',
      action: () => navigate('/work-orders'),
    },
  ];

  // Filter items by search query and category
  const filteredItems = allItems.filter((item) => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === 'ALL' ||
      (selectedCategory === 'ACTIONS' && item.category === 'Quick Action') ||
      (selectedCategory === 'AI' && item.category === 'AI Command') ||
      (selectedCategory === 'ENTITIES' && item.category === 'Entity');

    return matchesQuery && matchesCategory;
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans selection:bg-cyan-500 selection:text-black"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden shadow-2xl relative border rounded-3xl backdrop-blur-2xl flex flex-col max-h-[82vh]"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Search Bar Input Header */}
        <div
          className="p-4 border-b flex items-center space-x-3"
          style={{
            backgroundColor: 'var(--bg-header)',
            borderColor: 'var(--border-color)',
          }}
        >
          <Search className="w-6 h-6 text-emerald-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search equipment, sensors, plants, alarms, work orders, or launch AI commands..."
            className="flex-1 bg-transparent text-lg placeholder-slate-500 focus:outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {!query && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Close Command Palette"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div
          className="px-4 py-3 border-b flex items-center space-x-6 overflow-x-auto no-scrollbar"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-color)',
          }}
        >
          {[
            { id: 'ALL', label: 'All Commands' },
            { id: 'AI', label: '🤖 AI Commands' },
            { id: 'ACTIONS', label: '⚡ Quick Actions' },
            { id: 'ENTITIES', label: '📦 Platform Entities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full transition-all flex items-center text-sm font-semibold ${
                selectedCategory === cat.id
                  ? 'bg-emerald-950/50 text-emerald-500 border border-emerald-900/50'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Command Results Stream */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
        >
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center space-y-2 text-slate-400">
              <Command className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-[var(--text-primary)]">No command matching "{query}" found.</div>
              <div className="text-xs text-slate-500">Try searching for "Pump", "Report", "Alarm", or "Explain".</div>
            </div>
          ) : (
            filteredItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(item)}
                  className="w-full p-4 rounded-xl flex items-center justify-between text-left transition-colors group hover:bg-white/5"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-2xl border border-white/5 ${item.color || 'text-slate-300'}`}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-slate-500 group-hover:text-slate-300 transition-colors mr-2">
                    <span>Action</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div
          className="p-4 flex items-center justify-between text-sm"
          style={{
            backgroundColor: 'var(--bg-header)',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
          }}
        >
          <span className="flex items-center space-x-2">
            <Command className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-400 hover:text-slate-300 transition-colors">PlantTwin AI Navigator & AI Launcher</span>
          </span>
          <span className="text-slate-500">Click outside or Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalCommandPaletteModal;
