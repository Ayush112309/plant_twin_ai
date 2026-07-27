import React, { useState } from 'react';
import { MapPin, Cpu } from 'lucide-react';

export const PlantGISMap: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const mapAssets = [
    { id: 'EQ-RX-001', name: 'Reactor-001', x: 25, y: 35, status: 'CRITICAL', type: 'Reactor Vessel' },
    { id: 'EQ-PMP-002', name: 'Pump-002', x: 45, y: 55, status: 'WARNING', type: 'Centrifugal Pump' },
    { id: 'EQ-CMP-001', name: 'Compressor-001', x: 70, y: 30, status: 'RUNNING', type: 'Gas Compressor' },
    { id: 'EQ-LNE-101', name: 'Line-101', x: 60, y: 70, status: 'RUNNING', type: 'Assembly Line' },
    { id: 'EQ-MTR-003', name: 'Motor-003', x: 80, y: 65, status: 'RUNNING', type: 'Induction Motor' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Interactive Plant GIS Map — Refinery Alpha</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">GPS & Asset Spatial Positioning Layout</p>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/40 font-bold">
          GIS Active
        </span>
      </div>

      {/* SVG Canvas Map Grid */}
      <div className="relative w-full h-72 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl overflow-hidden flex items-center justify-center">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-color)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

        {/* Building Overlay outlines */}
        <div className="absolute left-[12%] top-[18%] w-[38%] h-[55%] border-2 border-dashed border-[var(--border-color)] rounded-xl p-3 text-[10px] text-[var(--text-secondary)] font-mono font-bold">
          HYDROCRACKING AREA 01
        </div>
        <div className="absolute left-[55%] top-[18%] w-[38%] h-[65%] border-2 border-dashed border-[var(--border-color)] rounded-xl p-3 text-[10px] text-[var(--text-secondary)] font-mono font-bold">
          UTILITIES & COMPRESSORS AREA 02
        </div>

        {/* Asset Markers */}
        {mapAssets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            style={{ left: `${asset.x}%`, top: `${asset.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full border shadow-xl transition-transform hover:scale-125 ${
              asset.status === 'CRITICAL'
                ? 'bg-red-950/80 border-red-500 text-red-400 glow-red'
                : asset.status === 'WARNING'
                ? 'bg-amber-950/80 border-amber-500 text-amber-400 glow-amber'
                : 'bg-emerald-950/80 border-emerald-500 text-emerald-400 glow-emerald'
            }`}
            title={`${asset.name} (${asset.status})`}
          >
            <Cpu className="w-4 h-4" />
          </button>
        ))}

        {selectedAsset && (
          <div className="absolute bottom-3 left-3 bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-xl text-xs space-y-1 z-10 shadow-2xl font-mono">
            <div className="font-bold text-[var(--text-primary)]">{selectedAsset.name}</div>
            <div className="text-[11px] text-[var(--text-secondary)]">{selectedAsset.type} • {selectedAsset.id}</div>
            <div className="text-[10px] font-bold text-emerald-400">Status: {selectedAsset.status}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantGISMap;
