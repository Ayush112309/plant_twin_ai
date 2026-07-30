import React, { useState } from 'react';
import {
  LineChart as LineIcon,
  Activity,
  Download,
  RefreshCw,
  Sliders,
  Database,
  Radio,
  Filter,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TelemetryReplayScrubber from '../replay/TelemetryReplayScrubber';
import IndustrialCharts from '../../../lib/charts/IndustrialCharts';
import { usePlantTelemetry } from '../../../app/contexts/PlantTelemetryContext';

export const TelemetryWorkspace: React.FC = () => {
  const { telemetryStream } = usePlantTelemetry();
  const [selectedTag, setSelectedTag] = useState<'ALL' | 'TEMP' | 'VIB' | 'PRESSURE'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  // Scrubber Replay State
  const [replayFrame, setReplayFrame] = useState<number>(74);
  const [isReplayPlaying, setIsReplayPlaying] = useState<boolean>(false);
  const [replayStream, setReplayStream] = useState<any[]>([]);

  const handleReplayFrameChange = (frame: number, playing: boolean, data: any[]) => {
    setReplayFrame(frame);
    setIsReplayPlaying(playing);
    setReplayStream(data);
  };

  const activeStreamData = replayStream.length > 0 ? replayStream : telemetryStream;
  const isIncidentPeak = replayFrame > 65 && replayFrame <= 85;
  const isWarningPhase = replayFrame > 30 && replayFrame <= 65;

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csvContent =
        'data:text/csv;charset=utf-8,Timestamp,Temperature_C,Vibration_mm_s,Pressure_bar\n' +
        activeStreamData.map((t: any) => `${t.timestamp},${t.temp},${t.vibration},520`).join('\n');
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

      {/* Top 4 SCADA Metrics Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            ACTIVE TELEMETRY TAGS
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">45 SCADA Tags</div>
          <div className="text-xs text-emerald-500 flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Siemens S7 & OPC-UA Ingestion</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            INGESTION FREQUENCY
          </div>
          <div className="text-2xl font-extrabold text-emerald-500">100 ms (1,250 Hz)</div>
          <div className="text-xs text-[var(--text-secondary)]">Millisecond Precision</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            TIMESCALEDB HYPERTABLE
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">1.42M Rows</div>
          <div className="text-xs text-[var(--text-secondary)]">Compressed Chunking Active</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            SYSTEM STREAM STATE
          </div>
          <div
            className={`text-2xl font-extrabold ${
              isIncidentPeak ? 'text-rose-400' : isWarningPhase ? 'text-amber-400' : 'text-emerald-500'
            }`}
          >
            {isIncidentPeak ? 'CRITICAL TRIP' : isWarningPhase ? 'THERMAL DRIFT' : 'OPTIMAL'}
          </div>
          <div className="text-xs text-[var(--text-secondary)] font-bold">
            {isIncidentPeak ? '🚨 May 15 Outage Peak' : isWarningPhase ? '⚠️ Warning Threshold' : '0 Packet Dropouts'}
          </div>
        </div>
      </div>

      {/* Incident Replay Scrubber Component */}
      <TelemetryReplayScrubber onFrameChange={handleReplayFrameChange} />

      {/* Live Chart & Scatter Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Real-Time SCADA Telemetry Stream Chart */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
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
              <LineChart data={activeStreamData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="timestamp" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px' }}
                />
                {(selectedTag === 'ALL' || selectedTag === 'TEMP') && (
                  <Line
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
