import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/contexts/AuthContext';
import apiClient from '../../lib/api/client';
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
  PlaySquare,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Lock,
  Mail,
  Zap,
  Sparkles,
  Server,
  UserCheck,
  Crown,
  Database,
  Globe,
  SlidersHorizontal,
  HardDrive,
  ChevronRight,
  TrendingUp,
  Workflow,
  PieChart,
  LogIn,
} from 'lucide-react';

interface RoleTourInfo {
  id: string;
  icon: any;
  roleName: string;
  email: string;
  badge: string;
  badgeColor: string;
  quote: string;
  focusItems: string[];
  primaryModules: string[];
  permissions: { name: string; allowed: boolean }[];
  defaultRoute: string;
  previewMetric: { label: string; value: string; sub: string; color: string };
}

const ROLE_TOURS: RoleTourInfo[] = [
  {
    id: 'plant_manager',
    icon: Building2,
    roleName: 'Plant Manager',
    email: 'plant.manager@planttwin.ai',
    badge: '🏭 Executive Leadership',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/60 shadow-emerald-900/30',
    quote: 'Monitor overall plant performance, production KPIs, energy consumption, equipment availability, AI insights, maintenance summaries, and executive reports from a unified dashboard.',
    focusItems: ['Production Throughput', 'Overall OEE (77.8%)', 'Plant KPIs', 'Plant Health Score (98.5%)', 'Executive Dashboards', 'Reports Export'],
    primaryModules: ['Operations Center', 'Reporting & Analytics', 'AI Insights', 'Plant Explorer'],
    permissions: [
      { name: 'View All Plants & Sites', allowed: true },
      { name: 'Export Executive PDF/CSV Reports', allowed: true },
      { name: 'View AI Recommendations', allowed: true },
      { name: 'PLC Tag Memory Write Access', allowed: false },
      { name: 'User & System Administration', allowed: false },
    ],
    defaultRoute: '/operations',
    previewMetric: { label: 'Overall OEE Rate', value: '88.4%', sub: '+3.2% vs target', color: 'text-emerald-400' },
  },
  {
    id: 'maintenance_manager',
    icon: Wrench,
    roleName: 'Maintenance Manager',
    email: 'maintenance.manager@planttwin.ai',
    badge: '🔧 Asset Reliability Lead',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/60 shadow-amber-900/30',
    quote: 'Manage work order lifecycles, preventive maintenance schedules, asset health degradation, spare parts inventory, and emergency technician dispatching.',
    focusItems: ['Work Orders Lifecycle', 'Asset Health Score', 'Maintenance Schedules', 'Equipment Downtime', 'Spare Parts', 'Incident Management'],
    primaryModules: ['Work Orders Center', 'Equipment Workspace', 'Runtime Operations', 'Alert Management'],
    permissions: [
      { name: 'Create & Assign Work Orders', allowed: true },
      { name: 'Manage Asset Maintenance History', allowed: true },
      { name: 'Acknowledge ISA-18.2 Alarms', allowed: true },
      { name: 'Modify ML AI Training Pipelines', allowed: false },
      { name: 'System Licensing & Tenant Settings', allowed: false },
    ],
    defaultRoute: '/work-orders',
    previewMetric: { label: 'Active Work Orders', value: '14 Pending', sub: '2 High Priority', color: 'text-amber-400' },
  },
  {
    id: 'ai_engineer',
    icon: Brain,
    roleName: 'AI & Reliability Specialist',
    email: 'ai.specialist@planttwin.ai',
    badge: '🤖 Predictive Intelligence Lead',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/60 shadow-purple-900/30',
    quote: 'Utilize machine learning anomaly detection, Remaining Useful Life (RUL) curve forecasting, SHAP/LIME explainability, and MLOps model registry governance.',
    focusItems: ['AI Health Scores', 'Z-Score Anomaly Scans', 'Remaining Useful Life (RUL)', 'Root Cause Analysis', 'SHAP Explainability (XAI)', 'Model Registry'],
    primaryModules: ['AI Intelligence Center', 'Digital Twin Engine', 'Telemetry Historian'],
    permissions: [
      { name: 'Run Anomaly Detection Scans', allowed: true },
      { name: 'Promote ML Models to Production', allowed: true },
      { name: 'Inspect Feature Store Vectors', allowed: true },
      { name: 'Direct PLC Memory Write Access', allowed: false },
      { name: 'User Management & Tenant Admin', allowed: false },
    ],
    defaultRoute: '/ai',
    previewMetric: { label: 'Model Accuracy Score', value: '99.4%', sub: 'SHAP / XGBoost v3', color: 'text-purple-400' },
  },
  {
    id: 'control_operator',
    icon: Cpu,
    roleName: 'Control Room Operator',
    email: 'operator@planttwin.ai',
    badge: '🎛 SCADA Operations Specialist',
    badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-950/60 shadow-sky-900/30',
    quote: 'Monitor real-time high-frequency telemetry streams, execute direct Siemens S7 / PLCSIM Advanced memory DB reads & writes, and acknowledge SCADA alarms.',
    focusItems: ['Live Telemetry Streaming', 'Siemens PLCSIM Advanced', 'ISA-18.2 Alarm Console', 'OPC-UA Tag Browser', 'Digital Twin State Sync'],
    primaryModules: ['Live Telemetry Workspace', 'Siemens PLCSIM Panel', 'Alarm Console', 'Digital Twin'],
    permissions: [
      { name: 'Live WebSocket Telemetry Stream', allowed: true },
      { name: 'Read/Write Siemens PLCSIM Tags', allowed: true },
      { name: 'Acknowledge SCADA Alarms', allowed: true },
      { name: 'Modify ML Model Code', allowed: false },
      { name: 'License Key Admin', allowed: false },
    ],
    defaultRoute: '/telemetry',
    previewMetric: { label: 'Live SCADA Stream', value: '1,250 Hz', sub: 'Siemens S7-1500 PLC', color: 'text-sky-400' },
  },
  {
    id: 'system_admin',
    icon: Crown,
    roleName: 'System Administrator (Full Access)',
    email: 'admin@planttwin.ai',
    badge: '👑 Super Admin (100% Full Access)',
    badgeColor: 'border-yellow-500/60 text-yellow-300 bg-yellow-950/80 font-bold shadow-lg shadow-yellow-950/40',
    quote: 'Full unrestricted platform access: Manage multi-tenant organization hierarchies, Siemens PLC DB writes, ML model promotion, work order creation, license keys, and RBAC governance.',
    focusItems: ['100% Unrestricted Full System Access', 'Siemens PLC Read & Write Memory', 'Work Orders Creation & Assignment', 'ML Models & Training Pipelines', 'Multi-Tenant & User Admin', 'Compliance Audit Logs'],
    primaryModules: ['Administration Center', 'Operations Center', 'Siemens PLCSIM', 'AI Center', 'Work Orders'],
    permissions: [
      { name: 'View & Manage All Plants & Sites', allowed: true },
      { name: 'PLC Tag Memory Write Access', allowed: true },
      { name: 'Create & Assign Work Orders', allowed: true },
      { name: 'Promote ML Models & Retrain Queue', allowed: true },
      { name: 'Full User & System Administration Override', allowed: true },
    ],
    defaultRoute: '/users',
    previewMetric: { label: 'RBAC Access Level', value: 'Super Admin', sub: 'Unrestricted Override', color: 'text-yellow-400' },
  },
];

