import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantTwinLogo from '../../components/common/PlantTwinLogo';
import {
  Building2,
  Wrench,
  Brain,
  Cpu,
  Crown,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Shield,
  UserCheck,
  PlaySquare,
  LogIn,
  Sliders,
  Play,
  Check,
  Layers,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../app/contexts/AuthContext';

interface PersonaRoleData {
  id: string;
  roleName: string;
  email: string;
  badge: string;
  badgeColor: string;
  icon: any;
  metricLabel: string;
  metricValue: string;
  metricColor: string;
  quote: string;
  focusItems: string[];
  primaryWorkspaces: string[];
  permissions: { name: string; allowed: boolean }[];
  defaultRoute: string;
  liveScenario: {
    title: string;
    description: string;
    actionOutput: string;
  };
}

const PERSONA_ROLES: PersonaRoleData[] = [
  {
    id: 'plant_manager',
    roleName: 'Plant Manager',
    email: 'plant.manager@planttwin.ai',
    badge: '🏭 Executive Leadership',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/60 shadow-emerald-900/30',
    icon: Building2,
    metricLabel: 'Overall OEE Rate',
    metricValue: '88.4%',
    metricColor: 'text-emerald-400',
    quote: 'Monitor overall plant performance, production KPIs, energy consumption, equipment availability, AI insights, maintenance summaries, and executive reports from a unified dashboard.',
    focusItems: [
      'Production Throughput',
      'Overall OEE (77.8%)',
      'Plant KPIs',
      'Plant Health Score (98.5%)',
      'Executive Dashboards',
      'Reports Export',
    ],
    primaryWorkspaces: ['Operations Center', 'Reporting & Analytics', 'AI Insights', 'Plant Explorer'],
    permissions: [
      { name: 'View All Plants & Sites', allowed: true },
      { name: 'Export Executive PDF/CSV Reports', allowed: true },
      { name: 'View AI Recommendations', allowed: true },
      { name: 'PLC Tag Memory Write Access', allowed: false },
      { name: 'User & System Administration', allowed: false },
    ],
    defaultRoute: '/operations',
    liveScenario: {
      title: 'Plant OEE Target Deviation Alert',
      description: 'Rotterdam Plant Line-02 OEE dropped to 77.8% due to pump cavitation.',
      actionOutput: 'Generated Executive PDF Report & Re-allocated 15% Capacity to Line-03.',
    },
  },
  {
    id: 'maintenance_manager',
    roleName: 'Maintenance Manager',
    email: 'maintenance.manager@planttwin.ai',
    badge: '🔧 Asset Reliability Lead',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/60 shadow-amber-900/30',
    icon: Wrench,
    metricLabel: 'Active Work Orders',
    metricValue: '14 Pending',
    metricColor: 'text-amber-400',
    quote: 'Manage work order lifecycles, preventive maintenance schedules, asset health degradation, spare parts inventory, and emergency technician dispatching.',
    focusItems: [
      'Work Orders Lifecycle',
      'Asset Health Score',
      'Maintenance Schedules',
      'Equipment Downtime',
      'Spare Parts Inventory',
      'Incident Management',
    ],
    primaryWorkspaces: ['Work Orders Center', 'Equipment Workspace', 'Runtime Operations', 'Alert Management'],
    permissions: [
      { name: 'Create & Assign Work Orders', allowed: true },
      { name: 'Manage Asset Maintenance History', allowed: true },
      { name: 'Acknowledge ISA-18.2 Alarms', allowed: true },
      { name: 'Modify ML AI Training Pipelines', allowed: false },
      { name: 'System Licensing & Tenant Settings', allowed: false },
    ],
    defaultRoute: '/work-orders',
    liveScenario: {
      title: 'Pump-002 Drive End Bearing Wear',
      description: 'RUL model estimates 14 Days remaining before impeller seizure.',
      actionOutput: 'Dispatched Emergency Work Order WO-8902 to Lead Tech for SKF 6208 bearing.',
    },
  },
  {
    id: 'ai_specialist',
    roleName: 'AI & Reliability Specialist',
    email: 'ai.specialist@planttwin.ai',
    badge: '🧠 Predictive Intelligence Lead',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-950/60 shadow-purple-900/30',
    icon: Brain,
    metricLabel: 'Model Accuracy Score',
    metricValue: '99.4%',
    metricColor: 'text-purple-400',
    quote: 'Train predictive RUL models, inspect SHAP/LIME feature attributions, run root cause fault tree analyses, and manage the Feast MLOps Feature Store.',
    focusItems: [
      'Remaining Useful Life (RUL)',
      'SHAP & LIME XAI Explanations',
      'Root Cause Analysis (RCA)',
      'Anomaly Detection Models',
      'Feature Store Registry',
      'Model Drift Monitoring',
    ],
    primaryWorkspaces: ['AI Predictive Center', 'Root Cause & XAI', 'Feature Store Registry', 'Model Registry'],
    permissions: [
      { name: 'Train & Deploy ML Models', allowed: true },
      { name: 'Configure Feature Store Pipeline', allowed: true },
      { name: 'Run XAI Telemetry Simulations', allowed: true },
      { name: 'Direct PLC Coil Overrides', allowed: false },
      { name: 'Manage Billing & Subscription', allowed: false },
    ],
    defaultRoute: '/ai',
    liveScenario: {
      title: 'Feature Drift in XGBoost Vibration Model',
      description: 'Sensor noise drift detected on Tag DB10.DBD14 (Pressure Transducer).',
      actionOutput: 'Triggered Automated Model Retraining Pipeline on 100K Feast Embeddings.',
    },
  },
  {
    id: 'operator',
    roleName: 'Control Room Operator',
    email: 'operator@planttwin.ai',
    badge: '💻 SCADA Operations Specialist',
    badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-950/60 shadow-sky-900/30',
    icon: Cpu,
    metricLabel: 'Live SCADA Stream',
    metricValue: '1,250 Hz',
    metricColor: 'text-sky-400',
    quote: 'Monitor real-time high-frequency SCADA telemetry, acknowledge critical ISA-18.2 alarms, inspect live trends, and perform controlled operational overrides.',
    focusItems: [
      'High-Frequency SCADA Stream',
      'ISA-18.2 Alarm Overrides',
      'Live Trend Analysis',
      'Operational Interlocks',
      'Process Value Adjustments',
      'Shift Logs & Notes',
    ],
    primaryWorkspaces: ['Live SCADA Telemetry', 'Alarm Management', 'Runtime Operations', 'Connectivity Hub'],
    permissions: [
      { name: 'Perform PLC Controlled Overrides', allowed: true },
      { name: 'Acknowledge ISA-18.2 Alarms', allowed: true },
      { name: 'View Real-Time Telemetry', allowed: true },
      { name: 'Modify System Architecture', allowed: false },
      { name: 'Delete Audit History Logs', allowed: false },
    ],
    defaultRoute: '/telemetry',
    liveScenario: {
      title: 'Reactor Excursion Warning (520 Bar)',
      description: 'ISA-18.2 High-High alarm triggered on Siemens S7 DB1.DBX0.0 coil.',
      actionOutput: 'Executed Closed-Loop Bypass Valve Override +12% Open.',
    },
  },
  {
    id: 'admin',
    roleName: 'System Administrator (Full Access)',
    email: 'admin@planttwin.ai',
    badge: '👑 Super Admin (100% Full Access)',
    badgeColor: 'border-yellow-500/60 text-yellow-300 bg-yellow-950/80 font-bold shadow-yellow-900/40',
    icon: Crown,
    metricLabel: 'RBAC Access Level',
    metricValue: 'Super Admin',
    metricColor: 'text-yellow-300',
    quote: 'Full operational, security, and administrative control over the entire PlantTwin AI tenant, including user management, protocol drivers, audit logs, and system settings.',
    focusItems: [
      'Multi-Tenant Management',
      'User RBAC Permissions',
      'Industrial Protocol Drivers',
      'Audit Logs & Compliance',
      'API Keys & Webhooks',
      'System Architecture Config',
    ],
    primaryWorkspaces: ['User Management', 'Audit Logs', 'Connectivity Hub', 'System Settings', 'All Workspaces'],
    permissions: [
      { name: 'Full Read & Write System Access', allowed: true },
      { name: 'Manage User Accounts & Roles', allowed: true },
      { name: 'Configure Siemens S7 & OPC-UA', allowed: true },
      { name: 'Full PLC Tag Write Access', allowed: true },
      { name: 'Manage Enterprise Subscriptions', allowed: true },
    ],
    defaultRoute: '/operations',
    liveScenario: {
      title: 'New OPC-UA Driver Node Registration',
      description: 'Adding 64 new SCADA tags for Houston Refinery Expansion.',
      actionOutput: 'Configured Driver Gateway opc.tcp://192.168.1.100:4840 & Provisioned Roles.',
    },
  },
];

export const PersonaHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { enterDemoMode } = useAuth();
  const [selectedRole, setSelectedRole] = useState<PersonaRoleData>(PERSONA_ROLES[0]);
  const [simRunning, setSimRunning] = useState(false);

  const handleLaunchWorkspace = (role: PersonaRoleData) => {
    enterDemoMode(role.roleName);
    localStorage.setItem('planttwin_user_email', role.email);
    window.dispatchEvent(new Event('planttwin:org-updated'));
    navigate(role.defaultRoute);
  };

  const handleTestSim = () => {
    setSimRunning(true);
    setTimeout(() => {
      setSimRunning(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />

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

      {/* Main Content Area */}
      <main className="flex-1 px-4 lg:px-8 py-10 max-w-7xl mx-auto w-full flex flex-col items-center">
        {/* Title & Subtitle */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white text-center mb-3">
          Interactive 5-Persona Workspaces
        </h1>
        <p className="text-slate-400 text-center max-w-2xl text-xs sm:text-sm mb-10 leading-relaxed">
          Experience tailored operational views customized for each role in your industrial organization. Select a persona below to preview permissions and launch workspace.
        </p>

        {/* Top 5 Persona Selection Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full mb-8">
          {PERSONA_ROLES.map((r) => {
            const isSelected = selectedRole.id === r.id;
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative group ${
                  isSelected
                    ? 'bg-slate-900/95 border-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.3)] ring-2 ring-blue-500/50'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                {/* Active Indicator Pulse */}
                {isSelected && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}

                <div>
                  <div className={`p-2.5 rounded-xl border w-fit mb-3 ${r.badgeColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">{r.roleName}</h3>
                  <div className="text-[10px] text-slate-400 font-mono truncate mb-2.5">{r.email}</div>

                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold border mb-3 ${r.badgeColor}`}>
                    {r.badge}
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">{r.metricLabel}</span>
                  <span className={`font-bold ${r.metricColor}`}>{r.metricValue}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Detailed Workspace Preview Box */}
        <div className="w-full bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl mb-12">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-mono uppercase font-extrabold text-emerald-400 tracking-wider mb-1">
                <span>{selectedRole.badge}</span>
                <span className="text-slate-500">({selectedRole.email.toUpperCase()})</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedRole.roleName} Workspace</h2>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleTestSim}
                disabled={simRunning}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-500 text-xs font-bold text-cyan-300 transition-all flex items-center space-x-1.5 shrink-0"
              >
                <Zap className={`w-4 h-4 text-cyan-400 ${simRunning ? 'animate-spin' : ''}`} />
                <span>{simRunning ? 'Simulating Event...' : 'Test Persona Scenario'}</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-200 transition-all flex items-center space-x-1.5 shrink-0"
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => handleLaunchWorkspace(selectedRole)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center space-x-2 shrink-0"
              >
                <span>Enter {selectedRole.roleName} Workspace</span>
                <PlaySquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Interactive Scenario Trigger Result */}
          {simRunning ? (
            <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/50 text-cyan-200 text-xs font-mono mb-6 animate-pulse">
              ⚡ <strong>Simulating Real-Time Event for {selectedRole.roleName}:</strong> {selectedRole.liveScenario.title}... Processing telemetry stream & AI actions...
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 text-xs sm:text-sm text-slate-300 italic mb-8 leading-relaxed">
              "{selectedRole.quote}"
            </div>
          )}

          {/* 3 Grid Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Primary Operational Focus */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-4">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>PRIMARY OPERATIONAL FOCUS</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {selectedRole.focusItems.map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: Primary Workspaces */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-4">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>PRIMARY WORKSPACES</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.primaryWorkspaces.map((ws, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                    >
                      {ws}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: RBAC Permissions Matrix */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-4">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>RBAC PERMISSIONS MATRIX</span>
                </div>
                <div className="space-y-2.5 text-xs font-mono">
                  {selectedRole.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-slate-300">{perm.name}</span>
                      {perm.allowed ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Allowed</span>
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Denied</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Persona Governance Comparison Matrix */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
          <div className="text-center mb-6">
            <h3 className="text-xl font-black text-white">5-Persona RBAC Governance Comparison Matrix</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Side-by-side breakdown of operational scope and PLC write authority</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">User Persona</th>
                  <th className="py-3 px-4">Operational Scope</th>
                  <th className="py-3 px-4">PLC Write Level</th>
                  <th className="py-3 px-4">Primary Decision Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {PERSONA_ROLES.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${role.metricColor}`} />
                      <span>{role.roleName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {role.id === 'plant_manager' ? 'All Plant Sites & Refineries' : role.id === 'admin' ? 'Global Multi-Tenant Infrastructure' : 'Single Production Facility'}
                    </td>
                    <td className="py-3.5 px-4">
                      {role.permissions.some(p => p.name.includes('Write Access') && p.allowed) ? (
                        <span className="text-emerald-400 font-bold">● Allowed (Tag Overrides)</span>
                      ) : (
                        <span className="text-slate-500">○ Read-Only Monitoring</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-cyan-300">
                      {role.liveScenario.actionOutput}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonaHubPage;
