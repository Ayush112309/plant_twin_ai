from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams
from .schemas import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from .service import OrganizationService

router = APIRouter(prefix="/organizations", tags=["Organizations"])

from app.identity.authentication.dependencies import require_admin, get_current_active_user

@router.get("", response_model=APIResponse, dependencies=[Depends(get_current_active_user)])
async def list_organizations(pagination: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    skip = getattr(pagination, "offset", 0)
    limit = getattr(pagination, "page_size", 20)
    orgs = await service.list_organizations(skip=skip, limit=limit)
    res_data = []
    for org in orgs:
        try:
            res_data.append(OrganizationResponse.model_validate(org).model_dump(mode="json"))
        except Exception:
            res_data.append({
                "id": str(org.id),
                "name": org.name,
                "slug": org.slug,
                "description": getattr(org, "description", None),
                "is_active": getattr(org, "is_active", True),
                "subscription_tier": getattr(org, "subscription_tier", "ENTERPRISE"),
            })
    return APIResponse(data=res_data, message="Organizations retrieved successfully")

@router.get("/{org_id}", response_model=APIResponse, dependencies=[Depends(get_current_active_user)])
async def get_organization(org_id: UUID, db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    org = await service.get_by_id(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return APIResponse(data=OrganizationResponse.model_validate(org).model_dump(mode="json"), message="Organization retrieved successfully")

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_organization(org_in: OrganizationCreate, db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    org = await service.create_organization(org_in)
    return APIResponse(data=OrganizationResponse.model_validate(org).model_dump(mode="json"), message="Organization created successfully", status_code=201)

@router.put("/{org_id}", response_model=APIResponse, dependencies=[Depends(require_admin)])
async def update_organization(org_id: UUID, org_in: OrganizationUpdate, db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    org = await service.update_organization(org_id, org_in)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return APIResponse(data=OrganizationResponse.model_validate(org).model_dump(mode="json"), message="Organization updated successfully")

@router.delete("/{org_id}", response_model=APIResponse, dependencies=[Depends(require_admin)])
async def delete_organization(org_id: UUID, db: AsyncSession = Depends(get_db)):
    service = OrganizationService(db)
    success = await service.delete_organization(org_id)
    if not success:
        raise HTTPException(status_code=404, detail="Organization not found")
    return APIResponse(data=None, message="Organization deleted successfully")
