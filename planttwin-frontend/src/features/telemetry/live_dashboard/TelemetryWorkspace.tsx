import React, { useState } from 'react';
import {
  LineChart as LineIcon,
  Activity,
  Download,
  Thermometer,
  Zap,
  Gauge,
  Wind,
  TrendingUp,
  TrendingDown,
  Clock,
  Radio,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TelemetryReplayScrubber from '../replay/TelemetryReplayScrubber';
import IndustrialCharts from '../../../lib/charts/IndustrialCharts';
import { usePlantTelemetry } from '../../../app/contexts/PlantTelemetryContext';

export const TelemetryWorkspace: React.FC = () => {
  const { telemetryStream } = usePlantTelemetry();
  const [selectedTag, setSelectedTag] = useState<'ALL' | 'TEMP' | 'VIB' | 'PRESSURE'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  // Scrubber Replay State & Live Toggle
  const [isReplayActive, setIsReplayActive] = useState<boolean>(false);
  const [replayFrame, setReplayFrame] = useState<number>(1);
  const [isReplayPlaying, setIsReplayPlaying] = useState<boolean>(false);
  const [replayStream, setReplayStream] = useState<any[]>([]);

  const handleReplayFrameChange = (frame: number, playing: boolean, data: any[]) => {
    setReplayFrame(frame);
    setIsReplayPlaying(playing);
    setReplayStream(data);
    if (playing) {
      setIsReplayActive(true);
    }
  };

  const activeStreamData = isReplayActive && replayStream.length > 0 ? replayStream : telemetryStream;
  const isIncidentPeak = isReplayActive && replayFrame > 65 && replayFrame <= 85;
  const isWarningPhase = isReplayActive && replayFrame > 30 && replayFrame <= 65;

  // Real-time sensor metrics calculated live from stream or scrubber
  const latestItem = activeStreamData.length > 0 ? activeStreamData[activeStreamData.length - 1] : { temp: 84.5, vibration: 0.24 };
  const currentTemp = latestItem?.temp ?? 84.5;
  const currentVib = latestItem?.vibration ?? 0.24;
  const currentPressure = Number((520 + (currentTemp > 75 ? (currentTemp - 75) * 1.4 : 0.4)).toFixed(1));
  const currentFlow = Number((1250 - (currentVib > 0.4 ? (currentVib - 0.4) * 160 : 0)).toFixed(1));

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csvContent =
        'data:text/csv;charset=utf-8,Timestamp,Temperature_C,Vibration_mm_s,Pressure_bar,Flow_m3_h\n' +
        activeStreamData.map((t: any) => `${t.timestamp},${t.temp},${t.vibration},${currentPressure},${currentFlow}`).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `SCADA_Telemetry_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] shrink-0 flex items-center justify-center shadow-sm">
            <LineIcon className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Live SCADA Telemetry & Historian
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 shrink-0 leading-none">
                1,250 HZ STREAMING
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              High-frequency streaming, scatter correlation, and historical incident timeline replay
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="btn-nexus-secondary text-xs inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl font-mono font-bold"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isExporting ? 'Exporting...' : 'Export SCADA CSV'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Real-Time Live Sensor Telemetry Cards (Auto-updating) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Sensor 1: Temperature */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Thermometer className="w-3.5 h-3.5 text-blue-400" />
              <span>Reactor Core Temp</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                currentTemp > 100
                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40 animate-pulse'
                  : currentTemp > 80
                  ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {currentTemp > 100 ? '🚨 EXCURSION' : currentTemp > 80 ? '⚠️ ELEVATED' : 'NORMAL'}
            </span>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {currentTemp} <span className="text-sm font-normal text-blue-400">°C</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] gap-1 whitespace-nowrap">
            <span>Range: 0 – 150 °C</span>
            <span className="text-blue-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live Sync
            </span>
          </div>
        </div>

        {/* Sensor 2: Vibration */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Bearing Vibration</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                currentVib > 1.2
                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40 animate-pulse'
                  : currentVib > 0.4
                  ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {currentVib > 1.2 ? '🚨 HIGH VIB' : currentVib > 0.4 ? '⚠️ WARN' : 'OPTIMAL'}
            </span>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {currentVib} <span className="text-sm font-normal text-amber-400">mm/s</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] gap-1 whitespace-nowrap">
            <span>Max: 1.50 mm/s</span>
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              <Activity className="w-3 h-3" /> Tag #04
            </span>
          </div>
        </div>

        {/* Sensor 3: System Pressure */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>Hydrocracker Pressure</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                currentPressure > 560
                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {currentPressure > 560 ? '🚨 HIGH PRESS' : 'STABLE'}
            </span>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {currentPressure} <span className="text-sm font-normal text-purple-400">bar</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] gap-1 whitespace-nowrap">
            <span>Target: 520 bar</span>
            <span className="text-purple-400 font-bold">TimescaleDB</span>
          </div>
        </div>

        {/* Sensor 4: Gas Flow Rate */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recirculation Flow</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                currentFlow < 1000
                  ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {currentFlow < 1000 ? '⚠️ LOW FLOW' : 'NOMINAL'}
            </span>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {currentFlow} <span className="text-sm font-normal text-cyan-400">m³/h</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] gap-1 whitespace-nowrap">
            <span>Rated: 1,250 m³/h</span>
            <span className="text-cyan-400 font-bold">100 ms</span>
          </div>
        </div>
      </div>

      {/* Telemetry Stream Mode Switcher */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-color)] font-mono text-xs shadow-sm">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${!isReplayActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
          <span className="font-bold text-[var(--text-primary)]">
            {!isReplayActive ? '📡 Live SCADA & OPC-UA Real-Time Stream (1,250 Hz Active)' : '📼 Incident Replay Mode Active (May 15 Outage Scrubber)'}
          </span>
        </div>
        {isReplayActive && (
          <button
            onClick={() => setIsReplayActive(false)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-sm flex items-center space-x-1"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Switch to Live OPC-UA Stream</span>
          </button>
        )}
      </div>

      {/* Incident Replay Scrubber Component */}
      <TelemetryReplayScrubber onFrameChange={handleReplayFrameChange} />

      {/* Live Chart & Scatter Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Real-Time SCADA Telemetry Stream Chart with Dual Y-Axes */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <h2 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">
                {isReplayPlaying ? '📼 Incident Replay Stream (Live Sync)' : 'Real-Time SCADA Telemetry Stream'}
              </h2>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                isIncidentPeak
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              }`}
            >
              {isReplayPlaying ? `Frame ${replayFrame}/100 Replaying` : 'Live Sync Active'}
            </span>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            {(['ALL', 'TEMP', 'VIB', 'PRESSURE'] as const).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl transition-all font-bold ${
                  selectedTag === tag
                    ? 'bg-[var(--brand-primary)] text-white shadow-md border border-[var(--brand-primary)]'
                    : 'bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeStreamData} margin={{ top: 10, right: 10, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="timestamp" stroke="var(--text-secondary)" fontSize={11} />
                
                {/* Left Y-Axis for Temperature */}
                <YAxis
                  yAxisId="temp"
                  stroke="#2563EB"
                  fontSize={11}
                  domain={[0, 200]}
                  label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#2563EB', fontSize: 10 }}
                />

                {/* Right Y-Axis for Vibration */}
                <YAxis
                  yAxisId="vib"
                  orientation="right"
                  stroke="#D97706"
                  fontSize={11}
                  domain={[0, 3.5]}
                  label={{ value: 'mm/s', angle: 90, position: 'insideRight', fill: '#D97706', fontSize: 10 }}
                />

                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px' }}
                />

                {(selectedTag === 'ALL' || selectedTag === 'TEMP') && (
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temp"
                    stroke={isIncidentPeak ? '#EF4444' : '#2563EB'}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Temp (°C)"
                  />
                )}
                {(selectedTag === 'ALL' || selectedTag === 'VIB') && (
                  <Line
                    yAxisId="vib"
                    type="monotone"
                    dataKey="vibration"
                    stroke={isIncidentPeak ? '#F59E0B' : '#D97706'}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Vibration (mm/s)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Scatter Correlation & Industrial Charts */}
        <IndustrialCharts streamData={activeStreamData} />
      </div>
    </div>
  );
};

export default TelemetryWorkspace;
