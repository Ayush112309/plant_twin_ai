import uuid
from datetime import datetime, timedelta
from typing import List
from app.digital_twin.simulation.schemas import SimulationConfig, SimulationResult

class SimulationService:
    def __init__(self):
        self.mock_results = []

    async def run_simulation(self, config: SimulationConfig) -> SimulationResult:
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(seconds=config.duration_seconds)
        
        result = SimulationResult(
            twin_id=config.twin_id,
            scenario=config.scenario_name,
            results={"status": "success", "mock_value": 42},
            started_at=start_time,
            completed_at=end_time
        )
        self.mock_results.append(result)
        return result

    async def list_results_by_twin(self, twin_id: uuid.UUID) -> List[SimulationResult]:
        return [r for r in self.mock_results if r.twin_id == twin_id]
