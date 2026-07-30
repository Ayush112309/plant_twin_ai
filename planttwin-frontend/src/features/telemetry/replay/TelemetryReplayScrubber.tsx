import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export interface TelemetryReplayScrubberProps {
  onFrameChange?: (frame: number, isPlaying: boolean, replayStreamData: any[]) => void;
}

export const TelemetryReplayScrubber: React.FC<TelemetryReplayScrubberProps> = ({ onFrameChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(74); // Match default 74 in user screenshot
  const [speed, setSpeed] = useState<'1x' | '2x' | '5x'>('1x');

  // Generate 100 historical incident frames representing the May 15, 2026 Outage
  const generateReplayStream = (currentFrame: number) => {
    const stream = [];
    const windowSize = 12;
    const startFrame = Math.max(0, currentFrame - windowSize);

    for (let f = startFrame; f <= currentFrame; f++) {
      let temp = 68.4;
      let vibration = 0.18;

      if (f <= 30) {
        // Phase 1: Nominal
        temp = 68.0 + (f % 5) * 0.4;
        vibration = 0.15 + (f % 3) * 0.02;
      } else if (f <= 65) {
        // Phase 2: Friction & Thermal Surge
        const delta = f - 30;
        temp = 70.0 + delta * 1.5;
        vibration = 0.22 + delta * 0.03;
      } else if (f <= 85) {
        // Phase 3: Outage Peak Excursion (Emergency Trip)
        const delta = f - 65;
        temp = 122.5 + delta * 2.8;
        vibration = 1.25 + delta * 0.08;
      } else {
        // Phase 4: Post-Trip Shutdown & Cool-down
        const delta = f - 85;
        temp = Math.max(45.0, 178.5 - delta * 8.5);
        vibration = Math.max(0.04, 2.85 - delta * 0.18);
      }

      const minutesAgo = Math.round((100 - f) * 0.5);
      stream.push({
        timestamp: `${minutesAgo}m ago`,
        temp: Number(temp.toFixed(1)),
        vibration: Number(vibration.toFixed(2)),
        frame: f,
      });
    }

    return stream;
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      const intervalMs = speed === '1x' ? 250 : speed === '2x' ? 120 : 40;
      timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev >= 100 ? 0 : prev + 1;
          return next;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  useEffect(() => {
    if (onFrameChange) {
      const stream = generateReplayStream(progress);
      onFrameChange(progress, isPlaying, stream);
    }
  }, [progress, isPlaying]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value, 10);
    setProgress(newProgress);
  };

  const getPhaseName = (f: number) => {
    if (f <= 30) return { label: 'Nominal SCADA Operations', color: 'text-emerald-400' };
    if (f <= 65) return { label: 'Thermal Drift & Bearing Friction Onset', color: 'text-amber-400' };
    if (f <= 85) return { label: '🚨 May 15 Emergency Trip Outage Peak', color: 'text-rose-400 font-bold' };
    return { label: 'Automated Post-Trip Cool-down', color: 'text-sky-400' };
  };

  const phase = getPhaseName(progress);

  return (
    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-[var(--text-primary)]">
          <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Incident Replay Scrubber — May 15, 2026 Outage</span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className={`text-[11px] ${phase.color}`}>{phase.label}</span>
          <span className="text-[11px] font-mono text-emerald-400 font-extrabold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            Frame {progress} / 100
          </span>
        </div>
      </div>

      {/* Progress Timeline Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={handleSliderChange}
        className="w-full h-2 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
      />

      {/* Playback Controls */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-white font-bold transition-all shadow-md flex items-center space-x-1.5 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Replay</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Play Incident Replay</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setProgress(0);
            }}
            className="p-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-emerald-500 transition-colors"
            title="Reset to Frame 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1">
          {(['1x', '2x', '5x'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all ${
                speed === s
                  ? 'bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/40 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TelemetryReplayScrubber;
