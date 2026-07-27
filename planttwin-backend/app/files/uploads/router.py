from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.shared.pagination import PaginationParams, PaginatedResponse
from .schemas import FileMetadata, FileUploadResponse
from .service import FileService

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("/upload", response_model=APIResponse[FileUploadResponse])
async def upload(
    file: UploadFile = File(...),
    category: str = Form("other"),
    tenant_id: Optional[UUID] = Form(None),
    is_public: bool = Form(False),
    db: AsyncSession = Depends(get_db)
):
    result = await FileService.upload_file(db, file, category, tenant_id=tenant_id, is_public=is_public)
    return APIResponse(data=result, message="File uploaded successfully")

@router.get("/{id}", response_model=APIResponse[FileMetadata])
async def get(id: UUID, db: AsyncSession = Depends(get_db)):
    obj = await FileService.get_file_metadata(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="File not found")
    return APIResponse(data=FileMetadata.model_validate(obj))

@router.get("/", response_model=APIResponse[PaginatedResponse[FileMetadata]])
async def list_files(params: PaginationParams = Depends(), db: AsyncSession = Depends(get_db)):
    paginated = await FileService.list_files(db, params)
    return APIResponse(data=paginated)

@router.delete("/{id}", response_model=APIResponse[bool])
async def delete(id: UUID, db: AsyncSession = Depends(get_db)):
    success = await FileService.delete_file(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    return APIResponse(data=True, message="File deleted")
