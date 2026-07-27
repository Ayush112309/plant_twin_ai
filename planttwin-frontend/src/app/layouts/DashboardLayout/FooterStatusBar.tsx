import React, { useState, useEffect } from 'react';
import { RefreshCw, Database } from 'lucide-react';

export const FooterStatusBar: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 400);
  };

  const dataSources = [
    { name: 'MQTT', color: 'bg-emerald-400' },
    { name: 'OPC UA', color: 'bg-teal-400' },
    { name: 'Siemens S7', color: 'bg-sky-400' },
    { name: 'REST API', color: 'bg-blue-400' },
    { name: 'TimescaleDB', color: 'bg-purple-400' },
  ];

  return (
    <footer className="h-8 bg-[var(--bg-sidebar)] border-t border-[var(--border-color)] px-4 flex items-center justify-between text-[11px] text-[var(--text-secondary)] z-30 fixed bottom-0 left-0 right-0 font-mono select-none transition-colors">
      {/* Left: Active Data Sources */}
      <div className="flex items-center space-x-4">
        <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px] flex items-center gap-1">
          <Database className="w-3 h-3 text-[var(--text-muted)]" />
          <span>Data Sources:</span>
        </span>
        {dataSources.map((ds) => (
          <div key={ds.name} className="flex items-center space-x-1.5 hidden sm:flex">
            <span className={`w-1.5 h-1.5 rounded-full ${ds.color} shadow-sm`} />
            <span className="text-[var(--text-primary)] font-medium text-[10px]">{ds.name}</span>
          </div>
        ))}
      </div>

      {/* Center: Timestamp and Auto-refresh toggle */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="text-[var(--text-muted)]">Last Updated:</span>
          <span className="text-[var(--text-primary)] font-bold">{lastUpdated}</span>
          <button
            onClick={handleManualRefresh}
            className={`p-1 hover:text-emerald-400 transition-colors text-[var(--text-secondary)] ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
            title="Manual Sync Telemetry"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="text-[var(--text-secondary)] hover:text-emerald-400 transition-colors font-medium"
          >
            Auto Refresh: <span className="text-emerald-400 font-bold">{autoRefresh ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Right: Version and Copyright */}
      <div className="flex items-center space-x-3">
        <span className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--brand-primary)] px-2 py-0.5 rounded text-[10px] font-mono font-bold">
          v2.4.0
        </span>
        <span className="text-[var(--text-muted)] hidden sm:inline">PlantTwin AI © 2026</span>
      </div>
    </footer>
  );
};

export default FooterStatusBar;