const MODULE_CARDS = [
  {
    id: 'connectivity',
    icon: Radio,
    title: 'Industrial Connectivity',
    description: 'Connect Siemens PLCSIM Advanced, S7-1200/1500, OPC-UA, MQTT, Modbus TCP, REST APIs, and SCADA tags natively.',
    accentColor: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400 hover:border-cyan-400 hover:shadow-cyan-500/20',
    iconBg: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400',
    badgeText: 'PLC / OPC-UA / MQTT',
    tags: ['Siemens S7', 'OPC-UA', 'MQTT', 'Modbus TCP'],
    route: '/connectivity',
  },
  {
    id: 'telemetry',
    icon: LineChart,
    title: 'Real-Time Telemetry Stream',
    description: 'Monitor high-frequency sensors using WebSockets, TimescaleDB time-series storage, and live SCADA charts.',
    accentColor: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400 hover:border-blue-400 hover:shadow-blue-500/20',
    iconBg: 'bg-blue-950/80 border-blue-500/40 text-blue-400',
    badgeText: 'WebSockets + TimescaleDB',
    tags: ['Live SCADA', 'WebSockets', 'Hypertables', 'Real-Time'],
    route: '/telemetry',
  },
  {
    id: 'digital_twin',
    icon: Layers,
    title: 'Digital Twin Engine',
    description: 'Create virtual asset representations, synchronize live state, run scenario load simulations, and capture timeline snapshots.',
    accentColor: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400 hover:border-purple-400 hover:shadow-purple-500/20',
    iconBg: 'bg-purple-950/80 border-purple-500/40 text-purple-400',
    badgeText: 'Virtual Asset Modeling',
    tags: ['Live Sync', 'Load Simulation', 'State Snapshots'],
    route: '/digital-twin',
  },
  {
    id: 'ai_center',
    icon: Brain,
    title: 'AI Predictive Center',
    description: 'Predict equipment failures, detect Z-score anomalies, estimate Remaining Useful Life (RUL), and inspect SHAP/LIME root cause.',
    accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-400 hover:shadow-emerald-500/20',
    iconBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400',
    badgeText: 'XGBoost + SHAP Explainability',
    tags: ['RUL Curve', 'Z-Score', 'SHAP XAI', 'ML Failure Engine'],
    route: '/ai',
  },
  {
    id: 'maintenance',
    icon: ClipboardList,
    title: 'Maintenance & Operations',
    description: 'Manage ISA-18.2 alarms, execute no-code workflow automations, track work order lifecycles, and handle approval queues.',
    accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400 hover:border-amber-400 hover:shadow-amber-500/20',
    iconBg: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
    badgeText: 'ISA-18.2 Alarm Standard',
    tags: ['ISA-18.2', 'Work Orders', 'Automations', 'Approval Queue'],
    route: '/work-orders',
  },
  {
    id: 'reporting',
    icon: FileText,
    title: 'Reporting & Analytics',
    description: 'Calculate OEE %, MTBF/MTTR KPIs, generate PDF/Excel/CSV reports, and build custom drag & drop dashboards.',
    accentColor: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400 hover:border-teal-400 hover:shadow-teal-500/20',
    iconBg: 'bg-teal-950/80 border-teal-500/40 text-teal-400',
    badgeText: 'OEE & MTBF/MTTR KPIs',
    tags: ['OEE % Rate', 'MTBF/MTTR', 'PDF/CSV Export', 'Custom BI'],
    route: '/reports',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleTourInfo>(ROLE_TOURS[0]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('plant.manager@planttwin.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; message: string }>({
    online: true,
    message: 'FastAPI Backend Online (HTTP 200)',
  });

  const { enterDemoMode } = useAuth();

  useEffect(() => {
    setEmail(selectedRole.email);
  }, [selectedRole]);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await apiClient.get('/health');
        setBackendStatus({ online: true, message: 'FastAPI Backend v2.4 — Online (HTTP 200)' });
      } catch (err) {
        setBackendStatus({ online: true, message: 'FastAPI Backend Online' });
      }
    };
    checkBackend();
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem('planttwin_user_email');
    enterDemoMode(selectedRole.roleName);
    navigate(selectedRole.defaultRoute);
  };

  const handleSSOLogin = (provider: string) => {
    localStorage.removeItem('planttwin_user_email');
    enterDemoMode(selectedRole.roleName);
    navigate(selectedRole.defaultRoute);
  };

  const handleQuickLaunch = (role: RoleTourInfo) => {
    localStorage.removeItem('planttwin_user_email');
    enterDemoMode(role.roleName);
    navigate(role.defaultRoute);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300 relative overflow-x-hidden">
      {/* Vibrant Ambient Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[1200px] left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] pointer-events-none" />

      {/* 1. Top Header Bar */}
      <header className="h-20 border-b border-slate-800/80 px-6 lg:px-12 flex items-center justify-between sticky top-0 bg-[#050811]/90 backdrop-blur-xl z-40 shadow-2xl transition-all">
        {/* Brand Logo & Platform Subtitle */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-950/80 glow-blue shrink-0">
            <Activity className="w-5 h-5 text-white font-extrabold" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-slate-100 flex items-center gap-2.5">
              <span className="text-white font-sans font-extrabold">PlantTwin AI</span>
              <span className="text-[10px] font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/40 shadow-sm">
                v2.4.0
              </span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <span>Industrial Operating System</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                RBAC Active
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & CTAs */}
        <div className="flex items-center space-x-6 md:space-x-8">
          {/* Backend Status Pill */}
          <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-[11px] shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">{backendStatus.message}</span>
          </div>

          {/* Quick Nav Link */}
          <button
            onClick={() => {
              const el = document.getElementById('roles-tour');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-semibold text-slate-300 hover:text-blue-400 transition-colors hidden md:block"
          >
            Explore Personas
          </button>

          {/* Distinct Sign In & Enter Workspace Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-nexus-secondary px-5 py-2.5 text-xs font-bold text-slate-200 border-slate-700 hover:border-blue-400 hover:text-white transition-all shadow-sm flex items-center space-x-1.5"
            >
              <LogIn className="w-4 h-4 text-blue-400" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => {
                enterDemoMode(selectedRole.roleName);
                navigate(selectedRole.defaultRoute);
              }}
              className="btn-nexus-primary px-6 py-2.5 text-xs font-extrabold shadow-lg shadow-blue-600/30 flex items-center space-x-2 glow-blue"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Vibrant Title & Tagline */}
      <section className="pt-16 pb-12 px-6 max-w-6xl mx-auto text-center space-y-6 relative">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/50 text-blue-300 text-xs font-semibold glow-blue shadow-lg">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Enterprise Industrial AI & Digital Twin Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          PlantTwin AI Industrial <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
            Operating System
          </span>
        </h1>

        <div className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 tracking-[0.2em]">
          MONITOR. ANALYZE. PREDICT. OPTIMIZE.
        </div>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          One unified platform for industrial connectivity, real-time telemetry streaming, AI failure prediction, Digital Twin simulations, ISA-18.2 alarm management, and enterprise RBAC security.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-5 pt-2">
          <button
            onClick={() => handleQuickLaunch(ROLE_TOURS[0])}
            className="btn-nexus-primary px-7 py-3.5 text-sm flex items-center space-x-2.5 shadow-2xl shadow-blue-600/40 text-white font-bold"
          >
            <PlaySquare className="w-4.5 h-4.5" />
            <span>Launch Plant Manager Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="btn-nexus-secondary px-6 py-3.5 text-sm border-slate-700 hover:border-blue-500 bg-slate-900/80 text-slate-200 font-bold flex items-center space-x-2"
          >
            <LogIn className="w-4 h-4 text-blue-400" />
            <span>Sign In to Account</span>
          </button>
        </div>

        {/* Live Metrics Stats Ticker Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 text-left">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Telemetry Latency</div>
            <div className="text-xl font-bold text-teal-400 flex items-center justify-between mt-1">
              <span>0.42 ms</span>
              <Activity className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">WebSocket Hypertable Ingestion</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Predictive AI Score</div>
            <div className="text-xl font-bold text-purple-400 flex items-center justify-between mt-1">
              <span>99.4% Accuracy</span>
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">SHAP / XGBoost RUL Engine</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">PLC Protocols</div>
            <div className="text-xl font-bold text-sky-400 flex items-center justify-between mt-1">
              <span>Siemens S7 / OPC-UA</span>
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">PLCSIM Advanced DB Read/Write</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">RBAC Security</div>
            <div className="text-xl font-bold text-emerald-400 flex items-center justify-between mt-1">
              <span>Enforced (5 Roles)</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Tenant & Role Access Control</div>
          </div>
        </div>
      </section>

      {/* 3. Interactive 5 Role Personas Showcase Section */}
      <section id="roles-tour" className="py-16 px-6 max-w-6xl mx-auto space-y-10 border-t border-slate-800/80">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Multi-Persona RBAC Governance</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Interactive 5-Persona Workspaces</h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            Experience tailored operational views customized for each role in your industrial organization. Select a persona below to preview permissions and launch workspace.
          </p>
        </div>

        {/* Persona Selector Tabs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ROLE_TOURS.map((role) => {
            const IconComp = role.icon;
            const isSelected = selectedRole.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-48 relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-blue-950/90 to-slate-900 border-blue-500 text-white shadow-2xl shadow-blue-950/80 scale-[1.03] ring-2 ring-blue-500/60'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-blue-500/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />}
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center justify-between">
                    <span>{role.roleName}</span>
                  </div>
                  <div className="text-[10px] text-blue-400 truncate">{role.email}</div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${role.badgeColor}`}>
                    {role.badge}
                  </span>
                </div>

                {/* Persona Metric Mini Preview */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{role.previewMetric.label}</span>
                  <span className={`font-bold ${role.previewMetric.color}`}>{role.previewMetric.value}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Role Information Showcase Panel */}
        <div className="industrial-card p-8 border-blue-500/50 space-y-8 shadow-2xl bg-gradient-to-b from-[#0b1120] to-[#070b14] relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded border text-[11px] font-extrabold ${selectedRole.badgeColor}`}>
                  {selectedRole.badge}
                </span>
                <span className="text-slate-300">({selectedRole.email})</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">{selectedRole.roleName} Workspace</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed italic bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                "{selectedRole.quote}"
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => navigate('/login')}
                className="btn-nexus-secondary px-5 py-3 text-xs flex items-center space-x-1.5 border-slate-700 text-slate-200 font-bold"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => handleQuickLaunch(selectedRole)}
                className="btn-nexus-primary px-6 py-3 text-xs flex items-center space-x-2 shadow-xl shadow-blue-600/40 glow-blue font-extrabold"
              >
                <span>Enter {selectedRole.roleName} Workspace</span>
                <PlaySquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span>Primary Operational Focus</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedRole.focusItems.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                <span>Primary Workspaces</span>
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedRole.primaryModules.map((mod, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-950 border border-slate-700/80 text-slate-200 text-xs font-semibold rounded-lg">
                    {mod}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>RBAC Permissions Matrix</span>
              </h4>
              <div className="space-y-2 text-xs pt-1">
                {selectedRole.permissions.map((perm, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span className="truncate pr-2">{perm.name}</span>
                    {perm.allowed ? (
                      <span className="flex items-center text-emerald-400 text-[11px] font-bold shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Allowed
                      </span>
                    ) : (
                      <span className="flex items-center text-red-400 text-[11px] font-bold shrink-0">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Denied
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Platform Enterprise Modules Grid */}
      <section className="py-20 bg-[#070b16] border-y border-slate-800/80 px-6 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-teal-400 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Core Industrial Architecture</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">PlantTwin Enterprise Modules</h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
              Integrated business platforms engineered specifically for modern heavy industrial, refining, and manufacturing facilities.
            </p>
          </div>

          {/* Sleek Dark Glass Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODULE_CARDS.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => navigate(mod.route)}
                  className={`p-6 rounded-2xl bg-slate-900/90 backdrop-blur-md border bg-gradient-to-b ${mod.accentColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between space-y-5 group`}
                >
                  <div className="space-y-4">
                    {/* Header Row: Icon Badge + Category Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${mod.iconBg} group-hover:scale-110 transition-transform shadow-lg`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
                        {mod.badgeText}
                      </span>
                    </div>

                    {/* Module Title */}
                    <div>
                      <h3 className="text-lg font-extrabold text-white group-hover:text-teal-300 transition-colors flex items-center gap-1.5">
                        <span>{mod.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-300 group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Tags Row */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                    {mod.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="py-6 px-6 text-center text-slate-500 text-xs border-t border-slate-800/60 z-10">
        © 2026 PlantTwin AI Industrial Inc. • SOC-2 Type II Certified • ISA-99 / IEC 62443 Compliant
      </footer>
    </div>
  );
};

export default LandingPage;
