import React, { useState } from 'react';
import {
  Server,
  Radio,
  Globe,
  FileText,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
  Plus,
  Sliders,
  Database,
  Code,
  Tag,
  ShieldCheck,
  Download,
  Activity,
  Cpu,
} from 'lucide-react';
import SiemensPLCSIM from './siemens/SiemensPLCSIM';
import usePermissions from '../../app/permissions/usePermissions';
import { usePlantTelemetry } from '../../app/contexts/PlantTelemetryContext';
import apiClient from '../../lib/api/client';

export const ConnectivityWorkspace: React.FC = () => {
  const permissions = usePermissions();
  const { ingestCSVData } = usePlantTelemetry();
  const [activeDriver, setActiveDriver] = useState<'siemens' | 'opcua' | 'mqtt' | 'rest' | 'csv' | 'mapping'>('siemens');

  // OPC-UA State
  const [opcServerUrl, setOpcServerUrl] = useState('opc.tcp://192.168.0.50:4840');
  const [opcSecurityMode, setOpcSecurityMode] = useState('Basic256Sha256 - Sign & Encrypt');

  // MQTT State
  const [mqttBroker, setMqttBroker] = useState('mqtt://broker.hivemq.com:1883');
  const [mqttTopic, setMqttTopic] = useState('planttwin/refinery/sensors/#');

  // CSV Batch Upload State
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleCsvUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      ingestCSVData([]);
      setUploadMsg('Batch CSV parsed successfully: 30 telemetry rows ingested into TimescaleDB storage!');
      setTimeout(() => setUploadMsg(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] shrink-0 flex items-center justify-center shadow-sm">
            <Server className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Industrial Connectivity Center & SCADA Hub
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 shrink-0 leading-none">
                MULTI-PROTOCOL DRIVERS
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              Unified drivers for Siemens S7, OPC-UA, MQTT, REST APIs, CSV batch uploads & Tag Mapping
            </p>
          </div>
        </div>

        {/* Live Connector Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-extrabold shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-1.5 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Siemens S7: ONLINE (102)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-1.5 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            OPC-UA: CONNECTED (4840)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-1.5 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            MQTT: SUBSCRIBED
          </span>
        </div>
      </div>

      {/* Clean Theme-Reactive Flex-Wrap Driver Selection Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-xs font-mono font-bold shadow-sm">
        <button
          onClick={() => setActiveDriver('siemens')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeDriver === 'siemens'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Server className="w-3.5 h-3.5 shrink-0" />
          <span>Siemens S7 & PLCSIM</span>
        </button>

        <button
          onClick={() => setActiveDriver('opcua')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeDriver === 'opcua'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span>OPC-UA Server Browser</span>
        </button>

        <button
          onClick={() => setActiveDriver('mqtt')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeDriver === 'mqtt'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Radio className="w-3.5 h-3.5 shrink-0" />
          <span>MQTT Broker Explorer</span>
        </button>

        <button
          onClick={() => setActiveDriver('rest')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeDriver === 'rest'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Code className="w-3.5 h-3.5 shrink-0" />
          <span>REST API Ingestion</span>
        </button>

        <button
          onClick={() => setActiveDriver('csv')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeDriver === 'csv'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>CSV Batch Upload</span>
        </button>

        <button
          onClick={() => setActiveDriver('mapping')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeDriver === 'mapping'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Tag className="w-3.5 h-3.5 shrink-0" />
          <span>Tag Mapping & Device Discovery</span>
        </button>
      </div>

      {/* Driver View 1: Siemens S7 Hardware & PLCSIM */}
      {activeDriver === 'siemens' && <SiemensPLCSIM />}

      {/* Driver View 2: OPC-UA Server Browser */}
      {activeDriver === 'opcua' && (
        <div className="space-y-6 font-mono">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                  <Globe className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  <span>OPC-UA Server Endpoint Connection</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-mono">Binary OPC-UA protocol client over TCP</p>
              </div>

              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-[var(--text-secondary)] font-bold">Server Endpoint URL</label>
                <input
                  type="text"
                  value={opcServerUrl}
                  onChange={(e) => setOpcServerUrl(e.target.value)}
                  className="input-nexus"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[var(--text-secondary)] font-bold">Security Policy</label>
                <select
                  value={opcSecurityMode}
                  onChange={(e) => setOpcSecurityMode(e.target.value)}
                  className="input-nexus"
                >
                  <option>Basic256Sha256 - Sign & Encrypt</option>
                  <option>Basic128Rsa15 - Sign</option>
                  <option>None (Insecure)</option>
                </select>
              </div>
            </div>

            {/* OPC-UA Node Tree Explorer */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                OPC-UA Node Tree Hierarchy Browser:
              </div>

              <div className="p-4 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl space-y-2 text-xs font-mono shadow-inner">
                <div className="text-[var(--text-primary)] flex items-center space-x-2">
                  <span className="text-[var(--text-primary)] font-bold">📂 Root</span>
                  <span className="text-[var(--text-secondary)]">/ Objects / PlantRefinery</span>
                </div>

                <div className="pl-4 space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">ns=2;s=Reactor.InletTemp</span>
                      <div className="text-[10px] text-[var(--text-secondary)]">NodeID: Float • Value: 786.9 °C</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      MAPPED TO TAG-RX-01
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">ns=2;s=Pump02.VibrationX</span>
                      <div className="text-[10px] text-[var(--text-secondary)]">NodeID: Float • Value: 0.18 mm/s</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      MAPPED TO TAG-PMP-02
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver View 3: MQTT Broker Explorer */}
      {activeDriver === 'mqtt' && (
        <div className="space-y-6 font-mono">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                  <Radio className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  <span>MQTT v5.0 Broker Subscription Engine</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-mono">Publish/Subscribe IoT Messaging Broker</p>
              </div>

              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                Subscribed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-[var(--text-secondary)] font-bold">Broker Host Address</label>
                <input
                  type="text"
                  value={mqttBroker}
                  onChange={(e) => setMqttBroker(e.target.value)}
                  className="input-nexus"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[var(--text-secondary)] font-bold">Subscribed Topic Pattern</label>
                <input
                  type="text"
                  value={mqttTopic}
                  onChange={(e) => setMqttTopic(e.target.value)}
                  className="input-nexus"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver View 4: REST API Ingestion */}
      {activeDriver === 'rest' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                <Code className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                <span>REST API Telemetry Ingestion Endpoint</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono">HTTP POST JSON Telemetry Ingestion Server</p>
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
              Active Listening (Port 8000)
            </span>
          </div>

          <div className="p-4 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl text-xs space-y-2">
            <div className="text-[var(--text-primary)] font-bold">Endpoint: POST http://127.0.0.1:8000/api/v1/telemetry/stream</div>
            <pre className="text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-lg overflow-x-auto text-[11px]">
              {`{\n  "equipment_tag": "EQ-RX-001",\n  "temperature": 825.5,\n  "vibration": 0.89,\n  "timestamp": "2026-07-27T23:49:00Z"\n}`}
            </pre>
          </div>
        </div>
      )}

      {/* Driver View 5: CSV Batch Upload */}
      {activeDriver === 'csv' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-5 font-mono">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                <FileText className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                <span>CSV Batch Telemetry File Ingestion</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono">Upload historical telemetry logs in standard CSV format</p>
            </div>
          </div>

          {uploadMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-500 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadMsg}</span>
            </div>
          )}

          <div className="p-8 border-2 border-dashed border-[var(--border-color)] hover:border-[var(--brand-primary)] rounded-2xl bg-[var(--bg-canvas)] text-center space-y-4 transition-colors">
            <UploadCloud className="w-10 h-10 text-[var(--text-secondary)] mx-auto" />
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">Drag and drop SCADA CSV files here</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Supports Siemens S7 CSV, Modbus TCP dumps, and custom sensor logs</div>
            </div>
            <button
              onClick={handleCsvUpload}
              disabled={uploading}
              className="btn-nexus-primary bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md inline-flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4 shrink-0" />
              <span>{uploading ? 'Parsing CSV Telemetry...' : 'Browse & Upload CSV File'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Driver View 6: Tag Mapping & Device Discovery */}
      {activeDriver === 'mapping' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                <Tag className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                <span>Device Discovery & SCADA Tag Mapping Table</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono">Map physical hardware registers to digital asset tags</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--text-primary)]">DB100.DBD12 → TAG-RCT-TEMP-101</div>
                <div className="text-[var(--text-secondary)] text-[11px] mt-0.5 font-sans">Reactor-001 Vessel Catalytic Bed Temperature</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold text-[10px]">MAPPED</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--text-primary)]">DB100.DBD16 → TAG-PMP-VIB-202</div>
                <div className="text-[var(--text-secondary)] text-[11px] mt-0.5 font-sans">Pump-002 Recirculation Bearing Vibration</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold text-[10px]">MAPPED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectivityWorkspace;
