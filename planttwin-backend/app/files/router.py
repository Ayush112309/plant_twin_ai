from fastapi import APIRouter
from .uploads.router import router as uploads_router

router = APIRouter()
router.include_router(uploads_router)
