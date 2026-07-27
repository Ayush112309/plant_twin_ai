"""
PlantTwin AI Backend — Asset Event Timeline Service
===================================================
Chronological event timeline for enterprise equipment tracking lifecycle from creation to repair.
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta

_TIMELINE_STORE: Dict[str, List[Dict[str, Any]]] = {}

def generate_mock_timeline(asset_id: str, asset_name: str) -> List[Dict[str, Any]]:
    now = datetime.utcnow()
    return [
        {
            "id": f"evt-10",
            "event_type": "Normal",
            "category": "Telemetry",
            "title": f"{asset_name} Health Score Restored to 98.5%",
            "description": "Vibration levels returned to baseline (0.02 mm/s). SCADA stream synchronized via Siemens PLCSIM.",
            "timestamp": now.isoformat(),
            "color": "emerald",
            "icon": "CheckCircle2",
            "related_data": {
                "sensor": "DB100.DBD12",
                "telemetry_reading": "98.5% Health Index",
                "work_order": "WO-COMPLETED-101",
                "ai_confidence": "99.2%"
            }
        },
        {
            "id": f"evt-09",
            "event_type": "Repair",
            "category": "Maintenance",
            "title": f"Technician Overhaul Completed on {asset_name}",
            "description": "Replaced SKF-209 bearing set, flushed oil reservoir, recalibrated thermal sensor tag.",
            "timestamp": (now - timedelta(hours=3)).isoformat(),
            "color": "emerald",
            "icon": "Wrench",
            "related_data": {
                "technician": "John Doe (Lead Reliability Tech)",
                "work_order": "WO-PMP-12-REPAIR",
                "parts_replaced": ["SKF-209 Bearing Set", "High-Temp O-Ring"]
            }
        },
        {
            "id": f"evt-08",
            "event_type": "Work Order",
            "category": "Maintenance",
            "title": f"Emergency Work Order WO-PMP-12 Dispatched",
            "description": "Dispatched maintenance crew for emergency bearing inspection following thermal trip.",
            "timestamp": (now - timedelta(hours=5)).isoformat(),
            "color": "emerald",
            "icon": "ClipboardList",
            "related_data": {
                "work_order_id": "WO-PMP-12-REPAIR",
                "priority": "HIGH",
                "assigned_to": "John Doe"
            }
        },
        {
            "id": f"evt-07",
            "event_type": "Engineer Comment",
            "category": "User Actions",
            "title": "Engineer Feedback Recorded (Agentic Learning)",
            "description": "Reliability Engineer modified AI diagnosis: 'Actually it was lubrication breakdown, bearing race undamaged.'",
            "timestamp": (now - timedelta(hours=6)).isoformat(),
            "color": "indigo",
            "icon": "User",
            "related_data": {
                "engineer": "reliability.engineer@planttwin.ai",
                "decision": "MODIFIED",
                "corrected_label": "Lubrication Breakdown"
            }
        },
        {
            "id": f"evt-06",
            "event_type": "AI Prediction",
            "category": "AI",
            "title": "AI Model Predicts Bearing Seizure Risk (PRED-RX-88)",
            "description": "LSTM RUL Degradation model calculated 142 days remaining useful life (Confidence: 98.4%).",
            "timestamp": (now - timedelta(hours=8)).isoformat(),
            "color": "purple",
            "icon": "Brain",
            "related_data": {
                "prediction_id": "PRED-RX-88",
                "model": "LSTM RUL Estimator v2.1.0",
                "shap_top_feature": "Vibration Amplitude (+42.1%)"
            }
        },
        {
            "id": f"evt-05",
            "event_type": "Alarm",
            "category": "Alarm",
            "title": f"ISA-18.2 Critical Alarm ALM-2024-001 Triggered",
            "description": "Thermal tag DB100.DBD12 spiked to 100°C (+3.4σ above 98.2°C median).",
            "timestamp": (now - timedelta(hours=10)).isoformat(),
            "color": "amber",
            "icon": "AlertTriangle",
            "related_data": {
                "alarm_id": "ALM-2024-001",
                "severity": "CRITICAL",
                "source": "DB100.DBD12"
            }
        },
        {
            "id": f"evt-04",
            "event_type": "Maintenance",
            "category": "Maintenance",
            "title": "Preventive Seal Inspection Scheduled",
            "description": "Routine 90-day mechanical seal inspection added to work order queue.",
            "timestamp": (now - timedelta(days=2)).isoformat(),
            "color": "emerald",
            "icon": "Calendar",
            "related_data": {
                "schedule_id": "SCH-90D-PREVENTIVE"
            }
        },
        {
            "id": f"evt-03",
            "event_type": "Telemetry Started",
            "category": "Telemetry",
            "title": "Live SCADA Telemetry Stream Ingestion Started",
            "description": "WebSocket hypertable ingestion active across 45 telemetry tags at 100ms frequency.",
            "timestamp": (now - timedelta(days=10)).isoformat(),
            "color": "sky",
            "icon": "LineChart",
            "related_data": {
                "rate": "100ms",
                "database": "TimescaleDB Hypertable"
            }
        },
        {
            "id": f"evt-02",
            "event_type": "PLC Connected",
            "category": "Configuration",
            "title": "Siemens S7-1500 PLC Connected via Siemens PLCSIM",
            "description": "Established 192.168.1.10:102 S7 protocol connection. Rack 0 / Slot 1.",
            "timestamp": (now - timedelta(days=30)).isoformat(),
            "color": "teal",
            "icon": "Zap",
            "related_data": {
                "ip": "192.168.1.10",
                "rack_slot": "0/1"
            }
        },
        {
            "id": f"evt-01",
            "event_type": "Equipment Created",
            "category": "Configuration",
            "title": f"Asset {asset_name} Registered in ISA-95 Hierarchy",
            "description": f"Registered under Refinery Alpha → Hydrocracking Line 101. Tag ID: EQ-{asset_id.upper()}.",
            "timestamp": (now - timedelta(days=60)).isoformat(),
            "color": "slate",
            "icon": "Cpu",
            "related_data": {
                "location": "Refinery Alpha",
                "isa95_level": "Level 3 - Operations"
            }
        }
    ]


class AssetTimelineService:

    @staticmethod
    async def get_timeline(asset_id: str, asset_name: str = "Reactor-001") -> List[Dict[str, Any]]:
        return generate_mock_timeline(asset_id, asset_name)
