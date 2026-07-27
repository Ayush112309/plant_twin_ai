import React from 'react';
import { Activity } from 'lucide-react';

export const PIDDiagramViewer: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Piping & Instrumentation Diagram (P&ID) Viewer</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">Process flow schematic for Hydrocracking Loop 101</p>
        </div>
        <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-md border border-sky-500/40 font-bold">
          ISA-5.1 P&ID Standard
        </span>
      </div>

      <div className="w-full h-72 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl relative overflow-hidden flex items-center justify-center p-4">
        {/* SVG Flow diagram */}
        <svg className="w-full h-full" viewBox="0 0 800 300">
          {/* Pipes */}
          <line x1="50" y1="150" x2="250" y2="150" stroke="#3B82F6" strokeWidth="4" />
          <line x1="250" y1="150" x2="500" y2="150" stroke="#10B981" strokeWidth="4" />
          <line x1="500" y1="150" x2="750" y2="150" stroke="#8B5CF6" strokeWidth="4" />

          {/* Reactor Vessel Icon */}
          <rect x="200" y="100" width="100" height="100" rx="20" fill="var(--bg-card)" stroke="#EF4444" strokeWidth="3" />
          <text x="250" y="155" fill="var(--text-primary)" fontSize="12" textAnchor="middle" fontWeight="bold">RX-001</text>
          <text x="250" y="175" fill="#EF4444" fontSize="10" textAnchor="middle" fontWeight="bold">830 °C</text>

          {/* Pump Icon */}
          <circle cx="500" cy="150" r="40" fill="var(--bg-card)" stroke="#F59E0B" strokeWidth="3" />
          <text x="500" y="155" fill="var(--text-primary)" fontSize="12" textAnchor="middle" fontWeight="bold">PMP-002</text>
          <text x="500" y="175" fill="#F59E0B" fontSize="10" textAnchor="middle" fontWeight="bold">470 bar</text>

          {/* Compressor Icon */}
          <rect x="650" y="110" width="80" height="80" rx="10" fill="var(--bg-card)" stroke="#10B981" strokeWidth="3" />
          <text x="690" y="155" fill="var(--text-primary)" fontSize="12" textAnchor="middle" fontWeight="bold">CMP-001</text>
          <text x="690" y="175" fill="#10B981" fontSize="10" textAnchor="middle" fontWeight="bold">42 mm/s</text>
        </svg>
      </div>
    </div>
  );
};

export default PIDDiagramViewer;
