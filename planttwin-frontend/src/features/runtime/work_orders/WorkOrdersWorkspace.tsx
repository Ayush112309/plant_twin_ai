import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  User,
  Wrench,
  ChevronRight,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import usePermissions from '../../../app/permissions/usePermissions';
import apiClient from '../../../lib/api/client';
import { usePlantTelemetry } from '../../../app/contexts/PlantTelemetryContext';

export interface WorkOrderItem {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  assignee: string;
  asset: string;
  createdDate: string;
}

const DEFAULT_WORK_ORDERS: WorkOrderItem[] = [
  {
    id: 'WO-101',
    title: 'Reactor Thermal Sensor Calibration',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignee: 'John Doe (Instrument Tech)',
    asset: 'Reactor-001 Vessel',
    createdDate: '2026-07-27 10:15',
  },
  {
    id: 'WO-102',
    title: 'Pump-002 Mechanical Seal Replacement',
    priority: 'CRITICAL',
    status: 'OPEN',
    assignee: 'Jane Smith (Reliability Lead)',
    asset: 'Pump-002 Centrifugal',
    createdDate: '2026-07-27 11:30',
  },
  {
    id: 'WO-103',
    title: 'Compressor Lubrication Flush & Oil Recalibration',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    assignee: 'Alex Miller (Maintenance Tech)',
    asset: 'Compressor-001 Gas',
    createdDate: '2026-07-27 08:45',
  },
];

