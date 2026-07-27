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

  // Keydown listener for ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
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
      type: 'Action',
      title: 'Create Work Order',
      subtitle: 'Dispatch technician and assign maintenance task',
      icon: Plus,
      color: 'text-emerald-400',
      action: () => navigate('/work-orders'),
    },
    {
      id: 'qa-2',
      category: 'Quick Action',
      type: 'Action',
      title: 'Add Equipment',
      subtitle: 'Register new asset in plant hierarchy',
      icon: Cpu,
      color: 'text-sky-400',
      action: () => navigate('/equipment'),
    },
    {
      id: 'qa-3',
      category: 'Quick Action',
      type: 'Action',
      title: 'Create Sensor Tag',
      subtitle: 'Configure new telemetry sensor tag mapping',
      icon: Radio,
      color: 'text-purple-400',
      action: () => navigate('/assets'),
    },
    {
      id: 'qa-4',
      category: 'Quick Action',
      type: 'Action',
      title: 'Connect PLC (Siemens S7)',
      subtitle: 'Configure S7-1200 / S7-1500 / PLCSIM Advanced memory DB connection',
      icon: Zap,
      color: 'text-teal-400',
      action: () => navigate('/connectivity'),
    },
    {
      id: 'qa-5',
      category: 'Quick Action',
      type: 'Action',
      title: 'Generate OEE & Monthly Report',
      subtitle: 'Create valid PDF-1.4 Spec report',
      icon: FileText,
      color: 'text-emerald-400',
      action: () => navigate('/reports'),
    },
    {
      id: 'qa-6',
      category: 'Quick Action',
      type: 'Action',
      title: 'Create Custom Dashboard',
      subtitle: 'Customize drag & drop widget layout',
      icon: Layers,
      color: 'text-indigo-400',
      action: () => navigate('/reports'),
    },
    {
      id: 'qa-7',
      category: 'Quick Action',
      type: 'Action',
      title: 'Start Digital Twin Simulation',
      subtitle: 'Run virtual load scenario simulation',
      icon: Play,
      color: 'text-amber-400',
      action: () => navigate('/digital-twin'),
    },
    {
      id: 'qa-8',
      category: 'Quick Action',
      type: 'Action',
      title: 'Restart Siemens Connector',
      subtitle: 'Re-initialize driver instance and heartbeat',
      icon: RotateCcw,
      color: 'text-red-400',
      action: () => navigate('/connectivity'),
    },
    {
      id: 'qa-9',
      category: 'Quick Action',
      type: 'Action',
      title: 'Open Plant Explorer',
      subtitle: 'Browse ISA-95 asset hierarchy tree',
      icon: Compass,
      color: 'text-cyan-400',
      action: () => navigate('/plant-explorer'),
    },

    // --- AI COMMANDS (LAUNCHER) ---
    {
      id: 'ai-1',
      category: 'AI Command',
      type: 'AI Launcher',
      title: 'Explain Critical Alarm ALM-2024-001',
      subtitle: 'Root cause explanation & pneumatic valve diagnostics',
      icon: Bot,
      color: 'text-purple-400',
      badge: 'AI Engine',
      action: () => onLaunchCopilotQuery?.('Explain critical alarm ALM-2024-001'),
    },
    {
      id: 'ai-2',
      category: 'AI Command',
      type: 'AI Launcher',
      title: 'Predict Failures for Next 7 Days',
      subtitle: 'Scan 7-day failure horizon probability',
      icon: Sparkles,
      color: 'text-purple-400',
      badge: 'AI Engine',
      action: () => onLaunchCopilotQuery?.('Predict failures for the next 7 days.'),
    },
    {
      id: 'ai-3',
      category: 'AI Command',
      type: 'AI Launcher',
      title: 'Analyze Pump Outage (Why did Pump-12 stop?)',
      subtitle: 'Cross-module search Telemetry → Twin → Work Orders',
      icon: Bot,
      color: 'text-purple-400',
      badge: 'AI Engine',
      action: () => onLaunchCopilotQuery?.('Why did Pump-12 stop?'),
    },
    {
      id: 'ai-4',
      category: 'AI Command',
      type: 'AI Launcher',
      title: 'Generate SHAP Root Cause Analysis (RCA)',
      subtitle: 'Feature importance ranking for Reactor-001 thermal spike',
      icon: Brain,
      color: 'text-purple-400',
      badge: 'AI Engine',
      action: () => onLaunchCopilotQuery?.('Why is temperature increasing in Reactor-3?'),
    },
    {
      id: 'ai-5',
      category: 'AI Command',
      type: 'AI Launcher',
      title: 'Summarize Plant Health & OEE Score',
      subtitle: 'Composite score & production throughput overview',
      icon: Activity,
      color: 'text-purple-400',
      badge: 'AI Engine',
      action: () => onLaunchCopilotQuery?.('Overall Plant OEE & Health Summary'),
    },
    {
      id: 'ai-6',
      category: 'AI Command',
      type: 'AI Launcher',
      title: 'Optimize Energy Consumption',
      subtitle: 'Suggest thermal heat exchange energy saving plan',
      icon: Zap,
      color: 'text-purple-400',
      badge: 'AI Engine',
      action: () => onLaunchCopilotQuery?.('Suggest energy optimization for Hydrocracking line'),
    },
    {
      id: 'ai-7',
      category: 'AI Command',
      type: 'AI Launcher',
      title: 'Compare Line-1 vs Line-2 Performance',
      subtitle: 'Benchmarking breakdown across assembly lines',
      icon: Sparkles,
      color: 'text-purple-400',
      badge: 'AI Engine',
      action: () => onLaunchCopilotQuery?.('Compare Line-1 and Line-2 performance.'),
    },

    // --- ENTITIES & NAVIGATOR ---
    {
      id: 'ent-1',
      category: 'Entity',
      type: 'Equipment',
      title: 'Reactor-001 (EQ-RX-001)',
      subtitle: 'Hydrocracking Area 01 • Status: Critical (42% Health)',
      icon: Cpu,
      color: 'text-red-400',
      action: () => navigate('/equipment'),
    },
    {
      id: 'ent-2',
      category: 'Entity',
      type: 'Equipment',
      title: 'Pump-002 (EQ-PMP-002)',
      subtitle: 'Centrifugal Pump • Status: Warning (74% Health)',
      icon: Cpu,
      color: 'text-amber-400',
      action: () => navigate('/equipment'),
    },
    {
      id: 'ent-3',
      category: 'Entity',
      type: 'Equipment',
      title: 'Compressor-001 (EQ-CMP-001)',
      subtitle: 'Gas Compressor • Status: Healthy (98% Health)',
      icon: Cpu,
      color: 'text-emerald-400',
      action: () => navigate('/equipment'),
    },
    {
      id: 'ent-4',
      category: 'Entity',
      type: 'Sensor',
      title: 'DB1.DBD4 (Bearing Temp Sensor)',
      subtitle: 'Current: 68.4 °C • Siemens S7-1200 Connected',
      icon: Radio,
      color: 'text-sky-400',
      action: () => navigate('/telemetry'),
    },
    {
      id: 'ent-5',
      category: 'Entity',
      type: 'Plant',
      title: 'Refinery Alpha',
      subtitle: 'Primary Operational Facility • 5 Registered Assets',
      icon: Building2,
      color: 'text-emerald-400',
      action: () => navigate('/plant-explorer'),
    },
    {
      id: 'ent-6',
      category: 'Entity',
      type: 'Alarm',
      title: 'ALM-2024-001 (High Temperature Spike)',
      subtitle: 'ISA-18.2 Critical • Source: Reactor-001',
      icon: AlertTriangle,
      color: 'text-red-400',
      action: () => navigate('/alerts'),
    },
    {
      id: 'ent-7',
      category: 'Entity',
      type: 'Work Order',
      title: 'WO-101 (Sensor Calibration)',
      subtitle: 'Assigned to John Doe • Status: IN_PROGRESS',
      icon: ClipboardList,
      color: 'text-amber-400',
      action: () => navigate('/work-orders'),
    },
    {
      id: 'ent-8',
      category: 'Entity',
      type: 'Report',
      title: 'Monthly Operational & OEE Report (PDF)',
      subtitle: 'Valid PDF-1.4 Spec • Generated Today',
      icon: FileText,
      color: 'text-emerald-400',
      action: () => navigate('/reports'),
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="industrial-card w-full max-w-2xl overflow-hidden shadow-2xl relative border-emerald-500/50 flex flex-col max-h-[80vh]"
      >
        {/* Search Bar Input Header */}
        <div className="p-4 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center space-x-3">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search equipment, sensors, plants, alarms, work orders, or launch AI commands..."
            className="flex-1 bg-transparent text-sm font-medium text-[var(--text-primary)] placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[var(--bg-canvas)] transition-colors"
            title="Close Command Palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 bg-[var(--bg-canvas)] border-b border-[var(--border-color)] flex items-center space-x-2 text-xs font-semibold overflow-x-auto">
          {['ALL', 'AI', 'ACTIONS', 'ENTITIES'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full transition-colors font-mono ${
                selectedCategory === cat
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'AI' ? '🤖 AI Commands' : cat === 'ACTIONS' ? '⚡ Quick Actions' : cat === 'ENTITIES' ? '📦 Platform Entities' : 'All Commands'}
            </button>
          ))}
        </div>

        {/* Command Results Stream */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[var(--bg-canvas)]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-slate-400">
              <Command className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-semibold">No command matching "{query}" found.</div>
              <div className="text-[11px] text-slate-500">Try searching for "Pump", "Report", "Alarm", or "Explain".</div>
            </div>
          ) : (
            filteredItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(item)}
                  className="w-full p-3 rounded-lg flex items-center justify-between text-left hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)] transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-[var(--bg-header)] border border-[var(--border-color)] ${item.color || 'text-slate-300'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 group-hover:text-emerald-400 transition-colors">
                    <span>{item.type}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-2.5 bg-[var(--bg-header)] border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center space-x-1">
            <Command className="w-3.5 h-3.5 text-emerald-400" />
            <span>PlantTwin AI Navigator & AI Launcher</span>
          </span>
          <span>Click outside or Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalCommandPaletteModal;
