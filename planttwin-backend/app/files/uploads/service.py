from uuid import UUID, uuid4
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import UploadFile
from .models import UploadedFile
from .schemas import FileMetadata, FileUploadResponse
from app.shared.pagination import PaginationParams, PaginatedResponse

class FileService:
    @staticmethod
    async def upload_file(db: AsyncSession, file: UploadFile, category: str, uploader_id: Optional[UUID] = None, tenant_id: Optional[UUID] = None, is_public: bool = False) -> FileUploadResponse:
        # Mock save
        stored_name = f"{uuid4()}_{file.filename}"
        path = f"/storage/{category}/{stored_name}"
        
        obj = UploadedFile(
            original_filename=file.filename or "unknown",
            stored_filename=stored_name,
            file_path=path,
            mime_type=file.content_type or "application/octet-stream",
            file_size=1024, # mock size
            uploaded_by=str(uploader_id) if uploader_id else None,
            category=category,
            tenant_id=str(tenant_id) if tenant_id else None,
            is_public=is_public
        )
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        
        metadata = FileMetadata.model_validate(obj)
        return FileUploadResponse(id=obj.id, url=f"/api/files/{obj.id}/download", metadata=metadata)

    @staticmethod
    async def get_file_metadata(db: AsyncSession, id: UUID) -> Optional[UploadedFile]:
        result = await db.execute(select(UploadedFile).where(UploadedFile.id == str(id)))
        return result.scalars().first()

    @staticmethod
    async def list_files(db: AsyncSession, params: PaginationParams) :
        query = select(UploadedFile)
        total = await db.scalar(select(func.count()).select_from(query.subquery()))
        
        query = query.offset(params.offset).limit(params.page_size)
        result = await db.execute(query)
        
        return PaginatedResponse(
            items=result.scalars().all(),
            total=total or 0, page=params.page, size=params.page_size,
            pages=(total + params.page_size - 1) // params.page_size if total else 0
        )

    @staticmethod
    async def delete_file(db: AsyncSession, id: UUID) -> bool:
        obj = await FileService.get_file_metadata(db, id)
        if not obj:
            return False
        await db.delete(obj)
        await db.commit()
        return True
