import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const scatterData = [
  { temperature: 750, vibration: 40 },
  { temperature: 780, vibration: 42 },
  { temperature: 810, vibration: 48 },
  { temperature: 830, vibration: 55 },
  { temperature: 790, vibration: 44 },
];

export const IndustrialCharts: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono">
      <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">
        Temperature vs Vibration Scatter Correlation
      </h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis type="number" dataKey="temperature" name="Temperature" unit="°C" stroke="var(--text-secondary)" fontSize={11} />
            <YAxis type="number" dataKey="vibration" name="Vibration" unit="mm/s" stroke="var(--text-secondary)" fontSize={11} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px' }}
            />
            <Scatter name="Sensors" data={scatterData} fill="#10B981" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IndustrialCharts;
