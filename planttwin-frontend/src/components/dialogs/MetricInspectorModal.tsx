import React from 'react';
import { X, Activity, BarChart2, TrendingUp, Filter, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

export interface MetricInspectorData {
  title: string;
  currentValue: string | number;
  unit: string;
  median: string | number;
  mean: string | number;
  min: string | number;
  max: string | number;
  stdDev: string | number;
  zScore: string | number;
  chartData: { name: string; value: number }[];
}

interface ModalProps {
  data: MetricInspectorData | null;
  onClose: () => void;
}

export const MetricInspectorModal: React.FC<ModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="industrial-card w-full max-w-2xl p-6 space-y-6 shadow-2xl relative border-emerald-500/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">{data.title} Detailed Inspector</h2>
              <p className="text-xs text-slate-400">Statistical distribution analytics & sensor median</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[var(--border-color)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Live Value & Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase">CURRENT VALUE</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
              {data.currentValue} {data.unit}
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase">MEDIAN (P50)</div>
            <div className="text-xl font-extrabold text-sky-400 mt-0.5">
              {data.median} {data.unit}
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase">MEAN (AVERAGE)</div>
            <div className="text-xl font-extrabold text-purple-400 mt-0.5">
              {data.mean} {data.unit}
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase">MIN / MAX RANGE</div>
            <div className="text-sm font-bold text-slate-200 mt-1">
              {data.min} – {data.max} {data.unit}
            </div>
          </div>
        </div>

        {/* Distribution Bar Chart with Median Reference Line */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--text-primary)]">Sensor Tag Comparative Distribution</span>
            <span className="text-sky-400 font-mono text-[11px]">Median Line: {data.median} {data.unit}</span>
          </div>

          <div className="h-56 w-full pt-2 bg-[var(--bg-canvas)] p-3 rounded-lg border border-[var(--border-color)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' }} />
                <ReferenceLine y={Number(data.median)} stroke="#0EA5E9" strokeDasharray="4 4" label={{ value: 'MEDIAN', fill: '#0EA5E9', fontSize: 10 }} />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Statistical Analytics */}
        <div className="p-3 bg-[#090D14] border border-[#1E293B] rounded-lg flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <span>Std Dev (σ): <strong className="text-slate-100">{data.stdDev}</strong></span>
            <span>•</span>
            <span>Outlier Z-Score: <strong className="text-emerald-400">{data.zScore}</strong></span>
          </div>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Normal Operating Range</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricInspectorModal;
