import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlantTwinLogo from '../../components/common/PlantTwinLogo';
import {
  Activity,
  Radio,
  LineChart,
  Layers,
  Brain,
  ClipboardList,
  FileText,
  Building2,
  Wrench,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  Server,
  Database,
  Globe,
  TrendingUp,
  Workflow,
  PieChart,
  BarChart3,
  Play,
  ArrowDown,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Multi-Page Navigation Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <PlantTwinLogo size="md" showText={true} />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-bold text-slate-300">
          <button onClick={() => navigate('/')} className="text-cyan-400 border-b-2 border-cyan-400 pb-1">Home</button>
          <button onClick={() => navigate('/demos')} className="hover:text-cyan-400 transition-colors">Role Demos</button>
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
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 lg:px-8 pt-16 pb-20 max-w-7xl mx-auto w-full text-center flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-cyan-500/20 via-emerald-500/15 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Page Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-6 shadow-lg animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>Page 1: Industrial AI Agent Platform</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl leading-[1.1] mb-6">
          AI Agents for Autonomous <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-purple-400 bg-clip-text text-transparent">
            Industrial Operations & Digital Twins
          </span>
        </h1>

        <p className="text-slate-400 max-w-3xl text-base sm:text-xl mb-8 leading-relaxed">
          Ingest real-time SCADA telemetry from Siemens S7, OPC-UA, and Modbus TCP. Predict equipment degradation 14 days in advance with explainable AI agents.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 text-slate-950 font-black text-sm hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center space-x-2"
          >
            <span>Get Started — Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/demos')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-bold text-sm transition-all flex items-center justify-center space-x-2 backdrop-blur-xl"
          >
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Explore 5 Role Demos</span>
          </button>
        </div>

        {/* Real-time Value ROI Banner Bar */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Net Financial ROI</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">$132,500 Saved</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">Prevents catastrophic pump failure</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>Plant Availability</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">99.4% Uptime</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">Across 128 connected PLCs</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
            <div className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>RUL Warning Horizon</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">14 Days Remaining</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">Early bearing wear detection</div>
          </div>
        </div>
      </section>

      {/* Interactive Process Flow Section (Data Input -> AI Core -> Industrial Outputs) */}
      <section className="px-4 lg:px-8 py-16 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              How PlantTwin AI Operates: 3-Step Flow
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              End-to-end industrial telemetry ingestion, explainable AI model processing, and automated operational execution.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 font-mono font-extrabold flex items-center justify-center text-sm">
                    01
                  </span>
                  <Radio className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. Live Data Ingestion</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Connect Siemens S7-1200 PLCs, OPC-UA servers, Modbus TCP devices, and high-frequency 1,250 Hz SCADA telemetry.
                </p>
              </div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30">
                Protocols: Siemens S7 • OPC-UA • Modbus • MQTT
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-mono font-extrabold flex items-center justify-center text-sm">
                    02
                  </span>
                  <Brain className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. AI Core Processing</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Run RUL Remaining Useful Life models, XGBoost anomaly detection, SHAP/LIME explainability, and counterfactual simulators.
                </p>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                AI Engine: RUL • SHAP • LIME • Feast Feature Store
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 font-mono font-extrabold flex items-center justify-center text-sm">
                    03
                  </span>
                  <Workflow className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Operational Outputs</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Dispatch 1-click Work Orders, trigger closed-loop PLC valve adjustments, and sync 3D Digital Twin representations.
                </p>
              </div>
              <div className="text-[10px] font-mono text-purple-400 font-bold bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/30">
                Outputs: Work Orders • PLC Overrides • Twin Sync
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <PlantTwinLogo size="sm" showText={true} />
            <span className="font-mono text-[11px] text-slate-400">© 2026 PlantTwin AI OS</span>
          </div>
          <div className="flex items-center space-x-4 font-mono">
            <button onClick={() => navigate('/')} className="hover:text-slate-300">Page 1: Home</button>
            <button onClick={() => navigate('/demos')} className="hover:text-slate-300">Page 2: Role Demos</button>
            <button onClick={() => navigate('/register')} className="hover:text-slate-300">Page 3: Onboarding</button>
            <button onClick={() => navigate('/login')} className="hover:text-slate-300">Page 4: Auth Portal</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
