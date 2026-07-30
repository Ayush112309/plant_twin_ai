import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TelemetryPoint {
  timestamp: string;
  temp: number;
  vibration: number;
  pressure: number;
  flow: number;
}

export interface EquipmentState {
  id: string;
  name: string;
  asset_tag: string;
  equipment_type: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  health_score: number;
  location: string;
  temp: number;
  vibration: number;
}

export interface AlertItem {
  id: string;
  title: string;
  asset_tag: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  timeAgo: string;
}

export interface LifecycleEvent {
  id: string;
  asset_tag: string;
  type: 'Telemetry' | 'Alarms' | 'Failures' | 'Maintenance' | 'AI Predictions' | 'Configuration' | 'Engineer Actions';
  title: string;
  detail: string;
  timestamp: string;
  color: string;
}

interface PlantTelemetryContextType {
  telemetryStream: TelemetryPoint[];
  equipmentList: EquipmentState[];
  activeAlerts: AlertItem[];
  lifecycleEvents: Record<string, LifecycleEvent[]>;
  digitalTwinState: {
    motor_rpm: number;
    vibration_amplitude: number;
    winding_temp_c: number;
    lubrication_pressure: number;
  };
  rulDays: number;
  systemHealthScore: number;
  isOpcStreaming: boolean;
  activeProtocol: string;
  ingestCSVData: (rows: any[], protocolName?: string) => void;
  updateSiemensTag: (tagAddress: string, value: number) => void;
  resetNominalState: () => void;
}

const initialTelemetryStream: TelemetryPoint[] = [
  { timestamp: '14:30', temp: 68.4, vibration: 0.18, pressure: 520, flow: 260 },
  { timestamp: '14:31', temp: 69.1, vibration: 0.22, pressure: 522, flow: 261 },
  { timestamp: '14:32', temp: 71.5, vibration: 0.35, pressure: 535, flow: 258 },
  { timestamp: '14:33', temp: 74.2, vibration: 0.48, pressure: 542, flow: 255 },
  { timestamp: '14:34', temp: 78.9, vibration: 0.85, pressure: 555, flow: 250 },
  { timestamp: '14:35', temp: 84.5, vibration: 0.24, pressure: 524, flow: 262 },
];

const initialEquipmentList: EquipmentState[] = [
  {
    id: 'e1',
    name: 'Centrifugal Pump-002',
    asset_tag: 'Pump-002',
    equipment_type: 'Pump',
    status: 'Warning',
    health_score: 74.0,
    location: 'Refinery Area A',
    temp: 68.4,
    vibration: 0.24,
  },
  {
    id: 'e2',
    name: 'Reactor Vessel-001',
    asset_tag: 'Reactor-001',
    equipment_type: 'Reactor',
    status: 'Healthy',
    health_score: 84.5,
    location: 'Chemical Processing Line 1',
    temp: 84.5,
    vibration: 0.18,
  },
  {
    id: 'e3',
    name: 'Gas Compressor-001',
    asset_tag: 'Compressor-001',
    equipment_type: 'Compressor',
    status: 'Healthy',
    health_score: 98.5,
    location: 'Compressor House B',
    temp: 45.2,
    vibration: 0.08,
  },
];

const initialAlerts: AlertItem[] = [
  { id: 'a1', title: 'High Temperature Spike', asset_tag: 'Reactor-001', severity: 'CRITICAL', timestamp: 'Just now', timeAgo: '2m ago' },
  { id: 'a2', title: 'Pressure Drop', asset_tag: 'Pump-002', severity: 'WARNING', timestamp: '5m ago', timeAgo: '5m ago' },
  { id: 'a3', title: 'High Vibration Spike', asset_tag: 'Compressor-001', severity: 'WARNING', timestamp: '12m ago', timeAgo: '12m ago' },
  { id: 'a4', title: 'Flow Rate Deviation', asset_tag: 'Line-101', severity: 'INFO', timestamp: '18m ago', timeAgo: '18m ago' },
];

const initialLifecycleEvents: Record<string, LifecycleEvent[]> = {
  'Reactor-001': [
    {
      id: 'l1',
      asset_tag: 'Reactor-001',
      type: 'Telemetry',
      title: 'Live SCADA Telemetry Stream Ingestion Started',
      detail: 'WebSocket hypertable ingestion active across 45 telemetry tags at 100ms frequency.',
      timestamp: '10:00 AM',
      color: 'text-sky-400 border-sky-500/40 bg-sky-950/40',
    },
  ],
  'Pump-002': [
    {
      id: 'l2',
      asset_tag: 'Pump-002',
      type: 'Telemetry',
      title: 'Siemens S7 PLC Connection Active',
      detail: 'S7comm DB1.DBD4 bearing temp offset reader connected.',
      timestamp: '10:00 AM',
      color: 'text-sky-400 border-sky-500/40 bg-sky-950/40',
    },
  ],
};

const PlantTelemetryContext = createContext<PlantTelemetryContextType | undefined>(undefined);

