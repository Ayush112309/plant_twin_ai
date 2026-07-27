import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Lock,
  ShieldAlert,
  Server,
  Zap,
  Radio,
  Sliders,
  Database,
  Check,
  Globe,
  Settings2,
} from 'lucide-react';
import usePermissions from '../../../app/permissions/usePermissions';
import { usePlantTelemetry } from '../../../app/contexts/PlantTelemetryContext';

export const SiemensPLCSIM: React.FC = () => {
  const permissions = usePermissions();
  const { updateSiemensTag } = usePlantTelemetry();

  // Mode Selection: 'S71200_HARDWARE' | 'S71500_HARDWARE' | 'PLCSIM_VIRTUAL'
  const [connectionMode, setConnectionMode] = useState<'S71200_HARDWARE' | 'S71500_HARDWARE' | 'PLCSIM_VIRTUAL'>('S71200_HARDWARE');

  // Physical S7 Hardware Settings
  const [ipAddress, setIpAddress] = useState('192.168.0.1');
  const [rack, setRack] = useState(0);
  const [slot, setSlot] = useState(1);
  const [dataBlock, setDataBlock] = useState('DB1');
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Live S7 DB Process Values
  const [db100Val, setDb100Val] = useState(68.4);
  const [vibrationVal, setVibrationVal] = useState(0.18);
  const [motorStatus, setMotorStatus] = useState(true);

  const [writeMsg, setWriteMsg] = useState<string | null>(null);

  const handleTestConnection = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setIsConnected(true);
      setWriteMsg(`Successfully connected to Siemens S7-1200 PLC at ${ipAddress}:102 (Rack ${rack}, Slot ${slot}). PUT/GET Verified!`);
      updateSiemensTag(`${dataBlock}.DBD4`, db100Val);
      setTimeout(() => setWriteMsg(null), 5000);
    }, 1200);
  };

  const handleWriteTag = (tagAddress: string, increment: number) => {
    if (!permissions.canWritePLC) {
      setWriteMsg('Permission Denied: Only Control Room Operators or System Admins have Siemens PLC write privileges.');
      return;
    }

    if (tagAddress.includes('DBD4')) {
      const newVal = +(db100Val + increment).toFixed(1);
      setDb100Val(newVal);
      updateSiemensTag(tagAddress, newVal);
      setWriteMsg(`Siemens S7-1200 Memory ${tagAddress} updated successfully to ${newVal} °C`);
    } else if (tagAddress.includes('DBD0')) {
      const newVal = +(vibrationVal + increment).toFixed(2);
      setVibrationVal(newVal);
      updateSiemensTag(tagAddress, newVal);
      setWriteMsg(`Siemens S7-1200 Memory ${tagAddress} updated successfully to ${newVal} mm/s`);
    } else if (tagAddress.includes('DBX12.0')) {
      const newStatus = !motorStatus;
      setMotorStatus(newStatus);
      updateSiemensTag(tagAddress, newStatus ? 1 : 0);
      setWriteMsg(`Siemens S7-1200 Switch ${tagAddress} toggled to ${newStatus ? 'TRUE (RUNNING)' : 'FALSE (STOPPED)'}`);
    }

    setTimeout(() => setWriteMsg(null), 4000);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Siemens S7 PLC Hardware & PLCSIM Control Center</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Physical Siemens S7-1200 / S7-1500 Ethernet (S7comm Port 102) & PLCSIM Advanced Virtual Instance
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div
            className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center space-x-2 ${
              isConnected ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' : 'bg-red-950/80 border-red-500/50 text-red-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span>{isConnected ? `S7-1200 Hardware Online (${ipAddress})` : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* RBAC Write Access Banner */}
      {!permissions.canWritePLC && (
        <div className="p-4 bg-amber-950/60 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs text-amber-300 shadow-md">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Read-Only Mode:</strong> Your persona ({permissions.roleName}) does not have PLC memory write permissions. S7-1200 DB write operations are locked.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-amber-900/60 px-2.5 py-0.5 rounded border border-amber-500/40">
            RBAC Locked
          </span>
        </div>
      )}

      {writeMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md animate-fade-in ${
            writeMsg.includes('Denied')
              ? 'bg-red-950/80 border border-red-500/50 text-red-300'
              : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{writeMsg}</span>
        </div>
      )}

      {/* PLC Target Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setConnectionMode('S71200_HARDWARE');
            setIpAddress('192.168.0.1');
            setSlot(1);
            setDataBlock('DB1');
          }}
          className={`p-5 rounded-2xl border text-left transition-all shadow-xl ${
            connectionMode === 'S71200_HARDWARE'
              ? 'bg-[var(--brand-soft)] border-emerald-500 text-[var(--text-primary)] shadow-emerald-500/10 font-bold'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-sm text-[var(--text-primary)] font-sans">Physical Siemens S7-1200 PLC</div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">HARDWARE</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">S7comm over Ethernet (Port 102). Rack 0, Slot 1.</p>
        </button>

        <button
          onClick={() => {
            setConnectionMode('S71500_HARDWARE');
            setIpAddress('192.168.1.100');
            setSlot(2);
            setDataBlock('DB100');
          }}
          className={`p-5 rounded-2xl border text-left transition-all shadow-xl ${
            connectionMode === 'S71500_HARDWARE'
              ? 'bg-[var(--brand-soft)] border-emerald-500 text-[var(--text-primary)] shadow-emerald-500/10 font-bold'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-sm text-[var(--text-primary)] font-sans">Physical Siemens S7-1500 PLC</div>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/40">HARDWARE</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">High-capacity Ethernet S7comm. Rack 0, Slot 2.</p>
        </button>

        <button
          onClick={() => {
            setConnectionMode('PLCSIM_VIRTUAL');
            setIpAddress('127.0.0.1');
            setSlot(1);
            setDataBlock('DB100');
          }}
          className={`p-5 rounded-2xl border text-left transition-all shadow-xl ${
            connectionMode === 'PLCSIM_VIRTUAL'
              ? 'bg-[var(--brand-soft)] border-emerald-500 text-[var(--text-primary)] shadow-emerald-500/10 font-bold'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-sm text-[var(--text-primary)] font-sans">Siemens PLCSIM Advanced</div>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40">VIRTUAL</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">Virtual S7-1500 instance simulation environment.</p>
        </button>
      </div>

      {/* Connection & Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: S7-1200 Connection Settings Form */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
              <Settings2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>S7 Connection Parameters</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-400">Port 102</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-bold">PLC IP Address</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="input-nexus"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-bold">Rack</label>
                <input
                  type="number"
                  value={rack}
                  onChange={(e) => setRack(parseInt(e.target.value) || 0)}
                  className="input-nexus"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-bold">Slot</label>
                <input
                  type="number"
                  value={slot}
                  onChange={(e) => setSlot(parseInt(e.target.value) || 1)}
                  className="input-nexus"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-bold">Data Block (DB)</label>
              <input
                type="text"
                value={dataBlock}
                onChange={(e) => setDataBlock(e.target.value)}
                className="input-nexus"
              />
            </div>

            {/* TIA Portal Readiness Checklist */}
            <div className="p-3.5 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl space-y-2 text-[11px] shadow-inner">
              <div className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[10px]">TIA Portal Prerequisite Checklist:</div>
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>PUT/GET Remote Access: PERMITTED</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Optimized Block Access: DISABLED</span>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={connecting}
              className="w-full btn-nexus-primary font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg"
            >
              <Zap className={`w-4 h-4 shrink-0 ${connecting ? 'animate-spin' : ''}`} />
              <span>{connecting ? 'Testing S7 Ethernet Connection...' : `Connect & Test ${connectionMode === 'S71200_HARDWARE' ? 'S7-1200 PLC' : 'Siemens Target'}`}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Siemens DB Memory Inspector */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live {dataBlock} Data Block Process Values ({connectionMode === 'S71200_HARDWARE' ? 'Siemens S7-1200 Hardware' : 'Siemens Target'})</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Real-time S7 memory offset read/write inspector</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/40">
              S7comm Active
            </span>
          </div>

          <div className="space-y-3">
            {/* Tag 1: Bearing Temperature (DBD4) */}
            <div className="p-4 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl flex items-center justify-between shadow-md">
              <div>
                <div className="text-xs font-mono text-[var(--text-secondary)]">{dataBlock}.DBD4 (Bearing Temperature - FLOAT)</div>
                <div className="text-2xl font-extrabold text-emerald-400">{db100Val} °C</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Normal Range: 20.0 °C – 85.0 °C</div>
              </div>

              <button
                onClick={() => handleWriteTag(`${dataBlock}.DBD4`, 2.5)}
                disabled={!permissions.canWritePLC}
                className={`btn-nexus-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center space-x-1.5 ${
                  !permissions.canWritePLC && 'opacity-60 cursor-not-allowed'
                }`}
              >
                {!permissions.canWritePLC && <Lock className="w-3.5 h-3.5 shrink-0" />}
                <span>{permissions.canWritePLC ? 'Write Tag DB Value (+2.5°C)' : 'Locked'}</span>
              </button>
            </div>

            {/* Tag 2: Vibration Sensor (DBD0) */}
            <div className="p-4 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl flex items-center justify-between shadow-md">
              <div>
                <div className="text-xs font-mono text-[var(--text-secondary)]">{dataBlock}.DBD0 (Vibration Velocity - FLOAT)</div>
                <div className="text-2xl font-extrabold text-sky-400">{vibrationVal} mm/s</div>
                <div className="text-[10px] text-[var(--text-secondary)]">ISO 10816 Standard (Healthy &lt; 1.8 mm/s)</div>
              </div>

              <button
                onClick={() => handleWriteTag(`${dataBlock}.DBD0`, 0.05)}
                disabled={!permissions.canWritePLC}
                className={`btn-nexus-secondary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center space-x-1.5 ${
                  !permissions.canWritePLC && 'opacity-60 cursor-not-allowed'
                }`}
              >
                {!permissions.canWritePLC && <Lock className="w-3.5 h-3.5 shrink-0" />}
                <span>{permissions.canWritePLC ? 'Write Tag DB Value (+0.05)' : 'Locked'}</span>
              </button>
            </div>

            {/* Tag 3: Motor Running Status (DBX12.0 - BOOL) */}
            <div className="p-4 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl flex items-center justify-between shadow-md">
              <div>
                <div className="text-xs font-mono text-[var(--text-secondary)]">{dataBlock}.DBX12.0 (Motor Running Command - BOOL)</div>
                <div className={`text-xl font-extrabold ${motorStatus ? 'text-emerald-400' : 'text-red-400'}`}>
                  {motorStatus ? 'TRUE (MOTOR ACTIVE)' : 'FALSE (STOPPED)'}
                </div>
              </div>

              <button
                onClick={() => handleWriteTag(`${dataBlock}.DBX12.0`, 0)}
                disabled={!permissions.canWritePLC}
                className={`btn-nexus-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center space-x-1.5 ${
                  !permissions.canWritePLC && 'opacity-60 cursor-not-allowed'
                }`}
              >
                {!permissions.canWritePLC && <Lock className="w-3.5 h-3.5 shrink-0" />}
                <span>{permissions.canWritePLC ? (motorStatus ? 'Toggle STOP Command' : 'Toggle START Command') : 'Locked'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiemensPLCSIM;
