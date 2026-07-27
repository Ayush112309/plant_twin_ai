from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database.session import get_db
from app.assets.documents.schemas import DocumentCreate, DocumentUpdate, DocumentResponse
from app.assets.documents.service import DocumentService
from app.identity.authentication.dependencies import get_current_org_id

router = APIRouter(prefix="/documents", tags=["Documents"])
document_service = DocumentService()

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(doc_in: DocumentCreate, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    if org_id and not doc_in.organization_id:
        doc_in.organization_id = org_id
    return await document_service.create(db=db, doc_in=doc_in)

@router.get("/by-equipment/{equipment_id}", response_model=List[DocumentResponse])
async def list_documents_by_equipment(equipment_id: uuid.UUID, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    return await document_service.list_by_equipment(db=db, equipment_id=equipment_id, org_id=org_id)

@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: uuid.UUID, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    doc = await document_service.get_by_id(db=db, doc_id=doc_id, org_id=org_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document(doc_id: uuid.UUID, doc_in: DocumentUpdate, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    doc = await document_service.get_by_id(db=db, doc_id=doc_id, org_id=org_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return await document_service.update(db=db, db_doc=doc, doc_in=doc_in)

@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(doc_id: uuid.UUID, org_id: uuid.UUID = Depends(get_current_org_id), db: AsyncSession = Depends(get_db)):
    doc = await document_service.get_by_id(db=db, doc_id=doc_id, org_id=org_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await document_service.delete(db=db, db_doc=doc)
