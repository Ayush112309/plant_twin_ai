import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';
import apiClient from '../../../lib/api/client';
import PIDDiagramViewer from '../../../components/common/PIDDiagramViewer';
import PlantGISMap from '../../../components/maps/PlantGISMap';
import AssetEventTimeline from '../../../components/common/AssetEventTimeline';

export interface AssetEquipment {
  id: string;
  name: string;
  asset_tag: string;
  equipment_type: string;
  status: 'RUNNING' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  health_score: number;
  location?: string;
  installed_date?: string;
}

export const EquipmentWorkspace: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<AssetEquipment[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetEquipment>({
    id: 'Reactor-001',
    name: 'Reactor-001 Vessel',
    asset_tag: 'EQ-RX-001',
    equipment_type: 'Reactor Vessel',
    status: 'CRITICAL',
    health_score: 42,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RUNNING' | 'WARNING' | 'CRITICAL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Asset Form State
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newType, setNewType] = useState('Centrifugal Pump');
  const [newStatus, setNewStatus] = useState<'RUNNING' | 'WARNING' | 'CRITICAL'>('RUNNING');

  const fetchEquipment = () => {
    apiClient
      .get('/assets/equipment')
      .then((res: any) => {
        const payload = res?.data !== undefined ? res.data : res;
        const items = Array.isArray(payload) ? payload : payload?.items || [];
        if (items.length > 0) {
          const mapped = items.map((item: any) => ({
            id: item.id || item.asset_tag || `EQ-${Math.random()}`,
            name: item.name,
            asset_tag: item.asset_tag || item.tag || 'EQ-TAG',
            equipment_type: item.equipment_type || item.type || 'Industrial Asset',
            status: item.status?.toUpperCase() || 'RUNNING',
            health_score: item.health_score || (item.status === 'CRITICAL' ? 42 : item.status === 'WARNING' ? 74 : 95),
          }));
          setEquipmentList(mapped);
          setSelectedAsset(mapped[0]);
        } else {
          loadFallbackEquipment();
        }
      })
      .catch(() => {
        loadFallbackEquipment();
      });
  };

  const loadFallbackEquipment = () => {
    const fallback: AssetEquipment[] = [
      { id: 'Reactor-001', name: 'Reactor-001 Vessel', asset_tag: 'EQ-RX-001', equipment_type: 'Reactor Vessel', status: 'CRITICAL', health_score: 42 },
      { id: 'Pump-002', name: 'Pump-002 Centrifugal', asset_tag: 'EQ-PMP-002', equipment_type: 'Centrifugal Pump', status: 'WARNING', health_score: 74 },
      { id: 'Compressor-001', name: 'Compressor-001 Gas', asset_tag: 'EQ-CMP-001', equipment_type: 'Gas Compressor', status: 'RUNNING', health_score: 95 },
    ];
    setEquipmentList(fallback);
    setSelectedAsset(fallback[0]);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setIsSubmitting(true);

    const generatedTag = newTag || `EQ-${newName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newAssetObj: AssetEquipment = {
      id: generatedTag,
      name: newName,
      asset_tag: generatedTag,
      equipment_type: newType,
      status: newStatus,
      health_score: newStatus === 'CRITICAL' ? 45 : newStatus === 'WARNING' ? 78 : 98,
    };

    try {
      await apiClient.post('/assets/equipment', {
        name: newName,
        asset_tag: generatedTag,
        equipment_type: newType,
        status: newStatus.toLowerCase(),
      });
    } catch (e) {}

    const updated = [newAssetObj, ...equipmentList];
    setEquipmentList(updated);
    setSelectedAsset(newAssetObj);
    setIsSubmitting(false);
    setShowAddModal(false);
    setNewName('');
    setNewTag('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RUNNING':
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-emerald-500/40 shrink-0 leading-none">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>RUNNING</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1 text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-amber-500/40 shrink-0 leading-none">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>WARNING</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1 text-red-400 bg-red-950/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-red-500/40 animate-pulse shrink-0 leading-none">
            <XCircle className="w-3 h-3 shrink-0" />
            <span>CRITICAL</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-slate-700 shrink-0 leading-none">
            OFFLINE
          </span>
        );
    }
  };

  const filteredList = equipmentList.filter((eq) => {
    const matchesSearch =
      !searchTerm ||
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.asset_tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || eq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header with Monochrome Icon Box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 shrink-0 flex items-center justify-center shadow-md">
            <Cpu className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Equipment & Asset Workspace
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/40 shrink-0 leading-none">
                SCADA ASSET MANAGEMENT
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              P&ID process flow schematics, GIS spatial positioning, live sensor telemetry & event timeline
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-nexus-primary bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center justify-center space-x-2 shadow-md px-4 py-2.5 rounded-xl shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add New Industrial Asset</span>
          </button>
        </div>
      </div>

      {/* Spatial GIS Map & P&ID Flow Diagram Viewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlantGISMap />
        <PIDDiagramViewer />
      </div>

      {/* Equipment Selector Header Bar & Filter Controls */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter asset inventory by name, tag, or type..."
              className="input-nexus input-nexus-search text-xs py-2 rounded-xl"
            />
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-[11px] text-[var(--text-secondary)] uppercase font-bold hidden sm:inline">Status Filter:</span>
            <div className="flex items-center space-x-1 bg-[var(--bg-canvas)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
              {(['ALL', 'RUNNING', 'WARNING', 'CRITICAL'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-colors text-[11px] font-extrabold inline-flex items-center justify-center ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Selector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredList.map((eq) => {
            const isSelected = selectedAsset.id === eq.id;
            return (
              <div
                key={eq.id}
                onClick={() => setSelectedAsset(eq)}
                className={`p-5 rounded-2xl cursor-pointer transition-all border space-y-4 shadow-xl ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500/50 scale-[1.01]'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-[var(--text-primary)]">{eq.name}</div>
                    <div className="text-xs text-slate-400 font-mono font-bold">{eq.asset_tag}</div>
                  </div>
                  {getStatusBadge(eq.status)}
                </div>

                <div className="flex items-center justify-between text-xs font-mono border-t border-slate-800 pt-3">
                  <span className="text-slate-400">{eq.equipment_type}</span>
                  <span className={`font-bold ${eq.health_score < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Health: {eq.health_score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Asset Detailed Lifecycle Event Timeline */}
      <AssetEventTimeline assetTag={selectedAsset.asset_tag} assetName={selectedAsset.name} />

      {/* Add New Industrial Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md space-y-5 font-mono shadow-2xl">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-white">Register New Industrial Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Centrifugal Feedwater Pump-003"
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Asset Tag (Optional)</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. EQ-PMP-003"
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Equipment Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                >
                  <option value="Centrifugal Pump">Centrifugal Pump</option>
                  <option value="Reactor Vessel">Reactor Vessel</option>
                  <option value="Gas Compressor">Gas Compressor</option>
                  <option value="Heat Exchanger">Heat Exchanger</option>
                  <option value="Turbine Generator">Turbine Generator</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                >
                  <option value="RUNNING">RUNNING (Healthy)</option>
                  <option value="WARNING">WARNING (Maintenance Needed)</option>
                  <option value="CRITICAL">CRITICAL (Excursion)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="w-1/2 btn-nexus-primary py-2.5 rounded-xl text-white font-bold">
                  {isSubmitting ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentWorkspace;
