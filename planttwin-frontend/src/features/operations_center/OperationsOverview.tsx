import React, { useState } from 'react';
import {
  Building2,
  Cpu,
  Workflow,
  Bell,
  Activity,
  ChevronRight,
  PlusCircle,
  BarChart2,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import MetricInspectorModal, { MetricInspectorData } from '../../components/dialogs/MetricInspectorModal';
import AlertInspectorModal from '../../components/dialogs/AlertInspectorModal';
import { usePlantTelemetry } from '../../app/contexts/PlantTelemetryContext';

export const OperationsOverview: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [inspectorData, setInspectorData] = useState<MetricInspectorData | null>(null);
  const [alertInspectorFilter, setAlertInspectorFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'NORMAL' | null>(null);
  const { systemHealthScore, activeAlerts, telemetryStream, equipmentList } = usePlantTelemetry();

  const openMetricInspector = (metricName: string) => {
    switch (metricName) {
      case 'temperature':
        setInspectorData({
          title: 'Temperature (°C)',
          currentValue: telemetryStream[telemetryStream.length - 1]?.temp || 68.4,
          unit: '°C',
          median: 74.2,
          mean: 72.8,
          min: 68.0,
          max: 825.5,
          stdDev: 12.4,
          zScore: 1.65,
          chartData: equipmentList.map((eq) => ({ name: eq.name, value: eq.temp })),
        });
        break;

      case 'pressure':
        setInspectorData({
          title: 'Pressure (bar)',
          currentValue: 520,
          unit: 'bar',
          median: 520.0,
          mean: 524.8,
          min: 515.0,
          max: 565.0,
          stdDev: 14.1,
          zScore: 0.41,
          chartData: [
            { name: 'Reactor-001', value: 555 },
            { name: 'Pump-002', value: 520 },
            { name: 'Compressor-001', value: 515 },
          ],
        });
        break;

      case 'vibration':
        setInspectorData({
          title: 'Vibration Amplitude (mm/s)',
          currentValue: telemetryStream[telemetryStream.length - 1]?.vibration || 0.18,
          unit: 'mm/s',
          median: 0.35,
          mean: 0.42,
          min: 0.08,
          max: 0.92,
          stdDev: 0.28,
          zScore: 1.48,
          chartData: equipmentList.map((eq) => ({ name: eq.name, value: eq.vibration })),
        });
        break;

      case 'health':
        setInspectorData({
          title: 'System Health Index (%)',
          currentValue: systemHealthScore,
          unit: '%',
          median: 88.5,
          mean: 84.2,
          min: 64.2,
          max: 98.5,
          stdDev: 8.8,
          zScore: -0.92,
          chartData: [
            { name: 'Backend Services', value: 100 },
            { name: 'Database', value: 98 },
            { name: 'Connectivity', value: 97 },
            { name: 'AI Services', value: 96 },
          ],
        });
        break;

      default:
        break;
    }
  };

  // Strict 3-Status Color Palette Alignment
  const equipmentStatusData = [
    { name: 'Healthy', value: equipmentList.filter((e) => e.status === 'Healthy').length, color: '#10B981' },
    { name: 'Warning', value: equipmentList.filter((e) => e.status === 'Warning').length, color: '#F59E0B' },
    { name: 'Critical', value: equipmentList.filter((e) => e.status === 'Critical').length, color: '#EF4444' },
  ];

  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'WARNING').length;
  const infoCount = activeAlerts.filter((a) => (a.severity as string) === 'INFO' || (a.severity as string) === 'NORMAL').length;

  const alertSummaryData = [
    { name: 'Critical', value: criticalCount, color: '#EF4444' },
    { name: 'Warning', value: warningCount, color: '#F59E0B' },
    { name: 'Normal', value: infoCount, color: '#10B981' },
  ];

  const systemComponents = [
    { name: 'FastAPI Backend Services', status: 100 },
    { name: 'TimescaleDB Hypertables', status: 98 },
    { name: 'Connectivity Hub (Siemens S7/OPC-UA)', status: 97 },
    { name: 'AI Pipeline Engine', status: Math.round(systemHealthScore) },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Inspector Modal */}
      <MetricInspectorModal data={inspectorData} onClose={() => setInspectorData(null)} />

      {/* ISA-18.2 Active Alert Inspector Modal */}
      {alertInspectorFilter && (
        <AlertInspectorModal
          initialSeverityFilter={alertInspectorFilter}
          alerts={activeAlerts}
          onClose={() => setAlertInspectorFilter(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans">Operations Overview</h1>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
              LIVE SCADA
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Real-time operational KPIs, live telemetry stream, and SCADA analytics</p>
        </div>

        {/* Time Filter Controls */}
        <div className="flex items-center space-x-2 bg-[var(--bg-card)] border border-[var(--border-color)] p-1.5 rounded-xl text-xs shadow-md">
          <button className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-emerald-400 bg-emerald-950/60 font-bold border border-emerald-500/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real-time Sync Active</span>
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-lg transition-colors font-mono font-bold ${
              timeRange === '7d' ? 'text-[var(--brand-primary)] bg-[var(--bg-canvas)] border border-[var(--border-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Last 7 Days
          </button>
        </div>
      </div>

      {/* Top 5 KPI Cards with Monochrome Icons & Strict 3-Color Severity Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: PLANTS */}
        <div
          onClick={() => openMetricInspector('health')}
          className="industrial-card p-4 flex flex-col justify-between cursor-pointer industrial-card-hover bg-[var(--bg-card)] border border-[var(--border-color)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">PLANTS</span>
            {/* Monochrome Neutral Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 shadow-md">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">1</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[var(--text-secondary)] truncate">Refinery Alpha</span>
              <span className="text-emerald-400 font-bold font-mono">100% Active</span>
            </div>
          </div>
        </div>

        {/* Card 2: REGISTERED EQUIPMENT */}
        <div
          onClick={() => openMetricInspector('temperature')}
          className="industrial-card p-4 flex flex-col justify-between cursor-pointer industrial-card-hover bg-[var(--bg-card)] border border-[var(--border-color)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">EQUIPMENT</span>
            {/* Monochrome Neutral Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 shadow-md">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">{equipmentList.length}</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[var(--text-secondary)] truncate">SCADA Assets</span>
              <span className="text-emerald-400 font-bold font-mono">Active</span>
            </div>
          </div>
        </div>

        {/* Card 3: ACTIVE WORKFLOWS */}
        <div
          onClick={() => openMetricInspector('health')}
          className="industrial-card p-4 flex flex-col justify-between cursor-pointer industrial-card-hover bg-[var(--bg-card)] border border-[var(--border-color)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">WORKFLOWS</span>
            {/* Monochrome Neutral Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 shadow-md">
              <Workflow className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">2</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[var(--text-secondary)] truncate">Auto Escalation</span>
              <span className="text-emerald-400 font-bold font-mono">Running</span>
            </div>
          </div>
        </div>

        {/* Card 4: ACTIVE ALERTS (INTERACTIVE SEVERITY INSPECTION) */}
        <div
          onClick={() => setAlertInspectorFilter('ALL')}
          className="industrial-card p-4 flex flex-col justify-between cursor-pointer industrial-card-hover bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">ACTIVE ALERTS</span>
            {/* Monochrome Neutral Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 shadow-md">
              <Bell className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">{activeAlerts.length}</span>
              <span className="text-[10px] font-mono font-bold text-amber-400">ISA-18.2 LIVE</span>
            </div>

            {/* Clear Severity Breakdown: Critical 🔴 | Warning 🟠 | Normal 🟢 */}
            <div className="grid grid-cols-3 gap-1 pt-2 font-mono text-[10px] border-t border-[var(--border-color)] mt-2">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setAlertInspectorFilter('CRITICAL');
                }}
                className="flex items-center space-x-1 text-red-400 font-bold hover:underline cursor-pointer hover:bg-rose-500/10 p-0.5 rounded transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>Critical: {criticalCount}</span>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setAlertInspectorFilter('WARNING');
                }}
                className="flex items-center space-x-1 text-amber-400 font-bold hover:underline cursor-pointer hover:bg-amber-500/10 p-0.5 rounded transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Warning: {warningCount}</span>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setAlertInspectorFilter('NORMAL');
                }}
                className="flex items-center space-x-1 text-emerald-400 font-bold hover:underline cursor-pointer hover:bg-emerald-500/10 p-0.5 rounded transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Normal: {infoCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: SYSTEM HEALTH */}
        <div
          onClick={() => openMetricInspector('health')}
          className="industrial-card p-4 flex flex-col justify-between cursor-pointer industrial-card-hover bg-[var(--bg-card)] border border-[var(--border-color)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">SYSTEM HEALTH</span>
            {/* Monochrome Neutral Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 shadow-md">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-extrabold font-mono ${systemHealthScore < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {systemHealthScore}%
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[var(--text-secondary)] truncate">Overall Index</span>
              <span className={`font-bold font-mono ${systemHealthScore < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {systemHealthScore < 70 ? 'STRESS' : 'OPTIMAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Telemetry Stream Chart + Live Real-Time Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Live Telemetry Overview Line Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)]">Live Real-Time Telemetry Stream</h2>
              <p className="text-xs text-[var(--text-secondary)]">High-frequency stream updated from Siemens S7 PLC & TimescaleDB ingestion</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/40 shrink-0">
              Sync Active (1,250 Hz)
            </span>
          </div>

          {/* Metric Legend Pills */}
          <div className="flex items-center space-x-3 text-xs pt-1 flex-wrap gap-y-2 font-mono">
            <button
              onClick={() => openMetricInspector('temperature')}
              className="flex items-center space-x-2 bg-[var(--bg-canvas)] border border-slate-700 px-3 py-1.5 rounded-xl hover:border-slate-600 transition-colors shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[var(--text-primary)] font-bold">
                Temp: {telemetryStream[telemetryStream.length - 1]?.temp || 68.4} °C
              </span>
              <BarChart2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            <button
              onClick={() => openMetricInspector('vibration')}
              className="flex items-center space-x-2 bg-[var(--bg-canvas)] border border-amber-500/40 px-3 py-1.5 rounded-xl hover:border-amber-400 transition-colors shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[var(--text-primary)] font-bold">
                Vibration: {telemetryStream[telemetryStream.length - 1]?.vibration || 0.18} mm/s
              </span>
              <BarChart2 className="w-3.5 h-3.5 text-amber-400 ml-1" />
            </button>

            <button
              onClick={() => openMetricInspector('pressure')}
              className="flex items-center space-x-2 bg-[var(--bg-canvas)] border border-emerald-500/40 px-3 py-1.5 rounded-xl hover:border-emerald-400 transition-colors shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[var(--text-primary)] font-bold">Pressure: 520 bar</span>
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            </button>
          </div>

          {/* Line Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryStream} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="timestamp" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="temp" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3.5 }} activeDot={{ r: 6 }} name="Temp (°C)" />
                <Line type="monotone" dataKey="vibration" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3.5 }} activeDot={{ r: 6 }} name="Vibration (mm/s)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1/3: Live Real-Time Alerts (Strict 3 Status Colors) */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[var(--text-primary)]">Live Real-Time Alerts</h2>
                <p className="text-xs text-[var(--text-secondary)] font-mono">ISA-18.2 SCADA Alarms</p>
              </div>
              <a href="/alerts" className="text-xs font-mono font-bold text-emerald-400 hover:underline">
                View All →
              </a>
            </div>

            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-500 animate-ping'
                          : alert.severity === 'WARNING'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">{alert.title}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono">{alert.asset_tag}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">{alert.timeAgo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: 4 Component Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Equipment Status Donut */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)]">Equipment Status</h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">Live Asset Health</p>
            </div>
            <a href="/equipment" className="text-[11px] font-mono font-bold text-emerald-400 hover:underline">
              View All
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-32 w-32 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={equipmentStatusData} innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value">
                    {equipmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-extrabold text-[var(--text-primary)] font-mono">{equipmentList.length}</span>
                <span className="text-[9px] text-[var(--text-secondary)] font-mono uppercase">Assets</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs flex-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Healthy</span>
                </span>
                <span className="font-bold text-[var(--text-primary)]">{equipmentList.filter((e) => e.status === 'Healthy').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Warning</span>
                </span>
                <span className="font-bold text-[var(--text-primary)]">{equipmentList.filter((e) => e.status === 'Warning').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Critical</span>
                </span>
                <span className="font-bold text-[var(--text-primary)]">{equipmentList.filter((e) => e.status === 'Critical').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Alert Summary Donut */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)]">Alert Summary</h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">ISA-18.2 Severity</p>
            </div>
            <a href="/alerts" className="text-[11px] font-mono font-bold text-emerald-400 hover:underline">
              View All
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-32 w-32 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={alertSummaryData} innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value">
                    {alertSummaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-extrabold text-[var(--text-primary)] font-mono">{activeAlerts.length}</span>
                <span className="text-[9px] text-[var(--text-secondary)] font-mono uppercase">Total</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs flex-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Critical</span>
                </span>
                <span className="font-bold text-[var(--text-primary)]">{criticalCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Warning</span>
                </span>
                <span className="font-bold text-[var(--text-primary)]">{warningCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Normal</span>
                </span>
                <span className="font-bold text-[var(--text-primary)]">{infoCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: System Health Progress Bars */}
        <div
          onClick={() => openMetricInspector('health')}
          className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--text-primary)]">System Services</h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">Health Index</p>
            </div>
            <span className={`text-[11px] font-mono font-bold ${systemHealthScore < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {systemHealthScore}%
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {systemComponents.map((comp) => (
              <div key={comp.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-secondary)] font-mono truncate max-w-[140px]">{comp.name}</span>
                  <span className="font-bold text-emerald-400 font-mono flex items-center">
                    {comp.status}% <ChevronRight className="w-3 h-3 ml-0.5 text-slate-500" />
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-canvas)] rounded-full overflow-hidden border border-[var(--border-color)]">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${comp.status}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Quick Actions */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-1 font-mono uppercase tracking-wider">Quick Actions</h3>

          <div className="space-y-2">
            <a
              href="/work-orders"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-[var(--text-primary)]">
                <PlusCircle className="w-4 h-4 text-slate-400" />
                <span>Create Work Order</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </a>

            <a
              href="/connectivity"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-emerald-500/50 transition-colors group"
            >
              <div className="flex items-center space-x-2 text-xs font-bold text-[var(--text-primary)]">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Siemens S7 & CSV Hub</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsOverview;
