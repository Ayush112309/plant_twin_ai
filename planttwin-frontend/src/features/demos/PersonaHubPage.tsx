import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantTwinLogo from '../../components/common/PlantTwinLogo';
import {
  Building2,
  Wrench,
  Brain,
  Radio,
  Crown,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Shield,
  Clock,
  Play,
  Cpu,
  Layers,
  BarChart3,
  Flame,
  Gauge,
  Sliders,
  Check,
} from 'lucide-react';

interface PersonaInfo {
  id: string;
  roleName: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: any;
  quote: string;
  metrics: { label: string; value: string; trend: string }[];
  agentActions: string[];
  simulatedScenario: {
    title: string;
    description: string;
    aiRecommendation: string;
    savingsEst: string;
  };
}

const PERSONAS: PersonaInfo[] = [
  {
    id: 'cro',
    roleName: 'Chief Reliability Officer (CRO)',
    title: 'Asset Health & Financial Risk Oversight',
    badge: '👑 Executive Leadership',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: Crown,
    quote: 'Monitor enterprise fleet availability, financial downtime risks, and long-term capital allocation ROI across all manufacturing plants.',
    metrics: [
      { label: 'Fleet Health Index', value: '94.2%', trend: '+2.4% MoM' },
      { label: 'Unplanned Downtime Cost', value: '$14,200', trend: '-68% Reduction' },
      { label: 'RUL Forecasting Accuracy', value: '98.7%', trend: 'Optimal' },
    ],
    agentActions: [
      'Fleet Availability Risk Matrix',
      'Capital Asset Expenditure Forecast',
      'ESG Carbon Footprint Compliance',
    ],
    simulatedScenario: {
      title: 'High Criticality Turbine Vibration Event',
      description: 'Turbine-004 drive end bearing shows 2.1mm/s RMS vibration velocity excursion.',
      aiRecommendation: 'Schedule drive end bearing replacement during planned shift change at 22:00 UTC.',
      savingsEst: '$45,000 Unplanned Failure Savings',
    },
  },
  {
    id: 'scada_lead',
    roleName: 'SCADA Operations Lead',
    title: 'Real-Time Telemetry & ISA-18.2 Alarm Overrides',
    badge: '⚡ Operations Core',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: Radio,
    quote: 'Supervise high-frequency SCADA streams (1,250 Hz), acknowledge ISA-18.2 alarms, and trigger manual PLC coil overrides.',
    metrics: [
      { label: 'Active Alarms (ISA-18.2)', value: '4 Active', trend: '1 Critical' },
      { label: 'Telemetry Stream Rate', value: '1,250 Hz', trend: '100% Sync' },
      { label: 'Operator Response Time', value: '1.2 min', trend: 'Fast' },
    ],
    agentActions: [
      'Live Sensor Override Controls',
      'ISA-18.2 Alarm Nuisance Filtering',
      'Closed-Loop PID Tuning Guidance',
    ],
    simulatedScenario: {
      title: 'Pressure Spike Excursion in Reactor Line-02',
      description: 'Pressure reached 520 bar threshold (limit 500 bar). Auto-escalation active.',
      aiRecommendation: 'Engage bypass valve V-102 by +12% and step down feed pump P-002 speed.',
      savingsEst: 'Prevents Relief Valve Rupture & Emergency Shutdown',
    },
  },
  {
    id: 'maint_tech',
    roleName: 'Predictive Maintenance Tech',
    title: 'RUL Forecasting & Work Order Dispatching',
    badge: '🔧 Field Operations',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Wrench,
    quote: 'Execute prescriptive maintenance recommendations, inspect bearing vibration spectrums, and dispatch 1-click Work Orders.',
    metrics: [
      { label: 'Work Orders Dispatched', value: '18 Active', trend: '3 In Progress' },
      { label: 'Mean Time to Repair (MTTR)', value: '42 min', trend: '-18 min' },
      { label: 'Spare Parts Availability', value: '100%', trend: 'In Stock' },
    ],
    agentActions: [
      '1-Click Work Order Dispatcher',
      'Bearing Spectrum FFT Frequency Analysis',
      'Parts Inventory Auto-Reservation',
    ],
    simulatedScenario: {
      title: 'Pump-002 Drive End Bearing Wear',
      description: 'RUL model estimates 14 Days remaining before impeller seizure.',
      aiRecommendation: 'Dispatch maintenance team to replace SKF 6208 bearing assembly.',
      savingsEst: '$18,500 Motor Repair Savings',
    },
  },
  {
    id: 'automation_eng',
    roleName: 'Automation & Control Engineer',
    title: 'PLC Communications & MLOps Feature Store',
    badge: '🧠 AI & Controls',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: Brain,
    quote: 'Configure Siemens S7-1200 / OPC-UA / MQTT protocol gateways, monitor MLOps model drift, and train feature store embeddings.',
    metrics: [
      { label: 'OPC-UA / S7 Nodes Online', value: '128 Tags', trend: '100% Up' },
      { label: 'Model Prediction Drift', value: '0.012', trend: 'Negligible' },
      { label: 'Feast Feature Store Size', value: '1.4 GB', trend: 'Synced' },
    ],
    agentActions: [
      'Siemens S7 & OPC-UA Driver Config',
      'SHAP & LIME XAI Model Explainer',
      'Automated Model Retraining Pipeline',
    ],
    simulatedScenario: {
      title: 'XAI Counterfactual Telemetry Simulation',
      description: 'What-If analysis: Simulating 10% temperature reduction impact on RUL.',
      aiRecommendation: 'Promote XGBoost v2.4 model to production (F1-score: 0.984).',
      savingsEst: 'Increases RUL Model Precision by +4.2%',
    },
  },
  {
    id: 'exec_vp',
    roleName: 'Executive Operations VP',
    title: 'Multi-Site Plant Performance & Yield Analytics',
    badge: '🏢 Corporate Level',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    icon: Building2,
    quote: 'Compare multi-plant operational performance, benchmark site efficiency, and export compliance reports for board review.',
    metrics: [
      { label: 'Active Plants Tracked', value: '4 Sites', trend: 'Global' },
      { label: 'Overall Plant OEE', value: '88.4%', trend: '+3.2% Target' },
      { label: 'Net AI Downtime ROI', value: '$132,500', trend: 'Net Profit' },
    ],
    agentActions: [
      'Multi-Plant Yield Comparison',
      'Automated ESG & Energy PDF Exporter',
      'Executive Board Summary Feed',
    ],
    simulatedScenario: {
      title: 'Quarterly Fleet Yield Optimization',
      description: 'Comparing Houston Refinery vs Rotterdam Chemical Site energy efficiency.',
      aiRecommendation: 'Balance load allocations: Shift 15% throughput to Rotterdam Line 3.',
      savingsEst: '$120,000 Annual Energy Savings',
    },
  },
];

