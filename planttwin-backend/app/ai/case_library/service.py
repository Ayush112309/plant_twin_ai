"""
PlantTwin AI Backend — AI Case Library & Pattern Matching Engine
=================================================================
Enterprise Knowledge Base storing resolved industrial incident cases and auto-matching historical telemetry patterns.
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
import uuid
from app.core.logging.logger import logger
from .schemas import AICaseItem, CreateCaseRequest

_CASE_LIBRARY_DB: List[Dict[str, Any]] = [
    {
        "case_id": "Case #1245",
        "title": "Pump-08 Impeller Bearing Failure & Thermal Trip",
        "equipment_id": "Pump-08",
        "equipment_name": "Pump-08 Centrifugal",
        "root_cause": "Bearing Wear & Lubrication Port Blockage",
        "engineer_action": "Flushed oil port, replaced SKF-209 bearing set, recalibrated vibration sensor tag.",
        "downtime_hours": 3.0,
        "result": "Resolved",
        "tags": ["Pump", "Bearing", "Lubrication", "Vibration"],
        "similarity_pattern_recommendation": "A similar event occurred on Pump-08 last December. The root cause was bearing wear. Consider inspecting the bearing before replacing the motor.",
        "engineer_author": "reliability.engineer@planttwin.ai",
        "created_at": (datetime.utcnow() - timedelta(days=120)).isoformat()
    },
    {
        "case_id": "Case #1189",
        "title": "Reactor-001 Thermal Valve Actuator Diaphragm Rupture",
        "equipment_id": "Reactor-001",
        "equipment_name": "Reactor-001 Vessel",
        "root_cause": "CV-102 Pneumatic Diaphragm Fatigue",
        "engineer_action": "Replaced pneumatic diaphragm, adjusted coolant flow rate +15 m³/h.",
        "downtime_hours": 1.5,
        "result": "Resolved",
        "tags": ["Reactor", "Valve", "Thermal", "Actuator"],
        "similarity_pattern_recommendation": "Thermal spike pattern matches CV-102 pneumatic actuator diaphragm degradation. Inspect pneumatic pressure supply prior to vessel drain.",
        "engineer_author": "plant.manager@planttwin.ai",
        "created_at": (datetime.utcnow() - timedelta(days=45)).isoformat()
    },
    {
        "case_id": "Case #1042",
        "title": "Compressor-001 Gas Seal Pressure Loss",
        "equipment_id": "Compressor-001",
        "equipment_name": "Compressor-001 Gas",
        "root_cause": "O-Ring Seal Degradation under 520 bar pressure",
        "engineer_action": "Replaced high-temp fluorocarbon O-ring, purged gas line.",
        "downtime_hours": 2.0,
        "result": "Resolved",
        "tags": ["Compressor", "Seal", "Pressure", "O-Ring"],
        "similarity_pattern_recommendation": "Pressure drop curve matches high-temp seal degradation observed on Compressor-001 during Q2 audit.",
        "engineer_author": "maintenance.manager@planttwin.ai",
        "created_at": (datetime.utcnow() - timedelta(days=80)).isoformat()
    }
]


class AICaseLibraryService:

    @staticmethod
    async def list_cases(query: str = None, tag: str = None) -> List[Dict[str, Any]]:
        results = []
        for c in _CASE_LIBRARY_DB:
            if tag and tag.upper() != "ALL" and tag.lower() not in [t.lower() for t in c["tags"]]:
                continue
            if query:
                q = query.lower()
                matches = (
                    q in c["case_id"].lower() or
                    q in c["title"].lower() or
                    q in c["equipment_name"].lower() or
                    q in c["root_cause"].lower() or
                    q in c["engineer_action"].lower()
                )
                if not matches:
                    continue
            results.append(c)
        return results

    @staticmethod
    async def get_pattern_recommendation(equipment_id: str) -> Dict[str, Any]:
        for c in _CASE_LIBRARY_DB:
            if equipment_id.lower() in c["equipment_id"].lower() or equipment_id.lower() in c["equipment_name"].lower():
                return {
                    "matched_case_id": c["case_id"],
                    "matched_title": c["title"],
                    "root_cause": c["root_cause"],
                    "recommendation": c["similarity_pattern_recommendation"],
                    "suggested_action": c["engineer_action"]
                }

        # Default pattern match
        c = _CASE_LIBRARY_DB[0]
        return {
            "matched_case_id": c["case_id"],
            "matched_title": c["title"],
            "root_cause": c["root_cause"],
            "recommendation": "A similar event occurred on Pump-08 last December. The root cause was bearing wear. Consider inspecting the bearing before replacing the motor.",
            "suggested_action": c["engineer_action"]
        }

    @staticmethod
    async def create_case(req: CreateCaseRequest) -> Dict[str, Any]:
        num = len(_CASE_LIBRARY_DB) + 1246
        new_case = {
            "case_id": f"Case #{num}",
            "title": req.title,
            "equipment_id": req.equipment_id,
            "equipment_name": req.equipment_name,
            "root_cause": req.root_cause,
            "engineer_action": req.engineer_action,
            "downtime_hours": req.downtime_hours,
            "result": "Resolved",
            "tags": req.tags,
            "similarity_pattern_recommendation": req.similarity_pattern_recommendation or f"Pattern logged for {req.equipment_name}. Root cause: {req.root_cause}.",
            "engineer_author": "engineer@planttwin.ai",
            "created_at": datetime.utcnow().isoformat()
        }
        _CASE_LIBRARY_DB.insert(0, new_case)
        logger.info(f"Created new AI Case Library record {new_case['case_id']}: {new_case['title']}")
        return new_case
