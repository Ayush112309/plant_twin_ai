import React, { useState } from 'react';
import {
  Layers,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Camera,
  Cpu,
  Sliders,
  Activity,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { usePlantTelemetry } from '../../../app/contexts/PlantTelemetryContext';

export interface TwinSnapshot {
  id: string;
  timestamp: string;
  assetName: string;
  state: Record<string, any>;
  notes: string;
}

export const DigitalTwinWorkspace: React.FC = () => {
  const { digitalTwinState, equipmentList } = usePlantTelemetry();
  const [selectedAssetId, setSelectedAssetId] = useState<string>('Pump-002');
  const [syncing, setSyncing] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [snapshots, setSnapshots] = useState<TwinSnapshot[]>([
    {
      id: 'SNAP-101',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      assetName: 'Pump-002 Centrifugal',
      state: { motor_rpm: 1450, vibration_amplitude: 0.18, winding_temp_c: 68.4, lubrication_pressure: 4.2 },
      notes: 'Baseline Physical State Snapshot',
    },
  ]);

  // Simulation Twin State Mutation
  const [simulatedState, setSimulatedState] = useState({
    motor_rpm: digitalTwinState.motor_rpm || 1450,
    vibration_amplitude: digitalTwinState.vibration_amplitude || 0.18,
    winding_temp_c: digitalTwinState.winding_temp_c || 68.4,
    lubrication_pressure: digitalTwinState.lubrication_pressure || 4.2,
    thermal_stress_index: 24.5,
    bearing_friction_coefficient: 0.012,
  });

  const handleSyncState = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setActiveScenario(null);
      setSimulatedState({
        motor_rpm: 1450,
        vibration_amplitude: 0.18,
        winding_temp_c: 68.4,
        lubrication_pressure: 4.2,
        thermal_stress_index: 24.5,
        bearing_friction_coefficient: 0.012,
      });
    }, 600);
  };

  const handleRunScenario = (scenarioType: string) => {
    setSimulationRunning(true);
    setActiveScenario(scenarioType);

    setTimeout(() => {
      setSimulationRunning(false);
      if (scenarioType === 'thermal_spike') {
        setSimulatedState({
          motor_rpm: 1820,
          vibration_amplitude: 0.94,
          winding_temp_c: 98.6,
          lubrication_pressure: 2.1,
          thermal_stress_index: 88.2,
          bearing_friction_coefficient: 0.088,
        });
      } else if (scenarioType === 'bearing_seizure') {
        setSimulatedState({
          motor_rpm: 920,
          vibration_amplitude: 1.48,
          winding_temp_c: 112.4,
          lubrication_pressure: 1.2,
          thermal_stress_index: 96.5,
          bearing_friction_coefficient: 0.145,
        });
      } else if (scenarioType === 'coolant_blockage') {
        setSimulatedState({
          motor_rpm: 1450,
          vibration_amplitude: 0.42,
          winding_temp_c: 104.2,
          lubrication_pressure: 3.8,
          thermal_stress_index: 91.0,
          bearing_friction_coefficient: 0.045,
        });
      }
    }, 800);
  };

  const handleTakeSnapshot = () => {
    const newSnap: TwinSnapshot = {
      id: `SNAP-${102 + snapshots.length}`,
      timestamp: new Date().toLocaleTimeString(),
      assetName: selectedAssetId === 'Pump-002' ? 'Pump-002 Centrifugal' : selectedAssetId,
      state: { ...simulatedState },
      notes: activeScenario ? `Simulated: ${activeScenario}` : 'Live Physical State',
    };
    setSnapshots([newSnap, ...snapshots]);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header with Monochrome Neutral Icon Box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 shrink-0 flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Digital Twin Workspace
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/40 shrink-0 leading-none">
                PHYSICS-BASED FEA/CFD ENGINE
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              Live twin state synchronization, simulation, and snapshot timeline
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleTakeSnapshot}
            className="btn-nexus-secondary text-xs inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl font-mono font-bold bg-slate-900 border-slate-800 text-slate-200"
          >
            <Camera className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Take Twin Snapshot</span>
          </button>

          <button
            onClick={handleSyncState}
            disabled={syncing}
            className="btn-nexus-primary text-xs inline-flex items-center justify-center space-x-2 shadow-md bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shrink-0"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${syncing && 'animate-spin'}`} />
            <span>{syncing ? 'Syncing Physical State...' : 'Sync Live Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            DIGITAL TWIN STATUS
          </div>
          <div className="text-xl font-extrabold text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Synced (100ms)</span>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">TimescaleDB Hypertable Sync</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            PHYSICS TWIN MODEL
          </div>
          <div className="text-xl font-extrabold text-[var(--text-primary)]">v2.4.0 FEA/CFD</div>
          <div className="text-xs text-[var(--text-secondary)]">Thermal & Vibration Emulation</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            ACTIVE SIMULATION
          </div>
          <div className="text-xl font-extrabold text-amber-400">
            {activeScenario ? 'DRIFT INJECTED' : 'BASELINE PHYSICAL'}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {activeScenario ? `Active Scenario: ${activeScenario}` : 'Physical Sensor State'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            SNAPSHOT TIMELINE
          </div>
          <div className="text-xl font-extrabold text-emerald-400">{snapshots.length} Snapshots</div>
          <div className="text-xs text-[var(--text-secondary)]">Stored State History</div>
        </div>
      </div>

      {/* Equipment Target Switcher */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-bold text-[var(--text-primary)]">Select Digital Twin Target Asset:</span>
        </div>
        <div className="flex items-center space-x-2">
          {['Pump-002', 'Reactor-001', 'Compressor-001'].map((asset) => (
            <button
              key={asset}
              onClick={() => setSelectedAssetId(asset)}
              className={`px-3 py-1.5 rounded-xl transition-all font-bold ${
                selectedAssetId === asset
                  ? 'bg-blue-600/20 text-white border border-blue-500 shadow-sm'
                  : 'bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Live State Grid on Left, Simulation Controller on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Live Twin State Parameters */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                {selectedAssetId} Digital Twin State Vector
              </h2>
            </div>
            <span className="text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/40">
              {activeScenario ? 'SIMULATED STATE' : 'PHYSICAL SYNCED'}
            </span>
          </div>

          <div className="bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl p-4 font-mono text-xs text-[var(--text-primary)] space-y-3 shadow-inner">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
              <span className="text-[var(--text-secondary)]">motor_rpm:</span>
              <span className="text-emerald-400 font-bold text-sm">{simulatedState.motor_rpm} RPM</span>
            </div>

            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
              <span className="text-[var(--text-secondary)]">vibration_amplitude:</span>
              <span
                className={`font-bold text-sm ${
                  simulatedState.vibration_amplitude > 0.8 ? 'text-red-400 animate-pulse' : simulatedState.vibration_amplitude > 0.4 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {simulatedState.vibration_amplitude} mm/s
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
              <span className="text-[var(--text-secondary)]">winding_temp_c:</span>
              <span
                className={`font-bold text-sm ${
                  simulatedState.winding_temp_c > 90 ? 'text-red-400 animate-pulse' : simulatedState.winding_temp_c > 80 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {simulatedState.winding_temp_c} °C
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
              <span className="text-[var(--text-secondary)]">lubrication_pressure:</span>
              <span className={`font-bold text-sm ${simulatedState.lubrication_pressure < 3.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {simulatedState.lubrication_pressure} bar
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
              <span className="text-[var(--text-secondary)]">thermal_stress_index:</span>
              <span className={`font-bold text-sm ${simulatedState.thermal_stress_index > 70 ? 'text-red-400 font-extrabold' : 'text-emerald-400'}`}>
                {simulatedState.thermal_stress_index}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">bearing_friction_coefficient:</span>
              <span className="text-emerald-400 font-bold text-sm">{simulatedState.bearing_friction_coefficient}</span>
            </div>
          </div>
        </div>

        {/* Right: Simulation Controller & Scenario Injector */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">What-If Scenario Simulation Injector</h2>
            </div>
            {activeScenario && (
              <button
                onClick={handleSyncState}
                className="text-[10px] font-mono text-amber-400 hover:underline font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Baseline
              </button>
            )}
          </div>

          <div className="space-y-3 font-mono text-xs">
            <button
              onClick={() => handleRunScenario('thermal_spike')}
              disabled={simulationRunning}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeScenario === 'thermal_spike'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                  : 'bg-[var(--bg-canvas)] border-[var(--border-color)] text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-bold text-slate-200">Inject Thermal Excursion (+30°C Spike)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Simulate cooling degradation & rotor expansion</div>
              </div>
              <Play className="w-4 h-4 text-amber-400 shrink-0" />
            </button>

            <button
              onClick={() => handleRunScenario('bearing_seizure')}
              disabled={simulationRunning}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeScenario === 'bearing_seizure'
                  ? 'bg-red-950/80 border-red-500 text-red-300 font-bold'
                  : 'bg-[var(--bg-canvas)] border-[var(--border-color)] text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-bold text-slate-200">Inject Bearing Lubrication Seizure</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Simulate friction spike & severe vibration excursion</div>
              </div>
              <Play className="w-4 h-4 text-red-400 shrink-0" />
            </button>

            <button
              onClick={() => handleRunScenario('coolant_blockage')}
              disabled={simulationRunning}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeScenario === 'coolant_blockage'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                  : 'bg-[var(--bg-canvas)] border-[var(--border-color)] text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-bold text-slate-200">Inject Coolant Flow Line Bypass</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Simulate pressure drop & thermal stress accumulation</div>
              </div>
              <Play className="w-4 h-4 text-amber-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <h3 className="font-bold text-[var(--text-primary)] text-sm">Stored Digital Twin Snapshots Timeline</h3>
          <span className="text-xs text-emerald-400 font-bold">{snapshots.length} Snapshots Saved</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                <th className="py-2.5 px-3">Snapshot ID</th>
                <th className="py-2.5 px-3">Target Asset</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">RPM</th>
                <th className="py-2.5 px-3">Vibration</th>
                <th className="py-2.5 px-3">Winding Temp</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {snapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="py-3 px-3 font-bold text-emerald-400">{snap.id}</td>
                  <td className="py-3 px-3 text-[var(--text-primary)] font-bold">{snap.assetName}</td>
                  <td className="py-3 px-3 text-slate-400">{snap.timestamp}</td>
                  <td className="py-3 px-3 text-slate-200">{snap.state.motor_rpm} RPM</td>
                  <td className="py-3 px-3 text-slate-200">{snap.state.vibration_amplitude} mm/s</td>
                  <td className="py-3 px-3 text-slate-200">{snap.state.winding_temp_c} °C</td>
                  <td className="py-3 px-3 text-slate-400">{snap.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinWorkspace;