export const PersonaHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPersona, setSelectedPersona] = useState<PersonaInfo>(PERSONAS[0]);
  const [simActive, setSimActive] = useState(false);

  const handleRunSimulator = () => {
    setSimActive(true);
    setTimeout(() => {
      setSimActive(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Multi-Page Navigation Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <PlantTwinLogo size="md" showText={true} />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-bold text-slate-300">
          <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition-colors">Home</button>
          <button onClick={() => navigate('/demos')} className="text-cyan-400 border-b-2 border-cyan-400 pb-1">Role Demos</button>
          <button onClick={() => navigate('/register')} className="hover:text-cyan-400 transition-colors">Onboarding</button>
          <button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors">Auth Portal</button>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-200 transition-all"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
          >
            Register Org
          </button>
        </div>
      </header>

      {/* Page Title & Subtitle */}
      <section className="px-4 lg:px-8 py-10 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Page 2: Role Demos & Interactive Persona Hub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          Experience AI Agents Tailored to Your Industrial Role
        </h1>
        <p className="text-slate-400 max-w-3xl mx-auto text-base sm:text-lg">
          Select any of the 5 specialized industrial personas below to test live interactive AI agent simulations before registering your organization.
        </p>
      </section>

      {/* Main 5 Personas Grid & Simulator Area */}
      <main className="px-4 lg:px-8 pb-16 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 5 Persona Selection Tabs */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select User Persona (5 Roles)
          </h3>

          {PERSONAS.map((p) => {
            const isSelected = selectedPersona.id === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p)}
                className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl border ${p.badgeColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{p.roleName}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{p.title}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Live Interactive Agent Simulator */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between shadow-2xl">
          <div>
            {/* Header with Selected Role Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-2xl border ${selectedPersona.badgeColor}`}>
                  <selectedPersona.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">{selectedPersona.roleName}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedPersona.title}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${selectedPersona.badgeColor}`}>
                {selectedPersona.badge}
              </span>
            </div>

            {/* Persona Mission Quote */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 italic mb-6 leading-relaxed">
              "{selectedPersona.quote}"
            </div>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {selectedPersona.metrics.map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono font-bold uppercase">{m.label}</div>
                  <div className="text-xl font-black text-white mt-1">{m.value}</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{m.trend}</div>
                </div>
              ))}
            </div>

            {/* Simulated Interactive Scenario Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-500/30 relative overflow-hidden mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-bold">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span>SIMULATED AGENT EVENT SCENARIO</span>
                </div>
                <button
                  onClick={handleRunSimulator}
                  disabled={simActive}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Play className={`w-3.5 h-3.5 ${simActive ? 'animate-spin' : ''}`} />
                  <span>{simActive ? 'Simulating AI Agent...' : 'Test AI Agent Simulation'}</span>
                </button>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{selectedPersona.simulatedScenario.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{selectedPersona.simulatedScenario.description}</p>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 mb-2">
                <strong className="text-cyan-400">🤖 AI Prescriptive Recommendation: </strong>
                {selectedPersona.simulatedScenario.aiRecommendation}
              </div>

              <div className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>ROI Value Impact: {selectedPersona.simulatedScenario.savingsEst}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-6">
            <div className="text-xs text-slate-400 font-mono">
              Ready to deploy this persona in your plant?
            </div>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center space-x-2"
            >
              <span>Register Organization as {selectedPersona.roleName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonaHubPage;
