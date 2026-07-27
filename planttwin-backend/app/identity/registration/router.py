from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from .schemas import OrganizationRegistrationRequest, OrganizationRegistrationResponse
from .service import RegistrationService

router = APIRouter(prefix="/register", tags=["Registration"])

@router.post("", response_model=APIResponse[OrganizationRegistrationResponse], status_code=status.HTTP_201_CREATED)
async def register_organization(req: OrganizationRegistrationRequest, db: AsyncSession = Depends(get_db)):
    """
    Register a new Organization, create a System Administrator account,
    and return an authentication token.
    """
    service = RegistrationService(db)
    result = await service.register_organization(req)
    return APIResponse(data=result, message="Organization registered successfully", status_code=status.HTTP_201_CREATED)
