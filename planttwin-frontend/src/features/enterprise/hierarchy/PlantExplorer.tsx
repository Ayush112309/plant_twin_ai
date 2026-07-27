import React, { useState, useEffect } from 'react';
import {
  Compass,
  Building2,
  Layers,
  Cpu,
  Globe,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Activity,
  Radio,
  Sliders,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart2,
  Server,
  X,
} from 'lucide-react';
import { usePlantTelemetry } from '../../../app/contexts/PlantTelemetryContext';

export interface HierarchyNode {
  id: string;
  name: string;
  type: 'enterprise' | 'site' | 'area' | 'line' | 'equipment' | 'sensor';
  level: string;
  status: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
  tag?: string;
  scadaVal?: string;
  description?: string;
  children?: HierarchyNode[];
}

const INITIAL_HIERARCHY: HierarchyNode = {
  id: 'ent-01',
  name: 'Global Industrial Corp',
  type: 'enterprise',
  level: 'ISA-95 Level 4 (Enterprise)',
  status: 'Healthy',
  description: 'Multi-Tenant Corporate Enterprise Operations',
  children: [
    {
      id: 'site-01',
      name: 'Refinery Alpha',
      type: 'site',
      level: 'ISA-95 Level 3 (Plant Facility)',
      status: 'Healthy',
      tag: 'PLANT-001',
      description: 'Primary Petroleum Refining Facility — US Gulf Coast',
      children: [
        {
          id: 'area-01',
          name: 'Hydrocracking Unit (Area 01)',
          type: 'area',
          level: 'ISA-95 Level 2 (Process Area)',
          status: 'Critical',
          tag: 'AREA-HC-01',
          description: 'High-pressure catalytic cracking for heavy distillate',
          children: [
            {
              id: 'line-101',
              name: 'Production Line 101',
              type: 'line',
              level: 'ISA-95 Level 1 (Production Line)',
              status: 'Critical',
              tag: 'LINE-101',
              children: [
                {
                  id: 'eq-reactor-001',
                  name: 'Reactor-001 (Main Hydrocracker)',
                  type: 'equipment',
                  level: 'ISA-95 Level 0 (Field Equipment)',
                  status: 'Critical',
                  tag: 'EQ-RCT-001',
                  scadaVal: 'Temp: 825.5 °C (HIGH)',
                  description: 'High-pressure hydrocracking vessel with catalytic bed',
                  children: [
                    {
                      id: 'sens-temp-101',
                      name: 'Thermocouple Sensor T-101',
                      type: 'sensor',
                      level: 'Field Device (Sensor Tag)',
                      status: 'Critical',
                      tag: 'SENS-T-101',
                      scadaVal: '825.5 °C',
                    },
                    {
                      id: 'sens-press-101',
                      name: 'Pressure Gauge P-101',
                      type: 'sensor',
                      level: 'Field Device (Sensor Tag)',
                      status: 'Healthy',
                      tag: 'SENS-P-101',
                      scadaVal: '555.0 bar',
                    },
                  ],
                },
                {
                  id: 'eq-pump-002',
                  name: 'Pump-002 (Feedwater Recirculation)',
                  type: 'equipment',
                  level: 'ISA-95 Level 0 (Field Equipment)',
                  status: 'Warning',
                  tag: 'EQ-PMP-002',
                  scadaVal: 'Vibration: 0.89 mm/s',
                  description: 'High-pressure feed recirculation pump',
                  children: [
                    {
                      id: 'sens-vib-202',
                      name: 'Piezoelectric Accelerometer V-202',
                      type: 'sensor',
                      level: 'Field Device (Sensor Tag)',
                      status: 'Warning',
                      tag: 'SENS-V-202',
                      scadaVal: '0.89 mm/s',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'area-02',
          name: 'Catalytic Reforming Unit (Area 02)',
          type: 'area',
          level: 'ISA-95 Level 2 (Process Area)',
          status: 'Healthy',
          tag: 'AREA-CR-02',
          children: [
            {
              id: 'line-102',
              name: 'Production Line 102 (Reformer)',
              type: 'line',
              level: 'ISA-95 Level 1 (Production Line)',
              status: 'Healthy',
              tag: 'LINE-102',
              children: [
                {
                  id: 'eq-comp-001',
                  name: 'Compressor-001 (Gas Recirculation)',
                  type: 'equipment',
                  level: 'ISA-95 Level 0 (Field Equipment)',
                  status: 'Healthy',
                  tag: 'EQ-CMP-001',
                  scadaVal: 'Speed: 3,450 RPM',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'site-02',
      name: 'Chemical Plant Beta',
      type: 'site',
      level: 'ISA-95 Level 3 (Plant Facility)',
      status: 'Warning',
      tag: 'PLANT-002',
      description: 'Specialty Ethylene Synthesizer Facility — Rotterdam, NL',
      children: [
        {
          id: 'area-03',
          name: 'Ethylene Cracking Bay (Area 03)',
          type: 'area',
          level: 'ISA-95 Level 2 (Process Area)',
          status: 'Warning',
          tag: 'AREA-ETH-03',
        },
      ],
    },
    {
      id: 'site-03',
      name: 'Power Plant Gamma',
      type: 'site',
      level: 'ISA-95 Level 3 (Plant Facility)',
      status: 'Healthy',
      tag: 'PLANT-003',
      description: 'Combine-Cycle Power Generation — Texas, US',
    },
  ],
};

export const PlantExplorer: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<HierarchyNode>(INITIAL_HIERARCHY);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'ent-01': true,
    'site-01': true,
    'area-01': true,
    'line-101': true,
    'eq-reactor-001': true,
  });
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(
    INITIAL_HIERARCHY.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0] || INITIAL_HIERARCHY
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Healthy' | 'Warning' | 'Critical'>('All');
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<'area' | 'line' | 'equipment'>('equipment');

  // Sync registered organizations from localStorage
  useEffect(() => {
    try {
      const storedOrgs = JSON.parse(localStorage.getItem('planttwin_registered_orgs') || '[]');
      if (storedOrgs.length > 0) {
        const newSites: HierarchyNode[] = storedOrgs.map((org: any, idx: number) => ({
          id: `site-registered-${idx}`,
          name: org.name,
          type: 'site',
          level: 'ISA-95 Level 3 (Registered Tenant Facility)',
          status: 'Healthy',
          tag: `REG-PLANT-${idx + 1}`,
          description: `${org.region || 'Enterprise Facility'} — Newly Registered`,
        }));

        setHierarchy((prev) => {
          const existingSites = prev.children || [];
          const combinedSites = [...newSites, ...existingSites];
          const uniqueSites: HierarchyNode[] = [];
          const seen = new Set<string>();

          combinedSites.forEach((s) => {
            if (!seen.has(s.name)) {
              seen.add(s.name);
              uniqueSites.push(s);
            }
          });

          return {
            ...prev,
            children: uniqueSites,
          };
        });
      }
    } catch (e) {}
  }, []);

  const toggleNode = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    const traverse = (node: HierarchyNode) => {
      allIds[node.id] = true;
      node.children?.forEach(traverse);
    };
    traverse(hierarchy);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes({ 'ent-01': true });
  };

  const handleAddChildNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName || !selectedNode) return;

    const newNode: HierarchyNode = {
      id: `custom-${Date.now()}`,
      name: newNodeName,
      type: newNodeType,
      level: `ISA-95 (${newNodeType.toUpperCase()})`,
      status: 'Healthy',
      tag: `TAG-${Math.floor(100 + Math.random() * 900)}`,
      description: 'Custom added asset via Plant Explorer',
    };

    const addRecursive = (curr: HierarchyNode): HierarchyNode => {
      if (curr.id === selectedNode.id) {
        return {
          ...curr,
          children: [newNode, ...(curr.children || [])],
        };
      }
      return {
        ...curr,
        children: curr.children?.map(addRecursive),
      };
    };

    setHierarchy(addRecursive(hierarchy));
    setExpandedNodes((prev) => ({ ...prev, [selectedNode.id]: true }));
    setNewNodeName('');
    setShowAddNodeModal(false);
  };

  // Clean Monochrome Neutral Icons for Node Types
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'enterprise':
        return <Globe className="w-4 h-4 text-slate-300 shrink-0" />;
      case 'site':
        return <Building2 className="w-4 h-4 text-slate-300 shrink-0" />;
      case 'area':
        return <Layers className="w-4 h-4 text-slate-300 shrink-0" />;
      case 'line':
        return <Sliders className="w-4 h-4 text-slate-300 shrink-0" />;
      case 'equipment':
        return <Cpu className="w-4 h-4 text-slate-300 shrink-0" />;
      case 'sensor':
        return <Radio className="w-4 h-4 text-slate-300 shrink-0" />;
      default:
        return <Compass className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  // Strict 3-Status Color Palette Badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shrink-0">HEALTHY</span>;
      case 'Warning':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-amber-950/80 text-amber-400 border border-amber-500/40 shrink-0">WARNING</span>;
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-red-950/80 text-red-400 border border-red-500/40 animate-pulse shrink-0">CRITICAL</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-slate-900 text-slate-400 border border-slate-700 shrink-0">OFFLINE</span>;
    }
  };

  const renderTree = (node: HierarchyNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = selectedNode?.id === node.id;

    // Filter node based on search term & status filter
    const matchesSearch = !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase()) || (node.tag && node.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || node.status === statusFilter;

    if (!matchesSearch || !matchesStatus) {
      if (!node.children?.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return null;
      }
    }

    return (
      <div key={node.id} className="space-y-1">
        <div
          onClick={() => setSelectedNode(node)}
          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border gap-3 ${
            isSelected
              ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-md ring-1 ring-blue-500/50'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
          style={{ marginLeft: `${Math.min(depth, 4) * 14}px` }}
        >
          {/* Left Content */}
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                onClick={(e) => toggleNode(node.id, e)}
                className="p-1 rounded-md hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 shrink-0 inline-block" />
            )}

            <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 shrink-0">
              {getNodeIcon(node.type)}
            </div>

            <div className="min-w-0 flex-1 truncate">
              <div className="text-xs font-bold flex items-center gap-1.5 truncate">
                <span className="truncate">{node.name}</span>
                {node.tag && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 font-normal">
                    ({node.tag})
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{node.level}</div>
            </div>
          </div>

          {/* Right Metrics & Badges */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {node.scadaVal && (
              <span className="text-[10px] font-mono text-amber-400 font-bold hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40">
                {node.scadaVal}
              </span>
            )}
            {getStatusBadge(node.status)}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children!.map((childNode) => renderTree(childNode, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans">
                  Plant Explorer & ISA-95 Hierarchy
                </h1>
                <span className="text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
                  ISA-95 LEVEL 0 - 4
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                Enterprise → Site → Plant → Area → Production Line → Machine → Field Sensor Tag
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowAddNodeModal(true)}
            className="btn-nexus-primary bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md px-4 py-2.5 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hierarchy Component</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topology by asset name, tag, or level..."
            className="input-nexus input-nexus-search text-xs py-2 rounded-xl"
          />
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-[var(--bg-canvas)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
            <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)] ml-1.5" />
            {(['All', 'Healthy', 'Warning', 'Critical'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition-all font-bold ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Hierarchy Tree + Node Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Hierarchy Tree (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h2 className="text-sm font-extrabold text-[var(--text-primary)] font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>ISA-95 Plant Topology Tree</span>
            </h2>
            <span className="text-xs text-emerald-400 font-mono font-bold">Live SCADA Sync</span>
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {renderTree(hierarchy)}
          </div>
        </div>

        {/* Right Column: Node Detail Inspector (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-6">
          {selectedNode ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {selectedNode.level}
                  </div>
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] font-sans">{selectedNode.name}</h3>
                  {selectedNode.tag && (
                    <div className="text-xs font-mono text-emerald-400 font-bold">{selectedNode.tag}</div>
                  )}
                </div>
                {getStatusBadge(selectedNode.status)}
              </div>

              {selectedNode.description && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
                  {selectedNode.description}
                </div>
              )}

              {/* Node Specifications & Live Telemetry Values */}
              <div className="space-y-3 font-mono text-xs">
                <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px]">
                  Operational Telemetry & Parameters
                </h4>

                <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Node ID</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedNode.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Node Type</span>
                    <span className="font-bold uppercase text-slate-300">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Live Value</span>
                    <span className="font-bold text-amber-400">{selectedNode.scadaVal || 'Nominal Flow'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Direct Children</span>
                    <span className="font-bold text-emerald-400">{selectedNode.children?.length || 0} Sub-Nodes</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              Select any node from the tree on the left to inspect ISA-95 topology details.
            </div>
          )}
        </div>
      </div>

      {/* Add Component Modal */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] w-full max-w-md space-y-5 font-mono shadow-2xl">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-white">Add ISA-95 Child Component</h3>
              <button onClick={() => setShowAddNodeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddChildNode} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Target Parent Node</label>
                <input
                  type="text"
                  disabled
                  value={selectedNode ? selectedNode.name : 'Root'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Component Name</label>
                <input
                  type="text"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="e.g. Pump-003 Secondary Feed"
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Component Type</label>
                <select
                  value={newNodeType}
                  onChange={(e: any) => setNewNodeType(e.target.value)}
                  className="input-nexus w-full px-3 py-2 rounded-xl"
                >
                  <option value="area">Process Area (Level 2)</option>
                  <option value="line">Production Line (Level 1)</option>
                  <option value="equipment">Equipment (Level 0)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 btn-nexus-primary py-2.5 rounded-xl text-white font-bold">
                  Add Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantExplorer;