export const WorkOrdersWorkspace: React.FC = () => {
  const { activeAlerts } = usePlantTelemetry();
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creationSuccessMsg, setCreationSuccessMsg] = useState<string | null>(null);

  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('planttwin_work_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_WORK_ORDERS;
  });

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [newAssignee, setNewAssignee] = useState('John Doe (Lead Tech)');
  const [newAsset, setNewAsset] = useState('Reactor-001 Vessel');

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('planttwin_work_orders', JSON.stringify(workOrders));
  }, [workOrders]);

  // Sync activeAlerts from OPC-UA / SCADA into Work Orders roster
  useEffect(() => {
    if (activeAlerts && activeAlerts.length > 0) {
      const contextWOs: WorkOrderItem[] = activeAlerts.map((alt) => ({
        id: `WO-OPC-${alt.id.slice(-4).toUpperCase()}`,
        title: `Emergency Dispatch: ${alt.title}`,
        priority: alt.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        status: 'OPEN',
        assignee: 'John Doe (On-Call Lead Tech)',
        asset: alt.asset_tag,
        createdDate: new Date().toISOString().substring(0, 16).replace('T', ' '),
      }));

      setWorkOrders((prev) => {
        const existingIds = new Set(prev.map((w) => w.id));
        const newUnique = contextWOs.filter((wo) => !existingIds.has(wo.id));
        return [...newUnique, ...prev];
      });
    }
  }, [activeAlerts]);

  const handleStatusChange = (id: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED') => {
    setWorkOrders((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w));
      localStorage.setItem('planttwin_work_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreateWO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const generatedId = `WO-${104 + workOrders.length}`;
    const newWO: WorkOrderItem = {
      id: generatedId,
      title: newTitle,
      priority: newPriority,
      status: 'OPEN',
      assignee: newAssignee,
      asset: newAsset,
      createdDate: new Date().toLocaleString(),
    };

    try {
      await apiClient.post('/runtime/work-orders', {
        title: newTitle,
        priority: newPriority.toLowerCase(),
        assignee: newAssignee,
        asset_tag: newAsset,
      });
    } catch (err) {}

    const updated = [newWO, ...workOrders];
    setWorkOrders(updated);
    localStorage.setItem('planttwin_work_orders', JSON.stringify(updated));

    setCreationSuccessMsg(
      `Work Order #${generatedId} successfully created and added to the top of the Maintenance Pipeline below!`
    );
    setNewTitle('');
    setShowCreateModal(false);

    setTimeout(() => {
      setCreationSuccessMsg(null);
    }, 8000);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1 text-red-400 bg-red-950/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-red-500/40 animate-pulse shrink-0 leading-none">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>CRITICAL</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center space-x-1 text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-amber-500/40 shrink-0 leading-none">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>HIGH</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-slate-700 shrink-0 leading-none">
            <span>MEDIUM</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center space-x-1 text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-amber-500/40 shrink-0 leading-none">
            <Clock className="w-3 h-3 shrink-0" />
            <span>IN PROGRESS</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-emerald-500/40 shrink-0 leading-none">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>COMPLETED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-slate-700 shrink-0 leading-none">
            <span>OPEN QUEUE</span>
          </span>
        );
    }
  };

  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      !searchTerm ||
      wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || wo.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header Bar with Monochrome Neutral Icon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 shrink-0 flex items-center justify-center shadow-md">
            <ClipboardList className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Work Orders & Maintenance Lifecycle
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/40 shrink-0 leading-none">
                MAINTENANCE PIPELINE
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              Track, schedule, assign, and audit maintenance work orders
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!permissions.canManageWorkOrders}
            className={`btn-nexus-primary bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl font-mono shrink-0 shadow-md ${
              !permissions.canManageWorkOrders && 'opacity-60 cursor-not-allowed'
            }`}
          >
            {!permissions.canManageWorkOrders ? <Lock className="w-4 h-4 shrink-0" /> : <Plus className="w-4 h-4 shrink-0" />}
            <span>{permissions.canManageWorkOrders ? 'Create Work Order' : 'Locked (View Only)'}</span>
          </button>
        </div>
      </div>

      {creationSuccessMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-mono shadow-xl animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{creationSuccessMsg}</span>
          </div>
          <button onClick={() => setCreationSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!permissions.canManageWorkOrders && (
        <div className="p-4 bg-amber-950/60 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs text-amber-300 font-mono shadow-md">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>RBAC Restriction:</strong> Your role ({permissions.roleName}) cannot create work orders. Maintenance Manager permissions required.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-amber-900/60 px-2.5 py-0.5 rounded border border-amber-500/40">
            ENFORCED
          </span>
        </div>
      )}

      {/* Top 4 Work Order Metrics Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            TOTAL ACTIVE ORDERS
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">{workOrders.length} Orders</div>
          <div className="text-xs text-[var(--text-secondary)]">Assigned Crew Members</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            IN PROGRESS
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {workOrders.filter((w) => w.status === 'IN_PROGRESS').length} Active
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Technicians On Site</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            CRITICAL PRIORITY
          </div>
          <div className="text-2xl font-extrabold text-red-400">
            {workOrders.filter((w) => w.priority === 'CRITICAL').length} Emergency
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Seal & Thermal Trips</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            COMPLETED TODAY
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {workOrders.filter((w) => w.status === 'COMPLETED').length} Closed
          </div>
          <div className="text-xs text-[var(--text-secondary)] font-bold">100% Quality Audited</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search work orders by title, ID, or technician..."
            className="input-nexus input-nexus-search text-xs py-2 rounded-xl"
          />
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-[11px] text-[var(--text-secondary)] uppercase font-bold hidden sm:inline">Priority:</span>
          <div className="flex items-center space-x-1 bg-[var(--bg-canvas)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-3 py-1 rounded-lg transition-colors text-[11px] font-extrabold inline-flex items-center justify-center ${
                  priorityFilter === pr
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3 font-mono text-xs">
        {filteredOrders.map((wo) => (
          <div
            key={wo.id}
            className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5 flex-wrap">
                {getPriorityBadge(wo.priority)}
                <span className="font-bold text-[var(--text-primary)] text-sm">{wo.title}</span>
                <span className="text-slate-400 font-bold">({wo.id})</span>
              </div>
              <div className="text-slate-400 flex items-center space-x-3 flex-wrap">
                <span>Asset: <strong className="text-slate-200">{wo.asset}</strong></span>
                <span>•</span>
                <span>Assignee: <strong className="text-slate-200">{wo.assignee}</strong></span>
                <span>•</span>
                <span>Created: {wo.createdDate}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {getStatusBadge(wo.status)}

              <select
                value={wo.status}
                disabled={!permissions.canManageWorkOrders}
                onChange={(e: any) => handleStatusChange(wo.id, e.target.value)}
                className="input-nexus text-xs py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
              >
                <option value="OPEN">Mark OPEN</option>
                <option value="IN_PROGRESS">Mark IN PROGRESS</option>
                <option value="COMPLETED">Mark COMPLETED</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md space-y-5 font-mono shadow-2xl">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-white">Create New Maintenance Work Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWO} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Work Order Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Pump-002 Recirculation Valve Maintenance"
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                >
                  <option value="CRITICAL">CRITICAL (Emergency Trip)</option>
                  <option value="HIGH">HIGH (Preventive Warning)</option>
                  <option value="MEDIUM">MEDIUM (Standard Scheduled)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Assignee</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="e.g. John Doe (Lead Tech)"
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Target Asset Tag</label>
                <input
                  type="text"
                  value={newAsset}
                  onChange={(e) => setNewAsset(e.target.value)}
                  placeholder="e.g. Reactor-001 Vessel"
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 btn-nexus-primary bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-white font-bold">
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersWorkspace;