export const PlantTelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetryStream, setTelemetryStream] = useState<TelemetryPoint[]>(initialTelemetryStream);
  const [equipmentList, setEquipmentList] = useState<EquipmentState[]>(initialEquipmentList);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>(initialAlerts);
  const [lifecycleEvents, setLifecycleEvents] = useState<Record<string, LifecycleEvent[]>>(initialLifecycleEvents);
  const [digitalTwinState, setDigitalTwinState] = useState({
    motor_rpm: 1450,
    vibration_amplitude: 0.18,
    winding_temp_c: 84.5,
    lubrication_pressure: 4.2,
  });
  const [rulDays, setRulDays] = useState(142);
  const [systemHealthScore, setSystemHealthScore] = useState(88.5);
  const [isOpcStreaming, setIsOpcStreaming] = useState(true);
  const [activeProtocol, setActiveProtocol] = useState('OPC-UA / SCADA');

  // Live Auto-Updating Telemetry Ticker (Ticks values every 2.5s across all 11 workspaces when OPC-UA streaming is active)
  useEffect(() => {
    if (!isOpcStreaming) return;

    const timer = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTelemetryStream((prev) => {
        const last = prev[prev.length - 1] || { temp: 84.5, vibration: 0.24, pressure: 524, flow: 1250 };
        const stepCount = prev.length;
        const sineWaveTemp = Math.sin(Date.now() / 2000) * 2.2;
        const sineWaveVib = Math.cos(Date.now() / 2200) * 0.06;
        const noiseTemp = (Math.random() - 0.5) * 1.2;
        const noiseVib = (Math.random() - 0.5) * 0.03;

        const isExcursion = last.temp > 110 || last.vibration > 1.2;
        const baseTemp = isExcursion ? 142.8 : 83.5;
        const baseVib = isExcursion ? 1.85 : 0.24;

        const newPoint: TelemetryPoint = {
          timestamp: timeStr,
          temp: Number(Math.max(40, Math.min(180, baseTemp + sineWaveTemp + noiseTemp)).toFixed(1)),
          vibration: Number(Math.max(0.05, Math.min(3.5, baseVib + sineWaveVib + noiseVib)).toFixed(2)),
          pressure: Number((520 + (baseTemp > 80 ? (baseTemp - 80) * 1.4 : 0.4) + Math.sin(stepCount) * 1.5).toFixed(1)),
          flow: Number((1250 - (baseVib > 0.4 ? (baseVib - 0.4) * 160 : 0) + Math.cos(stepCount) * 8.0).toFixed(1)),
        };

        return [...prev.slice(1), newPoint];
      });

      setDigitalTwinState((prev) => ({
        ...prev,
        winding_temp_c: Number((prev.winding_temp_c + (Math.random() - 0.5) * 0.4).toFixed(1)),
        vibration_amplitude: Number((prev.vibration_amplitude + (Math.random() - 0.5) * 0.01).toFixed(2)),
      }));
    }, 2500);

    return () => clearInterval(timer);
  }, [isOpcStreaming]);

  const updateSiemensTag = (tagAddress: string, value: number) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActiveProtocol('Siemens S7 PLC');

    setDigitalTwinState((prev) => {
      if (tagAddress.includes('DBD4') || tagAddress.includes('Temp')) {
        return { ...prev, winding_temp_c: value };
      }
      if (tagAddress.includes('DBD8') || tagAddress.includes('Vib')) {
        return { ...prev, vibration_amplitude: value };
      }
      if (tagAddress.includes('DBD0') || tagAddress.includes('RPM')) {
        return { ...prev, motor_rpm: value };
      }
      return prev;
    });

    setTelemetryStream((prev) => {
      const last = prev[prev.length - 1] || { temp: 84.5, vibration: 0.24, pressure: 524, flow: 1250 };
      const newPoint: TelemetryPoint = {
        timestamp: timeStr,
        temp: tagAddress.includes('DBD4') || tagAddress.includes('Temp') ? value : last.temp,
        vibration: tagAddress.includes('DBD8') || tagAddress.includes('Vib') ? value : last.vibration,
        pressure: last.pressure,
        flow: last.flow,
      };
      return [...prev.slice(1), newPoint];
    });

    if (value > 100 || (tagAddress.includes('Vib') && value > 1.0)) {
      const newAlert: AlertItem = {
        id: `a-${Date.now()}`,
        title: `Siemens S7 Signal Surge on ${tagAddress}`,
        asset_tag: 'Pump-002',
        severity: 'CRITICAL',
        timestamp: 'Just now',
        timeAgo: 'Just now',
      };
      setActiveAlerts((prev) => [newAlert, ...prev]);
      setSystemHealthScore(64.2);
      setRulDays(45);
    }
  };

  const ingestCSVData = (rows: any[], protocolName?: string) => {
    const proto = protocolName || 'OPC-UA / SCADA';
    setActiveProtocol(proto);

    if (!rows || rows.length === 0) {
      setIsOpcStreaming(true);
      return;
    }

    const newPoints: TelemetryPoint[] = [];
    let hasCritical = false;

    rows.forEach((row, idx) => {
      const valNum = parseFloat(row.value) || 84.5;
      const isTemp = (row.parameter || '').toLowerCase().includes('temp') || valNum > 30;
      const isVib = (row.parameter || '').toLowerCase().includes('vib') || valNum < 10;
      const statusStr = (row.status || '').toUpperCase();

      if (statusStr === 'CRITICAL' || valNum > 120 || (isVib && valNum > 1.5)) {
        hasCritical = true;
      }

      newPoints.push({
        timestamp: row.timestamp || `T+${idx}m`,
        temp: isTemp ? valNum : 84.5 + idx * 0.5,
        vibration: isVib ? valNum : 0.24 + idx * 0.05,
        pressure: 524 + idx * 2,
        flow: 1250 - idx * 10,
      });
    });

    if (newPoints.length > 0) {
      setTelemetryStream((prev) => [...prev.slice(newPoints.length), ...newPoints]);
    }

    if (hasCritical) {
      // Update Equipment Statuses across all workspaces
      setEquipmentList((prev) =>
        prev.map((eq) => {
          if (eq.asset_tag === 'Reactor-001' || eq.asset_tag === 'Pump-002') {
            return {
              ...eq,
              status: 'Critical',
              health_score: 38.5,
              temp: 142.8,
              vibration: 1.85,
            };
          }
          return eq;
        })
      );

      // Push active alerts
      const newCriticalAlert: AlertItem = {
        id: `a-scada-${Date.now()}`,
        title: `🚨 ${proto} Ingested Outage Spike`,
        asset_tag: 'Reactor-001 / Pump-002',
        severity: 'CRITICAL',
        timestamp: 'Just now',
        timeAgo: 'Just now',
      };

      setActiveAlerts((prev) => [newCriticalAlert, ...prev]);
      setSystemHealthScore(58.0);
      setRulDays(14);
      setIsOpcStreaming(true);
      setDigitalTwinState((prev) => ({
        ...prev,
        winding_temp_c: 142.8,
        vibration_amplitude: 1.85,
      }));
    } else {
      setSystemHealthScore(92.4);
      setIsOpcStreaming(true);
    }
  };

  const resetNominalState = () => {
    setActiveProtocol('OPC-UA / SCADA');
    setEquipmentList([
      { id: 'e1', name: 'Centrifugal Pump-002', asset_tag: 'Pump-002', equipment_type: 'Pump', status: 'Healthy', health_score: 94.2, location: 'Refinery Area A', temp: 68.4, vibration: 0.18 },
      { id: 'e2', name: 'Reactor Vessel-001', asset_tag: 'Reactor-001', equipment_type: 'Reactor', status: 'Healthy', health_score: 98.5, location: 'Chemical Processing Line 1', temp: 84.5, vibration: 0.18 },
      { id: 'e3', name: 'Gas Compressor-001', asset_tag: 'Compressor-001', equipment_type: 'Compressor', status: 'Healthy', health_score: 98.0, location: 'Compressor House B', temp: 45.2, vibration: 0.08 },
    ]);
    setActiveAlerts([]);
    setSystemHealthScore(94.5);
    setRulDays(142);
    setIsOpcStreaming(false);
    setTelemetryStream([
      { timestamp: '17:50:00', temp: 84.5, vibration: 0.24, pressure: 520.0, flow: 1250.0 },
      { timestamp: '17:51:00', temp: 84.5, vibration: 0.24, pressure: 520.0, flow: 1250.0 },
      { timestamp: '17:52:00', temp: 84.5, vibration: 0.24, pressure: 520.0, flow: 1250.0 },
      { timestamp: '17:53:00', temp: 84.5, vibration: 0.24, pressure: 520.0, flow: 1250.0 },
      { timestamp: '17:54:00', temp: 84.5, vibration: 0.24, pressure: 520.0, flow: 1250.0 },
      { timestamp: '17:55:00', temp: 84.5, vibration: 0.24, pressure: 520.0, flow: 1250.0 },
    ]);
    setDigitalTwinState({
      motor_rpm: 1450,
      vibration_amplitude: 0.18,
      winding_temp_c: 84.5,
      lubrication_pressure: 4.2,
    });
  };

  return (
    <PlantTelemetryContext.Provider
      value={{
        telemetryStream,
        equipmentList,
        activeAlerts,
        lifecycleEvents,
        digitalTwinState,
        rulDays,
        systemHealthScore,
        isOpcStreaming,
        activeProtocol,
        ingestCSVData,
        updateSiemensTag,
        resetNominalState,
      }}
    >
      {children}
    </PlantTelemetryContext.Provider>
  );
};

export const usePlantTelemetry = () => {
  const context = useContext(PlantTelemetryContext);
  if (!context) {
    throw new Error('usePlantTelemetry must be used within a PlantTelemetryProvider');
  }
  return context;
};
