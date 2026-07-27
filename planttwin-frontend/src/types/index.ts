export type AssetStatus = 'RUNNING' | 'IDLE' | 'MAINTENANCE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
export type AlarmSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConnectionState = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR';

export interface Plant {
  id: string;
  name: string;
  code: string;
  location?: string;
  timezone?: string;
}

export interface Equipment {
  id: string;
  name: string;
  asset_tag: string;
  equipment_type: string;
  status: AssetStatus;
  health_score?: number;
  plant_id?: string;
}

export interface TelemetryDataPoint {
  sensor_id?: string;
  tag: string;
  value: number;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
  timestamp: string;
  unit?: string;
}

export interface Alarm {
  id: string;
  name: string;
  severity: AlarmSeverity;
  source_id: string;
  message_template: string;
  is_triggered: boolean;
  triggered_at?: string;
}

export interface SystemHealth {
  overall_score: number;
  backend_status: number;
  database_status: number;
  connectivity_status: number;
  ai_services_status: number;
}
