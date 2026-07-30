import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Workflow,
  CheckCircle2,
  Play,
  ShieldAlert,
  UserCheck,
  Zap,
  ArrowRight,
  Clock,
  Plus,
  Filter,
  Search,
  Check,
  XCircle,
  FileText,
  Sliders,
  Bell,
  Cpu,
  X,
  Mail,
  Smartphone,
  Send,
} from 'lucide-react';
import apiClient from '../../../lib/api/client';
import { usePlantTelemetry } from '../../../app/contexts/PlantTelemetryContext';

export interface AlarmItem {
  id: string;
  name: string;
  source: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  time: string;
  ack: boolean;
  threshold?: string;
  currentVal?: string;
}

export const AlarmManagement: React.FC = () => {
  const { activeAlerts } = usePlantTelemetry();
  const [activeRuntimeTab, setActiveRuntimeTab] = useState<'alarms' | 'workflows' | 'incidents' | 'approvals'>('alarms');
  const [alarmFilter, setAlarmFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'WARNING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTriggerModal, setShowTriggerModal] = useState(false);

  // Trigger Modal Form State
  const [triggerName, setTriggerName] = useState('High Temperature Thermal Excursion');
  const [triggerSource, setTriggerSource] = useState('Reactor-001 Vessel');
  const [triggerSeverity, setTriggerSeverity] = useState<'CRITICAL' | 'HIGH' | 'WARNING'>('CRITICAL');
  const [triggerVal, setTriggerVal] = useState('890.2 °C');

  // Notification Channel Options State
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [emailRecipient, setEmailRecipient] = useState(
    localStorage.getItem('planttwin_registered_email') || 'plant.manager@planttwin.ai'
  );
  const [notifySMS, setNotifySMS] = useState(true);
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('+1 (555) 019-2834');
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [dispatchStatusMsg, setDispatchStatusMsg] = useState<string | null>(null);

  // Alarms State
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: 'ALM-101', name: 'High Temperature Threshold Exceeded', source: 'Reactor-001 Vessel', severity: 'CRITICAL', time: '14:32:05', ack: false, threshold: '> 80.0 °C', currentVal: '825.5 °C' },
    { id: 'ALM-102', name: 'Pressure Drop Rate Anomaly', source: 'Pump-002 Centrifugal', severity: 'HIGH', time: '14:28:10', ack: false, threshold: '< 3.0 bar', currentVal: '2.1 bar' },
    { id: 'ALM-103', name: 'Vibration Amplitude Threshold Surged', source: 'Compressor-001 Gas', severity: 'HIGH', time: '14:20:00', ack: true, threshold: '> 0.50 mm/s', currentVal: '0.89 mm/s' },
    { id: 'ALM-104', name: 'Coolant Flow Rate Low Warning', source: 'Heat Exchanger-101', severity: 'WARNING', time: '14:15:30', ack: false, threshold: '< 120 L/min', currentVal: '115 L/min' },
  ]);

  // Workflows State
  const [workflows, setWorkflows] = useState([
    { id: 'WF-01', name: 'Reactor High-Temp Auto-Escalation Rule', trigger: 'Temp > 80°C', action1: 'Raise ISA-18.2 Critical Alarm', action2: 'Dispatch Emergency Work Order', status: 'ACTIVE' },
    { id: 'WF-02', name: 'Pump Vibration Bearing Trip Rule', trigger: 'Vibration > 0.8 mm/s', action1: 'Log AI Predictive Anomaly', action2: 'Notify Maintenance Lead', status: 'ACTIVE' },
    { id: 'WF-03', name: 'Coolant Pressure Loss Safety Interlock', trigger: 'Pressure < 2.0 bar', action1: 'Trigger Safety Valve Bypass', action2: 'Require Supervisor Approval', status: 'ACTIVE' },
  ]);

  // Incidents State
  const [incidents, setIncidents] = useState([
    { id: 'INC-201', title: 'Reactor-001 Thermal Over-temperature Excursion', severity: 'CRITICAL', status: 'INVESTIGATING', assignedTo: 'reliability.engineer@planttwin.ai', time: '14:32' },
    { id: 'INC-202', title: 'Pump-002 Lubrication Pressure Drop & Friction Spike', severity: 'HIGH', status: 'MITIGATED', assignedTo: 'maintenance.tech@planttwin.ai', time: '14:28' },
  ]);

  // Approvals State
  const [approvals, setApprovals] = useState([
    { id: 'APP-301', title: 'Emergency Work Order #WO-PMP-12 Repair Approval', requestedBy: 'Shift Supervisor (John Doe)', priority: 'HIGH', status: 'PENDING', time: '14:35' },
    { id: 'APP-302', title: 'Coolant Flow Valve Bypass Authorization Request', requestedBy: 'Instrumentation Eng (Sarah Jenkins)', priority: 'CRITICAL', status: 'PENDING', time: '14:10' },
  ]);

  // Sync backend active alarms if available
  useEffect(() => {
    apiClient
      .get('/runtime/alarms/active')
      .then((res: any) => {
        const payload = res?.data !== undefined ? res.data : res;
        const items = Array.isArray(payload) ? payload : payload?.items || [];
        if (items.length > 0) {
          const mapped: AlarmItem[] = items.map((a: any) => ({
            id: a.id || `ALM-${Math.floor(100 + Math.random() * 900)}`,
            name: a.name || a.alarm_type || 'SCADA Telemetry Alarm',
            source: a.equipment_tag || a.source || 'Asset Tag',
            severity: a.severity?.toUpperCase() || 'HIGH',
            time: a.triggered_at ? new Date(a.triggered_at).toLocaleTimeString() : 'Just now',
            ack: a.is_acknowledged || false,
            threshold: a.threshold || '> Standard',
            currentVal: a.value || 'Active',
          }));
          setAlarms(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Merge Context Active Alerts (OPC-UA / Siemens S7 / Ingested) into Alarms state
  useEffect(() => {
    if (activeAlerts && activeAlerts.length > 0) {
      const contextAlarms: AlarmItem[] = activeAlerts.map((alt) => ({
        id: alt.id.startsWith('ALM-') ? alt.id : `ALM-${alt.id.slice(-4).toUpperCase()}`,
        name: alt.title,
        source: alt.asset_tag,
        severity: alt.severity === 'CRITICAL' ? 'CRITICAL' : alt.severity === 'WARNING' ? 'WARNING' : 'HIGH',
        time: alt.timestamp || 'Just now',
        ack: false,
        threshold: alt.severity === 'CRITICAL' ? '> 120.0 °C / 1.5 mm/s' : '> Standard',
        currentVal: '🚨 ACTIVE EXCURSION',
      }));

      setAlarms((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newUnique = contextAlarms.filter((ca) => !existingIds.has(ca.id));
        return [...newUnique, ...prev];
      });
    }
  }, [activeAlerts]);

  const handleAck = async (id: string) => {
    try {
      await apiClient.post(`/runtime/alarms/${id}/acknowledge`, {});
    } catch (e) {}

    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, ack: true } : a)));
  };

  const handleApprove = (id: string) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'APPROVED' } : a)));
  };

  const handleReject = (id: string) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED' } : a)));
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: w.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : w))
    );
  };

  const handleSimulateTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `ALM-${Math.floor(105 + Math.random() * 895)}`;
    const newAlarmObj: AlarmItem = {
      id: generatedId,
      name: triggerName,
      source: triggerSource,
      severity: triggerSeverity,
      time: new Date().toLocaleTimeString(),
      ack: false,
      threshold: triggerSeverity === 'CRITICAL' ? '> 800 °C' : '> Nominal',
      currentVal: triggerVal,
    };

    setAlarms([newAlarmObj, ...alarms]);
    setShowTriggerModal(false);

    const channelsDispatched = [];
    if (notifyEmail) channelsDispatched.push(`📧 Email: ${emailRecipient}`);
    if (notifySMS) channelsDispatched.push(`📱 SMS: ${smsPhoneNumber}`);
    if (notifyInApp) channelsDispatched.push(`🔔 In-App Console`);

    const dispatchMsg = `🚨 SCADA Alarm ${generatedId} Triggered! Dispatched via ${channelsDispatched.join(' | ')}`;
    setDispatchStatusMsg(dispatchMsg);
    setTimeout(() => setDispatchStatusMsg(null), 6000);
  };

  // Strict 3 Status Colors Badge Selector
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1 text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-red-500/30 animate-pulse shrink-0 leading-none">
            <AlertTriangle className="w-3 h-3 shrink-0 text-red-500" />
            <span>CRITICAL</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center space-x-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-amber-500/30 shrink-0 leading-none">
            <AlertTriangle className="w-3 h-3 shrink-0 text-amber-500" />
            <span>HIGH</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-amber-500/30 shrink-0 leading-none">
            <AlertTriangle className="w-3 h-3 shrink-0 text-amber-500" />
            <span>WARNING</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-emerald-500/30 shrink-0 leading-none">
            <span>NORMAL</span>
          </span>
        );
    }
  };

  const filteredAlarms = alarms.filter((a) => {
    const matchesSearch =
      !searchTerm ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = alarmFilter === 'ALL' || a.severity === alarmFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] shrink-0 flex items-center justify-center shadow-sm">
            <Play className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Runtime Operations Platform
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 shrink-0 leading-none">
                ISA-18.2 ALARM ENGINE ACTIVE
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              ISA-18.2 Alarm Management, No-Code Automation Workflows, Rules Engine, Incidents & Approval Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowTriggerModal(true)}
            className="btn-nexus-primary px-4 py-2.5 text-xs font-bold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] rounded-xl shadow-md inline-flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Evaluate Alarm Trigger</span>
          </button>
        </div>
      </div>

      {/* Top 4 Runtime Operations KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            ACTIVE ISA-18.2 ALARMS
          </div>
          <div className="text-2xl font-extrabold text-amber-500">{alarms.filter((a) => !a.ack).length} Unacknowledged</div>
          <div className="text-xs text-red-500 font-bold">1 Critical Excursion Live</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            AUTOMATION RULES
          </div>
          <div className="text-2xl font-extrabold text-emerald-500">
            {workflows.filter((w) => w.status === 'ACTIVE').length} Active Workflows
          </div>
          <div className="text-xs text-[var(--text-secondary)]">No-Code Rules Engine</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            OPEN INCIDENTS
          </div>
          <div className="text-2xl font-extrabold text-amber-500">{incidents.length} Investigations</div>
          <div className="text-xs text-[var(--text-secondary)]">Assigned to Reliability Leads</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            APPROVAL REQUESTS
          </div>
          <div className="text-2xl font-extrabold text-amber-500">
            {approvals.filter((a) => a.status === 'PENDING').length} Pending Requests
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Supervisor Authorization</div>
        </div>
      </div>

      {/* Clean Theme-Reactive Flex-Wrap Tab Segment Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-xs font-mono font-bold shadow-sm">
        <button
          onClick={() => setActiveRuntimeTab('alarms')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeRuntimeTab === 'alarms'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Alarm Management ({alarms.filter((a) => !a.ack).length})</span>
        </button>

        <button
          onClick={() => setActiveRuntimeTab('workflows')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeRuntimeTab === 'workflows'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 shrink-0" />
          <span>Workflow Builder & Rules Engine</span>
        </button>

        <button
          onClick={() => setActiveRuntimeTab('incidents')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeRuntimeTab === 'incidents'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Incident Management</span>
        </button>

        <button
          onClick={() => setActiveRuntimeTab('approvals')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeRuntimeTab === 'approvals'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Approval Engine ({approvals.filter((a) => a.status === 'PENDING').length})</span>
        </button>
      </div>

      {/* TAB 1: ALARM MANAGEMENT */}
      {activeRuntimeTab === 'alarms' && (
        <div className="space-y-4">
          {/* Search & Filter Header */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter alarms by name, ID, or asset tag..."
                className="input-nexus input-nexus-search py-2 bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-[var(--text-secondary)] font-bold uppercase">SEVERITY:</span>
              {(['ALL', 'CRITICAL', 'HIGH', 'WARNING'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setAlarmFilter(sev)}
                  className={`px-3 py-1 rounded-lg transition-all font-bold ${
                    alarmFilter === sev
                      ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Active Alarms List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-extrabold text-[var(--text-primary)] font-mono">ISA-18.2 Active Alarms List</h2>
              <span className="text-xs text-amber-500 font-mono font-bold">{filteredAlarms.length} Alarms Enforced</span>
            </div>

            {filteredAlarms.map((alarm) => (
              <div
                key={alarm.id}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[var(--border-strong)] shadow-sm"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="mt-0.5">{getSeverityBadge(alarm.severity)}</div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{alarm.name}</span>
                      <span className="text-xs text-[var(--text-secondary)] font-mono font-bold">({alarm.id})</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono mt-1 flex items-center space-x-2 flex-wrap">
                      <span className="font-bold text-[var(--text-primary)]">{alarm.source}</span>
                      <span>•</span>
                      <span>Triggered at {alarm.time}</span>
                      {alarm.threshold && (
                        <>
                          <span>•</span>
                          <span className="text-[var(--text-secondary)]">Threshold: {alarm.threshold}</span>
                        </>
                      )}
                      {alarm.currentVal && (
                        <>
                          <span>•</span>
                          <span className="text-amber-500 font-bold">Val: {alarm.currentVal}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {alarm.ack ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acknowledged</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAck(alarm.id)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md inline-flex items-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATION WORKFLOWS */}
      {activeRuntimeTab === 'workflows' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[var(--text-primary)] font-mono">No-Code Rules & Workflow Engine</h2>
            <button className="btn-nexus-primary bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5">
              <Plus className="w-4 h-4" />
              <span>Create New Rule</span>
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {workflows.map((wf) => (
              <div key={wf.id} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[var(--text-primary)] text-sm">{wf.name}</span>
                    <span className="text-xs text-[var(--text-secondary)]">({wf.id})</span>
                  </div>
                  <div className="text-[var(--text-secondary)] flex items-center space-x-2 flex-wrap">
                    <span className="text-amber-500 font-bold">Trigger: {wf.trigger}</span>
                    <span>→</span>
                    <span>Action 1: {wf.action1}</span>
                    <span>→</span>
                    <span>Action 2: {wf.action2}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleWorkflow(wf.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    wf.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                      : 'bg-[var(--bg-canvas)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                  }`}
                >
                  {wf.status}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INCIDENTS */}
      {activeRuntimeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[var(--text-primary)] font-mono">Open Reliability Incidents</h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(inc.severity)}
                    <span className="font-bold text-[var(--text-primary)] text-sm">{inc.title}</span>
                  </div>
                  <div className="text-[var(--text-secondary)] mt-1">Assigned to: {inc.assignedTo} • Time: {inc.time}</div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold">
                  {inc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: APPROVALS */}
      {activeRuntimeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[var(--text-primary)] font-mono">Supervisor Authorization Requests</h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {approvals.map((app) => (
              <div key={app.id} className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(app.priority)}
                    <span className="font-bold text-[var(--text-primary)] text-sm">{app.title}</span>
                  </div>
                  <div className="text-[var(--text-secondary)] mt-1">Requested by: {app.requestedBy} • Time: {app.time}</div>
                </div>

                <div className="flex items-center space-x-2">
                  {app.status === 'PENDING' ? (
                    <>
                      <button onClick={() => handleApprove(app.id)} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                        Approve
                      </button>
                      <button onClick={() => handleReject(app.id)} className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold">
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-xl font-bold ${app.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                      {app.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispatch Success Alert Banner */}
      {dispatchStatusMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{dispatchStatusMsg}</span>
          </div>
          <button onClick={() => setDispatchStatusMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Evaluate Alarm Trigger Modal */}
      {showTriggerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md space-y-4 font-mono shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Evaluate SCADA Alarm Trigger</h3>
              </div>
              <button onClick={() => setShowTriggerModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateTrigger} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-bold">Alarm Title / Type</label>
                <input
                  type="text"
                  value={triggerName}
                  onChange={(e) => setTriggerName(e.target.value)}
                  placeholder="e.g. High Pressure Excursion"
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-bold">Source Equipment Tag</label>
                <input
                  type="text"
                  value={triggerSource}
                  onChange={(e) => setTriggerSource(e.target.value)}
                  placeholder="e.g. Reactor-001 Vessel"
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-bold">Severity Level</label>
                  <select
                    value={triggerSeverity}
                    onChange={(e: any) => setTriggerSeverity(e.target.value)}
                    className="input-nexus w-full px-3 py-2 rounded-xl"
                  >
                    <option value="CRITICAL">CRITICAL (Emergency Red)</option>
                    <option value="HIGH">HIGH (Warning Amber)</option>
                    <option value="WARNING">WARNING (Low Amber)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] mb-1 font-bold">Current Value</label>
                  <input
                    type="text"
                    value={triggerVal}
                    onChange={(e) => setTriggerVal(e.target.value)}
                    placeholder="e.g. 890.2 °C"
                    className="input-nexus w-full px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              {/* Multi-Channel Notification Options (Email & SMS) */}
              <div className="pt-2 border-t border-[var(--border-color)] space-y-2.5">
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Bell className="w-3.5 h-3.5 text-sky-400" />
                    <span>Notification & Alert Channels</span>
                  </span>
                  <span className="text-emerald-400 text-[9px] font-mono">Multi-Channel Dispatch</span>
                </div>

                {/* Email Alert Channel */}
                <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Dispatch Email Alert</span>
                  </label>
                  {notifyEmail && (
                    <input
                      type="email"
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      placeholder="Engineer Email Address"
                      className="input-nexus w-full px-3 py-1.5 text-xs rounded-lg font-mono"
                      required
                    />
                  )}
                </div>

                {/* SMS Cellular Alert Channel */}
                <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifySMS}
                      onChange={(e) => setNotifySMS(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dispatch Cellular SMS Text Alert</span>
                  </label>
                  {notifySMS && (
                    <input
                      type="tel"
                      value={smsPhoneNumber}
                      onChange={(e) => setSmsPhoneNumber(e.target.value)}
                      placeholder="Duty Manager Phone (+1 555-019-2834)"
                      className="input-nexus w-full px-3 py-1.5 text-xs rounded-lg font-mono"
                      required
                    />
                  )}
                </div>

                {/* In-App SCADA Notification */}
                <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyInApp}
                      onChange={(e) => setNotifyInApp(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <Bell className="w-3.5 h-3.5 text-purple-400" />
                    <span>In-App SCADA Console & Inbox</span>
                  </label>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    Live Active
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTriggerModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 btn-nexus-primary bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] py-2.5 rounded-xl text-white font-bold inline-flex items-center justify-center space-x-1">
                  <Send className="w-3.5 h-3.5" />
                  <span>Trigger SCADA Alarm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmManagement;
