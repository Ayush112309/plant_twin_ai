import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface IndustrialChartsProps {
  streamData?: Array<{ temp: number; vibration: number }>;
}

const defaultScatterData = [
  { temperature: 68.4, vibration: 0.18 },
  { temperature: 74.2, vibration: 0.28 },
  { temperature: 88.5, vibration: 0.52 },
  { temperature: 112.0, vibration: 0.95 },
  { temperature: 145.8, vibration: 1.82 },
];

export const IndustrialCharts: React.FC<IndustrialChartsProps> = ({ streamData }) => {
  const chartData =
    streamData && streamData.length > 0
      ? streamData.map((d) => ({ temperature: d.temp, vibration: d.vibration }))
      : defaultScatterData;

  const isExcursion = chartData.some((d) => d.temperature > 100 || d.vibration > 1.0);

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">
            Temperature vs Vibration Scatter Correlation
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            Cross-channel sensor correlation (°C vs mm/s)
          </p>
        </div>
        {isExcursion ? (
          <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40 animate-pulse">
            🚨 EXCURSION
          </span>
        ) : (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
            CORRELATED
          </span>
        )}
      </div>

      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 15, bottom: 20, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              type="number"
              dataKey="temperature"
              name="Temperature"
              stroke="var(--text-secondary)"
              fontSize={11}
              domain={['auto', 'auto']}
              label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -12, fill: 'var(--text-secondary)', fontSize: 10 }}
            />
            <YAxis
              type="number"
              dataKey="vibration"
              name="Vibration"
              stroke="var(--text-secondary)"
              fontSize={11}
              domain={[0, 'auto']}
              label={{ value: 'Vib (mm/s)', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-secondary)', fontSize: 10 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px', fontSize: '12px' }}
              formatter={(val: any, name: any) => [`${val} ${name === 'Temperature' ? '°C' : 'mm/s'}`, name]}
            />
            <Scatter name="SCADA Sensor Node" data={chartData} fill={isExcursion ? '#F43F5E' : '#10B981'} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IndustrialCharts;
