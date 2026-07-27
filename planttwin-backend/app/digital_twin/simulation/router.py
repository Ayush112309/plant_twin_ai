from fastapi import APIRouter
import uuid
from typing import List
from app.digital_twin.simulation.schemas import SimulationConfig, SimulationResult
from app.digital_twin.simulation.service import SimulationService
from app.shared.responses import APIResponse

router = APIRouter(prefix="/twins/simulation", tags=["Twin Simulation"])
service = SimulationService()

@router.post("/run", response_model=APIResponse[SimulationResult])
async def run_simulation(config: SimulationConfig):
    result = await service.run_simulation(config)
    return APIResponse(data=result)

@router.get("/results/{twin_id}", response_model=APIResponse[List[SimulationResult]])
async def list_results(twin_id: uuid.UUID):
    results = await service.list_results_by_twin(twin_id)
    return APIResponse(data=results)
