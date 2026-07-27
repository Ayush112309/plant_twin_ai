import React, { createContext, useContext, useState } from 'react';

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
  ingestCSVData: (rows: any[]) => void;
  updateSiemensTag: (tagAddress: string, value: number) => void;
}

const initialTelemetryStream: TelemetryPoint[] = [
  { timestamp: '14:30', temp: 68.4, vibration: 0.18, pressure: 520, flow: 260 },
  { timestamp: '14:31', temp: 69.1, vibration: 0.22, pressure: 522, flow: 261 },
  { timestamp: '14:32', temp: 71.5, vibration: 0.35, pressure: 535, flow: 258 },
  { timestamp: '14:33', temp: 74.2, vibration: 0.48, pressure: 542, flow: 255 },
  { timestamp: '14:34', temp: 78.9, vibration: 0.85, pressure: 555, flow: 250 },
  { timestamp: '14:35', temp: 68.0, vibration: 0.19, pressure: 515, flow: 262 },
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
    vibration: 0.18,
  },
  {
    id: 'e2',
    name: 'Reactor Vessel-001',
    asset_tag: 'Reactor-001',
    equipment_type: 'Reactor',
    status: 'Critical',
    health_score: 42.0,
    location: 'Chemical Processing Line 1',
    temp: 786.9,
    vibration: 0.42,
  },
  {
    id: 'e3',
    name: 'Gas Compressor-001',
    asset_tag: 'Compressor-001',
    equipment_type: 'Compressor',
    status: 'Healthy',
    health_score: 98.0,
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
    winding_temp_c: 68.4,
    lubrication_pressure: 4.2,
  });
  const [rulDays, setRulDays] = useState(142);
  const [systemHealthScore, setSystemHealthScore] = useState(88.5);

  const updateSiemensTag = (tagAddress: string, value: number) => {
    // Basic mock update logic
  };

  const ingestCSVData = (rows: any[]) => {
    // Basic mock ingest logic
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
        ingestCSVData,
        updateSiemensTag,
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
