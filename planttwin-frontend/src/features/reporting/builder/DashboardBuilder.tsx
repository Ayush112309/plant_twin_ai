import React, { useState } from 'react';
import { LayoutGrid, Plus, Save, Move, Trash2 } from 'lucide-react';

export const DashboardBuilder: React.FC = () => {
  const [widgets, setWidgets] = useState([
    { id: 'w1', title: 'Live Telemetry Multi-Line Chart', type: 'CHART', size: 'col-span-2' },
    { id: 'w2', title: 'Recent Alerts Feed', type: 'LIST', size: 'col-span-1' },
    { id: 'w3', title: 'Equipment Status Donut', type: 'DONUT', size: 'col-span-1' },
    { id: 'w4', title: 'AI Health Score Index', type: 'KPI', size: 'col-span-1' },
  ]);

  const handleAddWidget = () => {
    const newId = `w${widgets.length + 1}`;
    setWidgets([...widgets, { id: newId, title: `Custom Widget #${widgets.length + 1}`, type: 'WIDGET', size: 'col-span-1' }]);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-4 border-t border-[#1E293B] pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            <span>Interactive Drag & Drop Dashboard Customizer</span>
          </h2>
          <p className="text-xs text-slate-400">Customize widgets, reorder cards, and save role-based dashboard layouts</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddWidget}
            className="flex items-center space-x-1 bg-[#0F172A] border border-[#1E293B] hover:border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Widget</span>
          </button>
          <button className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg">
            <Save className="w-3.5 h-3.5" />
            <span>Save Layout</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#090D14] border border-[#1E293B] rounded-lg border-dashed">
        {widgets.map((w) => (
          <div key={w.id} className={`${w.size} industrial-card p-4 flex items-center justify-between cursor-move hover:border-emerald-500/50`}>
            <div className="flex items-center space-x-2 text-xs">
              <Move className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-bold text-slate-200">{w.title}</div>
                <div className="text-[10px] text-slate-500 font-mono">{w.type}</div>
              </div>
            </div>

            <button onClick={() => handleRemoveWidget(w.id)} className="text-slate-500 hover:text-red-400 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardBuilder;
