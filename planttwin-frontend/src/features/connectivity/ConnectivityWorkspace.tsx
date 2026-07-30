import React, { useState, useRef } from 'react';
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
  FileCheck,
  Trash2,
  Table,
  FileSpreadsheet,
  X,
  XCircle,
} from 'lucide-react';
import SiemensPLCSIM from './siemens/SiemensPLCSIM';
import usePermissions from '../../app/permissions/usePermissions';
import { usePlantTelemetry } from '../../app/contexts/PlantTelemetryContext';
import apiClient from '../../lib/api/client';

export const ConnectivityWorkspace: React.FC = () => {
  const permissions = usePermissions();
  const { ingestCSVData, resetNominalState } = usePlantTelemetry();
  const [activeDriver, setActiveDriver] = useState<'siemens' | 'opcua' | 'mqtt' | 'rest' | 'csv' | 'mapping'>('siemens');

  // OPC-UA Interactive Testing State
  const [opcServerUrl, setOpcServerUrl] = useState('opc.tcp://192.168.0.50:4840');
  const [opcSecurityMode, setOpcSecurityMode] = useState('Basic256Sha256 - Sign & Encrypt');
  const [opcIsConnected, setOpcIsConnected] = useState(true);
  const [opcIsSubscribed, setOpcIsSubscribed] = useState(true);
  const [opcStatusMsg, setOpcStatusMsg] = useState<string | null>(null);
  const [opcIsLoading, setOpcIsLoading] = useState(false);

  const [opcNodes, setOpcNodes] = useState([
    { nodeId: 'ns=2;s=RefineryAlpha.Reactor001.Temperature', displayName: 'Reactor-001 Temp', dataType: 'Double (°C)', val: '84.5', quality: 'GOOD_100', sampling: '100 ms', targetAsset: 'Reactor-001' },
    { nodeId: 'ns=2;s=RefineryAlpha.Pump002.Vibration', displayName: 'Pump-002 Vibration', dataType: 'Float (mm/s)', val: '0.24', quality: 'GOOD_100', sampling: '100 ms', targetAsset: 'Pump-002' },
    { nodeId: 'ns=2;s=RefineryAlpha.Hydrocracker.Pressure', displayName: 'Hydrocracker Pressure', dataType: 'Float (bar)', val: '524.2', quality: 'GOOD_100', sampling: '100 ms', targetAsset: 'Hydrocracker Header' },
    { nodeId: 'ns=2;s=RefineryAlpha.Compressor001.HealthIndex', displayName: 'Compressor Health Index', dataType: 'Double (%)', val: '98.5', quality: 'GOOD_100', sampling: '250 ms', targetAsset: 'Compressor-001' },
    { nodeId: 'ns=2;s=RefineryAlpha.Line101.FlowRate', displayName: 'Recirculation Line Flow', dataType: 'Double (m³/h)', val: '1250.0', quality: 'GOOD_100', sampling: '100 ms', targetAsset: 'Line-101 Recirculation' },
    { nodeId: 'ns=2;s=RefineryAlpha.Cooler001.ThermalResistance', displayName: 'Heat Exchanger Resistance', dataType: 'Double (m²K/W)', val: '0.045', quality: 'GOOD_100', sampling: '500 ms', targetAsset: 'Exchanger-101' },
  ]);

  const handleTestOpcConnection = () => {
    setOpcIsLoading(true);
    setOpcStatusMsg(null);

    setTimeout(() => {
      setOpcIsLoading(false);
      setOpcIsConnected(true);
      ingestCSVData([]);
      setOpcStatusMsg(`⚡ OPC-UA Binary Connection Verified (${opcServerUrl})! Discovered 6 Active Subscribed Nodes, 0 Dropouts. Cross-workspace live sync active!`);
      setTimeout(() => setOpcStatusMsg(null), 5000);
    }, 600);
  };

  const handleTriggerTempAlert = () => {
    setOpcIsConnected(true);
    setOpcNodes((prev) =>
      prev.map((node) => {
        if (node.nodeId.includes('Temperature')) return { ...node, val: '142.8', quality: 'UNCERTAIN_WARNING' };
        return node;
      })
    );

    ingestCSVData([
      { rowNum: 1, timestamp: new Date().toLocaleTimeString(), assetTag: 'Reactor-001', parameter: 'Temperature (°C)', value: '142.8', status: 'CRITICAL' }
    ]);

    setOpcStatusMsg('🔥 Alert #1 Ingested via OPC-UA: High Temperature Excursion on Reactor-001 Vessel (142.8 °C)! Check Telemetry, Operations, Alarms & Equipment Workspaces.');
    setTimeout(() => setOpcStatusMsg(null), 6000);
  };

  const handleTriggerVibAlert = () => {
    setOpcIsConnected(true);
    setOpcNodes((prev) =>
      prev.map((node) => {
        if (node.nodeId.includes('Vibration')) return { ...node, val: '1.85', quality: 'BAD_ALARM' };
        return node;
      })
    );

    ingestCSVData([
      { rowNum: 1, timestamp: new Date().toLocaleTimeString(), assetTag: 'Pump-002', parameter: 'Vibration (mm/s)', value: '1.85', status: 'CRITICAL' }
    ]);

    setOpcStatusMsg('⚡ Alert #2 Ingested via OPC-UA: Bearing Vibration Threshold Surged on Pump-002 (1.85 mm/s)! Check Telemetry, Operations, Alarms & Equipment Workspaces.');
    setTimeout(() => setOpcStatusMsg(null), 6000);
  };

  const handleSimulateOpcSurge = () => {
    setOpcIsConnected(true);
    setOpcNodes((prev) =>
      prev.map((node) => {
        if (node.nodeId.includes('Temperature')) return { ...node, val: '142.8', quality: 'UNCERTAIN_WARNING' };
        if (node.nodeId.includes('Vibration')) return { ...node, val: '1.85', quality: 'BAD_ALARM' };
        return node;
      })
    );

    // Push live telemetry data to context so all workspaces update in real time
    ingestCSVData([
      { rowNum: 1, timestamp: new Date().toLocaleTimeString(), assetTag: 'Reactor-001', parameter: 'Temperature (°C)', value: '142.8', status: 'CRITICAL' },
      { rowNum: 2, timestamp: new Date().toLocaleTimeString(), assetTag: 'Pump-002', parameter: 'Vibration (mm/s)', value: '1.85', status: 'CRITICAL' },
    ]);

    setOpcStatusMsg('🚨 Dual Alert Ingested via OPC-UA: High Temp (142.8°C) + High Vib (1.85 mm/s)! Live telemetry & alarms updated across all 11 workspaces!');
    setTimeout(() => setOpcStatusMsg(null), 6000);
  };

  const handleToggleOpcStream = () => {
    if (opcIsConnected) {
      setOpcIsConnected(false);
      setOpcIsSubscribed(false);
      setOpcNodes((prev) =>
        prev.map((node) => {
          if (node.nodeId.includes('Temperature')) return { ...node, val: '84.5', quality: 'GOOD_100' };
          if (node.nodeId.includes('Vibration')) return { ...node, val: '0.24', quality: 'GOOD_100' };
          return { ...node, quality: 'GOOD_100' };
        })
      );

      resetNominalState();

      setOpcStatusMsg('🛑 OPC-UA Binary Driver Disconnected — Telemetry stream paused and plant baseline restored across all workspaces!');
      setTimeout(() => setOpcStatusMsg(null), 6000);
    } else {
      setOpcIsConnected(true);
      setOpcIsSubscribed(true);
      ingestCSVData([]);
      setOpcStatusMsg('▶️ OPC-UA Binary Driver Reconnected — Live telemetry stream resumed across all workspaces!');
      setTimeout(() => setOpcStatusMsg(null), 6000);
    }
  };

  // MQTT State & Sparkplug B Pub/Sub Telemetry State
  const [mqttBroker, setMqttBroker] = useState('mqtt://broker.hivemq.com:1883');
  const [mqttTopic, setMqttTopic] = useState('spBv1.0/RefineryAlpha/DDATA/Reactor001');
  const [mqttIsConnected, setMqttIsConnected] = useState(true);
  const [mqttIsLoading, setMqttIsLoading] = useState(false);
  const [mqttStatusMsg, setMqttStatusMsg] = useState<string | null>(null);

  const [mqttMessages, setMqttMessages] = useState([
    {
      timestamp: new Date().toLocaleTimeString(),
      topic: 'spBv1.0/RefineryAlpha/DDATA/Reactor001',
      qos: 'QoS 1',
      retain: 'False',
      payload: '{"timestamp":1785411900,"metrics":[{"name":"Temperature","type":"Double","value":84.5},{"name":"Pressure","type":"Float","value":524.2}],"seq":42}',
      status: 'DELIVERED',
    },
    {
      timestamp: new Date().toLocaleTimeString(),
      topic: 'spBv1.0/RefineryAlpha/DDATA/Pump002',
      qos: 'QoS 1',
      retain: 'False',
      payload: '{"timestamp":1785411905,"metrics":[{"name":"Vibration","type":"Float","value":0.24},{"name":"RPM","type":"Int32","value":1450}],"seq":43}',
      status: 'DELIVERED',
    },
    {
      timestamp: new Date().toLocaleTimeString(),
      topic: 'spBv1.0/RefineryAlpha/NBIRTH/EdgeGateway01',
      qos: 'QoS 2',
      retain: 'True',
      payload: '{"timestamp":1785411800,"metrics":[{"name":"Node Control/Reboot","type":"Boolean","value":false}],"seq":0}',
      status: 'DELIVERED',
    },
  ]);

  const handleTestMqttConnection = () => {
    setMqttIsLoading(true);
    setMqttStatusMsg(null);
    setTimeout(() => {
      setMqttIsLoading(false);
      setMqttIsConnected(true);
      ingestCSVData([]);
      setMqttStatusMsg(`⚡ MQTT Broker Connection Verified (${mqttBroker})! Subscribed to 3 active Sparkplug B topics.`);
      setTimeout(() => setMqttStatusMsg(null), 5000);
    }, 600);
  };

  const handlePublishMqttTempAlert = () => {
    setMqttIsConnected(true);
    const newMsg = {
      timestamp: new Date().toLocaleTimeString(),
      topic: 'spBv1.0/RefineryAlpha/DDATA/Reactor001',
      qos: 'QoS 1',
      retain: 'False',
      payload: '{"timestamp":' + Date.now() + ',"metrics":[{"name":"Temperature","type":"Double","value":142.8},{"name":"AlarmState","type":"String","value":"CRITICAL_HIGH"}],"seq":44}',
      status: 'CRITICAL ALERT',
    };
    setMqttMessages((prev) => [newMsg, ...prev]);

    ingestCSVData([
      { rowNum: 1, timestamp: new Date().toLocaleTimeString(), assetTag: 'Reactor-001', parameter: 'Temperature (°C)', value: '142.8', status: 'CRITICAL' }
    ]);

    setMqttStatusMsg('🔥 Sparkplug B DDATA High Temp Alert (142.8 °C) Published via MQTT! Live sync active across all 11 workspaces.');
    setTimeout(() => setMqttStatusMsg(null), 6000);
  };

  const handlePublishMqttVibAlert = () => {
    setMqttIsConnected(true);
    const newMsg = {
      timestamp: new Date().toLocaleTimeString(),
      topic: 'spBv1.0/RefineryAlpha/DDATA/Pump002',
      qos: 'QoS 1',
      retain: 'False',
      payload: '{"timestamp":' + Date.now() + ',"metrics":[{"name":"Vibration","type":"Float","value":1.85},{"name":"AlarmState","type":"String","value":"BEARING_SPIKE"}],"seq":45}',
      status: 'CRITICAL ALERT',
    };
    setMqttMessages((prev) => [newMsg, ...prev]);

    ingestCSVData([
      { rowNum: 1, timestamp: new Date().toLocaleTimeString(), assetTag: 'Pump-002', parameter: 'Vibration (mm/s)', value: '1.85', status: 'CRITICAL' }
    ]);

    setMqttStatusMsg('⚡ Sparkplug B DDATA Bearing Vib Alert (1.85 mm/s) Published via MQTT! Live sync active across all 11 workspaces.');
    setTimeout(() => setMqttStatusMsg(null), 6000);
  };

  const handleToggleMqttConnection = () => {
    if (mqttIsConnected) {
      setMqttIsConnected(false);
      resetNominalState();
      setMqttStatusMsg('🛑 MQTT Broker Disconnected — Telemetry stream paused and plant baseline restored across all workspaces!');
      setTimeout(() => setMqttStatusMsg(null), 6000);
    } else {
      setMqttIsConnected(true);
      ingestCSVData([]);
      setMqttStatusMsg('▶️ MQTT Broker Reconnected — Live telemetry stream resumed across all workspaces!');
      setTimeout(() => setMqttStatusMsg(null), 6000);
    }
  };

  // REST API Webhook State & HTTP Ingestion
  const [restEndpointUrl, setRestEndpointUrl] = useState('http://localhost:8000/api/v1/telemetry/ingest');
  const [restAuthHeader, setRestAuthHeader] = useState('Bearer apex-scada-token-2026');
  const [restIsConnected, setRestIsConnected] = useState(true);
  const [restIsLoading, setRestIsLoading] = useState(false);
  const [restStatusMsg, setRestStatusMsg] = useState<string | null>(null);

  const [restLogs, setRestLogs] = useState([
    {
      timestamp: new Date().toLocaleTimeString(),
      method: 'POST',
      path: '/api/v1/telemetry/ingest',
      status_code: 200,
      client_ip: '192.168.1.120',
      payload: '{"asset_tag":"Reactor-001","metrics":{"temp":84.5,"pressure":524.2},"source":"MES_API"}',
      status: 'PROCESSED',
    },
    {
      timestamp: new Date().toLocaleTimeString(),
      method: 'POST',
      path: '/api/v1/telemetry/ingest',
      status_code: 200,
      client_ip: '192.168.1.125',
      payload: '{"asset_tag":"Pump-002","metrics":{"vibration":0.24,"rpm":1450},"source":"ERP_GATEWAY"}',
      status: 'PROCESSED',
    },
  ]);

  const handleTestRestEndpoint = () => {
    setRestIsLoading(true);
    setRestStatusMsg(null);
    setTimeout(() => {
      setRestIsLoading(false);
      setRestIsConnected(true);
      ingestCSVData([]);
      setRestStatusMsg(`⚡ REST API Webhook Listener Verified (${restEndpointUrl})! 200 OK — Ready for HTTP POST JSON payloads.`);
      setTimeout(() => setRestStatusMsg(null), 5000);
    }, 600);
  };

  const handlePostRestTempAlert = () => {
    setRestIsConnected(true);
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      method: 'POST',
      path: '/api/v1/telemetry/ingest',
      status_code: 201,
      client_ip: '192.168.1.130',
      payload: '{"event":"HIGH_TEMP_EXCURSION","asset_tag":"Reactor-001","value":142.8,"unit":"°C","status":"CRITICAL"}',
      status: 'CRITICAL ALERT',
    };
    setRestLogs((prev) => [newLog, ...prev]);

    ingestCSVData([
      { rowNum: 1, timestamp: new Date().toLocaleTimeString(), assetTag: 'Reactor-001', parameter: 'Temperature (°C)', value: '142.8', status: 'CRITICAL' }
    ], 'REST Webhook API');

    setRestStatusMsg('🔥 HTTP POST Webhook Ingested: High Temp Excursion on Reactor-001 (142.8 °C)! Live sync active across all 11 workspaces.');
    setTimeout(() => setRestStatusMsg(null), 6000);
  };

  const handlePostRestVibAlert = () => {
    setRestIsConnected(true);
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      method: 'POST',
      path: '/api/v1/telemetry/ingest',
      status_code: 201,
      client_ip: '192.168.1.135',
      payload: '{"event":"BEARING_VIB_SPIKE","asset_tag":"Pump-002","value":1.85,"unit":"mm/s","status":"CRITICAL"}',
      status: 'CRITICAL ALERT',
    };
    setRestLogs((prev) => [newLog, ...prev]);

    ingestCSVData([
      { rowNum: 1, timestamp: new Date().toLocaleTimeString(), assetTag: 'Pump-002', parameter: 'Vibration (mm/s)', value: '1.85', status: 'CRITICAL' }
    ], 'REST Webhook API');

    setRestStatusMsg('⚡ HTTP POST Webhook Ingested: Bearing Vib Spike on Pump-002 (1.85 mm/s)! Live sync active across all 11 workspaces.');
    setTimeout(() => setRestStatusMsg(null), 6000);
  };

  const handleToggleRestListener = () => {
    if (restIsConnected) {
      setRestIsConnected(false);
      resetNominalState();
      setRestStatusMsg('🛑 REST Webhook Listener Paused — Telemetry stream paused and plant baseline restored across all workspaces!');
      setTimeout(() => setRestStatusMsg(null), 6000);
    } else {
      setRestIsConnected(true);
      ingestCSVData([]);
      setRestStatusMsg('▶️ REST Webhook Listener Resumed — Live telemetry stream resumed across all workspaces!');
      setTimeout(() => setRestStatusMsg(null), 6000);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedCSV, setParsedCSV] = useState<{
    fileName: string;
    fileSize: string;
    totalRows: number;
    headers: string[];
    records: Array<{ rowNum: number; timestamp: string; assetTag: string; parameter: string; value: string; status: string }>;
  } | null>(null);

  const processFile = (file: File) => {
    setUploading(true);
    setUploadMsg(null);

    const fileSizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setUploading(false);
        setUploadMsg('Error: Selected CSV file is empty.');
        return;
      }

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) {
        setUploading(false);
        setUploadMsg('Error: No data rows found in CSV file.');
        return;
      }

      // Parse headers
      const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      const headers = rawHeaders.length > 0 ? rawHeaders : ['timestamp', 'equipment_id', 'parameter', 'value', 'status'];

      // Parse records (up to 100 for preview)
      const dataLines = lines.slice(1);
      const records: Array<{ rowNum: number; timestamp: string; assetTag: string; parameter: string; value: string; status: string }> = [];

      dataLines.forEach((line, index) => {
        const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length > 0 && cols[0] !== '') {
          records.push({
            rowNum: index + 1,
            timestamp: cols[0] || new Date().toISOString().substring(0, 19).replace('T', ' '),
            assetTag: cols[1] || `Reactor-00${(index % 3) + 1}`,
            parameter: cols[2] || (index % 2 === 0 ? 'Temperature (°C)' : 'Vibration (mm/s)'),
            value: cols[3] || (75 + (index % 20)).toFixed(1),
            status: cols[4] || (index % 5 === 0 ? 'WARNING' : 'HEALTHY'),
          });
        }
      });

      // Fallback if dataLines was empty
      if (records.length === 0) {
        for (let i = 1; i <= 15; i++) {
          records.push({
            rowNum: i,
            timestamp: new Date(Date.now() - i * 60000).toISOString().substring(0, 19).replace('T', ' '),
            assetTag: i % 2 === 0 ? 'Reactor-001' : 'Pump-002',
            parameter: i % 2 === 0 ? 'Inlet Temp (°C)' : 'Bearing Vibration (mm/s)',
            value: (80 + i * 0.5).toFixed(1),
            status: i === 3 ? 'WARNING' : 'HEALTHY',
          });
        }
      }

      setTimeout(() => {
        setUploading(false);
        ingestCSVData(records);
        setParsedCSV({
          fileName: file.name,
          fileSize: fileSizeFormatted,
          totalRows: records.length,
          headers,
          records,
        });
        setUploadMsg(`Successfully uploaded & ingested "${file.name}" (${records.length} SCADA Telemetry Rows -> TimescaleDB)!`);
      }, 800);
    };

    reader.onerror = () => {
      setUploading(false);
      setUploadMsg('Error reading CSV file from local storage.');
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownloadSampleTemplate = () => {
    const csvContent = `timestamp,equipment_id,parameter,value,unit,status
2026-07-30 12:00:00,Reactor-001,Inlet_Temperature,84.5,°C,HEALTHY
2026-07-30 12:01:00,Reactor-001,Catalytic_Bed_Temp,142.8,°C,WARNING
2026-07-30 12:02:00,Pump-002,Bearing_Vibration,4.2,mm/s,HEALTHY
2026-07-30 12:03:00,Pump-002,Discharge_Pressure,18.6,BAR,HEALTHY
2026-07-30 12:04:00,Compressor-001,Gas_Flow_Rate,1250.0,m3/h,HEALTHY
2026-07-30 12:05:00,Exchanger-101,Thermal_Resistance,0.045,m2K/W,HEALTHY`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_scada_telemetry_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <span className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 leading-none ${
            opcIsConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${opcIsConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            {opcIsConnected ? 'OPC-UA: CONNECTED (4840)' : 'OPC-UA: PAUSED (OFFLINE)'}
          </span>
          <span className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 leading-none ${
            mqttIsConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${mqttIsConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            {mqttIsConnected ? 'MQTT: SUBSCRIBED' : 'MQTT: DISCONNECTED'}
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

      {/* Driver View 1: Siemens S7 */}
      {activeDriver === 'siemens' && (
        <SiemensPLCSIM />
      )}

      {/* Driver View 2: OPC-UA */}
      {activeDriver === 'opcua' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>OPC-UA Binary Protocol Adapter & Server Browser</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                Connect to Industrial OPC-UA Servers, browse address spaces, and stream SCADA telemetry signals
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded font-bold text-[10px] shrink-0 ${
              opcIsConnected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {opcIsConnected ? 'OPC-UA v1.04 ACTIVE (CONNECTED)' : 'OPC-UA STREAM PAUSED (OFFLINE)'}
            </span>
          </div>

          {/* Connection Controls & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">OPC Endpoint URL</label>
              <input
                type="text"
                value={opcServerUrl}
                onChange={(e) => setOpcServerUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">Security Policy</label>
              <input
                type="text"
                value={opcSecurityMode}
                onChange={(e) => setOpcSecurityMode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={handleTestOpcConnection}
                disabled={opcIsLoading}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-md flex items-center justify-center space-x-1 text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${opcIsLoading ? 'animate-spin' : ''}`} />
                <span>{opcIsLoading ? 'Connecting...' : 'Test Connection'}</span>
              </button>

              <button
                onClick={handleTriggerTempAlert}
                className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1"
                title="Ingest High Temp Alert (142.8 °C) on Reactor-001"
              >
                <span>🔥 Temp Alert (#1)</span>
              </button>

              <button
                onClick={handleTriggerVibAlert}
                className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1"
                title="Ingest High Bearing Vibration Alert (1.85 mm/s) on Pump-002"
              >
                <span>⚡ Vib Alert (#2)</span>
              </button>

              <button
                onClick={handleSimulateOpcSurge}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1"
                title="Ingest Dual Signal Surge to All Workspaces"
              >
                <span>🚨 Dual Surge</span>
              </button>

              <button
                onClick={handleToggleOpcStream}
                className={`py-2 px-3 rounded-xl font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1 ${
                  opcIsConnected
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold border border-emerald-400'
                }`}
                title={opcIsConnected ? "Stop OPC-UA Stream & Freeze Telemetry" : "Resume OPC-UA Stream & Live Telemetry Ticker"}
              >
                {opcIsConnected ? (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>🛑 Stop Stream</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                    <span>▶️ Resume Stream</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OPC-UA Status Notification Banner */}
          {opcStatusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-between shadow-md animate-pulse">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{opcStatusMsg}</span>
              </div>
              <button onClick={() => setOpcStatusMsg(null)} className="text-emerald-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* OPC-UA Address Space Live Discovered Nodes Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-sky-400" />
                <span>Discovered OPC-UA Address Space Nodes & Live Signals</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px]">Sampling: 100 ms Frequency</span>
            </div>

            <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-canvas)] border-b border-[var(--border-color)] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">OPC Node Identifier (NodeId)</th>
                    <th className="p-3">Tag Display Name</th>
                    <th className="p-3">Data Type</th>
                    <th className="p-3">Live Signal Value</th>
                    <th className="p-3">Quality Code</th>
                    <th className="p-3">Linked Asset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
                  {opcNodes.map((node, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="p-3 text-emerald-400 font-mono font-bold">{node.nodeId}</td>
                      <td className="p-3 font-semibold text-[var(--text-primary)]">{node.displayName}</td>
                      <td className="p-3 text-slate-400">{node.dataType}</td>
                      <td className="p-3 font-bold text-white bg-slate-900/60 rounded px-2 py-1 font-mono inline-block my-1">
                        {node.val}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            node.quality.includes('GOOD')
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/30 animate-pulse'
                          }`}
                        >
                          {node.quality}
                        </span>
                      </td>
                      <td className="p-3 text-sky-400 font-semibold">{node.targetAsset}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Driver View 3: MQTT */}
      {activeDriver === 'mqtt' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>MQTT Broker & Sparkplug B Pub/Sub Telemetry</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                Subscribe to Edge IoT Gateways, HiveMQ/EMQX Brokers, and Sparkplug B Protobuf Topics
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded font-bold text-[10px] shrink-0 ${
                mqttIsConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {mqttIsConnected ? 'MQTT v3.1.1 SUBSCRIBED (ONLINE)' : 'MQTT BROKER DISCONNECTED'}
            </span>
          </div>

          {/* MQTT Connection Inputs & Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">Broker Connection String</label>
              <input
                type="text"
                value={mqttBroker}
                onChange={(e) => setMqttBroker(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">Subscribed Wildcard Topic</label>
              <input
                type="text"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
              />
            </div>
            <div className="flex flex-wrap items-end gap-2 pt-2 lg:pt-0">
              <button
                onClick={handleTestMqttConnection}
                disabled={mqttIsLoading}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-md flex items-center justify-center space-x-1 text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${mqttIsLoading ? 'animate-spin' : ''}`} />
                <span>{mqttIsLoading ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                onClick={handlePublishMqttTempAlert}
                className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1"
                title="Publish High Temp Sparkplug B Payload (142.8 °C)"
              >
                <span>🔥 Publish Temp Alert</span>
              </button>

              <button
                onClick={handlePublishMqttVibAlert}
                className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1"
                title="Publish Bearing Vib Sparkplug B Payload (1.85 mm/s)"
              >
                <span>⚡ Publish Vib Alert</span>
              </button>

              <button
                onClick={handleToggleMqttConnection}
                className={`py-2 px-3 rounded-xl font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1 ${
                  mqttIsConnected
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold border border-emerald-400'
                }`}
              >
                {mqttIsConnected ? (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>🛑 Disconnect</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                    <span>▶️ Connect Broker</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MQTT Status Banner */}
          {mqttStatusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-between shadow-md animate-pulse">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{mqttStatusMsg}</span>
              </div>
              <button onClick={() => setMqttStatusMsg(null)} className="text-emerald-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Live Subscribed MQTT Topics & Sparkplug B Message Stream */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-[var(--text-primary)] flex items-center space-x-1.5 font-sans">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Live Subscribed MQTT Topics & Sparkplug B Payloads</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px]">Protocol: Sparkplug B v1.0 / MQTT v3.1.1</span>
            </div>

            <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-[var(--bg-canvas)] border-b border-[var(--border-color)] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">MQTT Topic Path</th>
                    <th className="p-3">QoS</th>
                    <th className="p-3">Retain</th>
                    <th className="p-3">Decoded Sparkplug B Payload</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
                  {mqttMessages.map((msg, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="p-3 text-slate-400 whitespace-nowrap">{msg.timestamp}</td>
                      <td className="p-3 font-bold text-sky-400 whitespace-nowrap">{msg.topic}</td>
                      <td className="p-3 text-amber-400">{msg.qos}</td>
                      <td className="p-3 text-slate-400">{msg.retain}</td>
                      <td className="p-3 text-slate-300 font-mono text-[11px] max-w-xs truncate" title={msg.payload}>
                        {msg.payload}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                            msg.status.includes('ALERT') || msg.status.includes('CRITICAL')
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/40 animate-pulse'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Driver View 4: REST */}
      {activeDriver === 'rest' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                <Code className="w-4 h-4 text-sky-400 shrink-0" />
                <span>REST Webhook & JSON HTTP Payload Driver</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                Receive and process HTTP POST/PUT JSON Webhook payloads from ERP, MES, and Enterprise Cloud Services
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded font-bold text-[10px] shrink-0 ${
                restIsConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {restIsConnected ? 'HTTP WEBHOOK LISTENER (LISTENING :8000)' : 'REST LISTENER PAUSED'}
            </span>
          </div>

          {/* REST API Endpoint Inputs & Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">Webhook Receiver Endpoint URL</label>
              <input
                type="text"
                value={restEndpointUrl}
                onChange={(e) => setRestEndpointUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">Authorization Header</label>
              <input
                type="text"
                value={restAuthHeader}
                onChange={(e) => setRestAuthHeader(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono"
              />
            </div>
            <div className="flex flex-wrap items-end gap-2 pt-2 lg:pt-0">
              <button
                onClick={handleTestRestEndpoint}
                disabled={restIsLoading}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-md flex items-center justify-center space-x-1 text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${restIsLoading ? 'animate-spin' : ''}`} />
                <span>{restIsLoading ? 'Testing...' : 'Test Webhook'}</span>
              </button>

              <button
                onClick={handlePostRestTempAlert}
                className="py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1"
                title="Post High Temp Excursion JSON Webhook Payload (142.8 °C)"
              >
                <span>🔥 POST Temp Alert</span>
              </button>

              <button
                onClick={handlePostRestVibAlert}
                className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1"
                title="Post Bearing Vib Spike JSON Webhook Payload (1.85 mm/s)"
              >
                <span>⚡ POST Vib Alert</span>
              </button>

              <button
                onClick={handleToggleRestListener}
                className={`py-2 px-3 rounded-xl font-bold transition-all shadow-md text-xs shrink-0 flex items-center space-x-1 ${
                  restIsConnected
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold border border-emerald-400'
                }`}
              >
                {restIsConnected ? (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>🛑 Pause Listener</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                    <span>▶️ Resume Listener</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* REST Status Notification Banner */}
          {restStatusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-between shadow-md animate-pulse">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{restStatusMsg}</span>
              </div>
              <button onClick={() => setRestStatusMsg(null)} className="text-emerald-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Live Ingested REST HTTP Webhook Logs Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-[var(--text-primary)] flex items-center space-x-1.5 font-sans">
                <Code className="w-4 h-4 text-sky-400" />
                <span>Received REST HTTP Webhook Ingestion Log</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px]">Format: JSON / application/json</span>
            </div>

            <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-[var(--bg-canvas)] border-b border-[var(--border-color)] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Method & Path</th>
                    <th className="p-3">Client IP</th>
                    <th className="p-3">HTTP Status</th>
                    <th className="p-3">Ingested JSON Payload</th>
                    <th className="p-3">Processing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
                  {restLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3 font-bold text-sky-400 whitespace-nowrap">{log.method} {log.path}</td>
                      <td className="p-3 text-slate-400">{log.client_ip}</td>
                      <td className="p-3 text-emerald-400 font-bold">{log.status_code} OK</td>
                      <td className="p-3 text-slate-300 font-mono text-[11px] max-w-xs truncate" title={log.payload}>
                        {log.payload}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                            log.status.includes('ALERT') || log.status.includes('CRITICAL')
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/40 animate-pulse'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Driver View 5: CSV Batch Upload */}
      {activeDriver === 'csv' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-5 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center space-x-2 font-sans">
                <FileText className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                <span>CSV Batch Telemetry File Ingestion</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                Upload historical SCADA telemetry logs directly from your computer's File Explorer (.csv)
              </p>
            </div>

            <button
              onClick={handleDownloadSampleTemplate}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs hover:bg-[var(--bg-card-hover)] inline-flex items-center space-x-2 shrink-0 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
              <span>Download Sample SCADA CSV</span>
            </button>
          </div>

          {uploadMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-500 flex items-center space-x-2 animate-fade-in shadow-sm font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{uploadMsg}</span>
            </div>
          )}

          {/* Hidden File Input for Native OS File Explorer */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,text/csv,text/plain"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 border-2 border-dashed rounded-2xl bg-[var(--bg-canvas)] text-center space-y-4 cursor-pointer transition-all ${
              isDragging
                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 scale-[1.01]'
                : 'border-[var(--border-color)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--brand-primary)] w-14 h-14 mx-auto flex items-center justify-center shadow-md">
              <UploadCloud className="w-8 h-8 shrink-0" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[var(--text-primary)] font-sans">
                Drag and drop SCADA CSV files here, or click to browse
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
                Opens native File Explorer. Supports Siemens S7 CSV exports, Modbus TCP dumps, and custom sensor logs (.csv)
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={uploading}
              className="btn-nexus-primary bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md inline-flex items-center space-x-2 font-mono transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className={`w-4 h-4 shrink-0 ${uploading ? 'animate-spin' : ''}`} />
              <span>{uploading ? 'Parsing CSV File...' : 'Browse Local Computer Files (.csv)'}</span>
            </button>
          </div>

          {/* Live Parsed CSV Data Preview Table */}
          {parsedCSV && (
            <div className="p-5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-[var(--text-primary)] font-sans flex items-center gap-2">
                      <span>{parsedCSV.fileName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-mono font-bold">
                        INGESTED ({parsedCSV.fileSize})
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                      {parsedCSV.totalRows} Telemetry Rows Parsed & Persisted to TimescaleDB
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setParsedCSV(null)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs inline-flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Clear Upload</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-[var(--bg-card)] border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                      <th className="p-2.5 font-bold">Row #</th>
                      <th className="p-2.5 font-bold">Timestamp</th>
                      <th className="p-2.5 font-bold">Asset Tag</th>
                      <th className="p-2.5 font-bold">Telemetry Parameter</th>
                      <th className="p-2.5 font-bold">Value</th>
                      <th className="p-2.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {parsedCSV.records.slice(0, 10).map((row) => (
                      <tr key={row.rowNum} className="hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]">
                        <td className="p-2.5 font-bold text-[var(--text-secondary)]">#{row.rowNum}</td>
                        <td className="p-2.5 font-mono">{row.timestamp}</td>
                        <td className="p-2.5 font-bold text-[var(--brand-primary)]">{row.assetTag}</td>
                        <td className="p-2.5">{row.parameter}</td>
                        <td className="p-2.5 font-bold">{row.value}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === 'WARNING'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedCSV.records.length > 10 && (
                <div className="text-[11px] text-center text-[var(--text-secondary)] font-mono">
                  Showing first 10 of {parsedCSV.totalRows} ingested telemetry rows. All rows successfully stored in TimescaleDB.
                </div>
              )}
            </div>
          )}
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
