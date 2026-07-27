import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';

export const TelemetryReplayScrubber: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  const [speed, setSpeed] = useState('1x');

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, speed === '1x' ? 300 : speed === '2x' ? 150 : 50);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  return (
    <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-[var(--text-primary)]">
          <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Incident Replay Scrubber — May 15, 2026 Outage</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-500 font-bold">Frame {progress} / 100</span>
      </div>

      {/* Progress Timeline Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => setProgress(parseInt(e.target.value))}
        className="w-full h-1.5 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />

      {/* Playback Controls */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setProgress(0)}
            className="p-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1">
          {['1x', '2x', '5x'].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                speed === s
                  ? 'bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/30'
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
