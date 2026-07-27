"""
PlantTwin AI — Python SDK
=========================
Python Client Library for PlantTwin AI Backend API.
"""
import requests
from typing import Dict, Any, List, Optional


class PlantTwinClient:
    """Python Client SDK for PlantTwin AI Platform."""

    def __init__(self, base_url: str = "http://localhost:8000/api/v1", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.headers = {"Content-Type": "application/json"}
        if api_key:
            self.headers["X-API-Key"] = api_key

    def get_health(self) -> Dict[str, Any]:
        """Check system health status."""
        resp = requests.get(f"{self.base_url}/health", headers=self.headers)
        return resp.json()

    def ingest_telemetry(self, sensor_id: str, tag: str, value: float) -> Dict[str, Any]:
        """Ingest a single sensor telemetry data point."""
        payload = {"sensor_id": sensor_id, "tag": tag, "value": value}
        resp = requests.post(f"{self.base_url}/telemetry/ingest", json=payload, headers=self.headers)
        return resp.json()

    def list_equipment(self) -> Dict[str, Any]:
        """List registered equipment."""
        resp = requests.get(f"{self.base_url}/assets/equipment/", headers=self.headers)
        return resp.json()
