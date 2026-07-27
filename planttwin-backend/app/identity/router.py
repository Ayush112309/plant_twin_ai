from fastapi import APIRouter
from .users.router import router as users_router
from .roles.router import router as roles_router
from .api_keys.router import router as api_keys_router
from .authentication.router import router as auth_router
from .registration.router import router as registration_router
from .invitations.router import router as invitations_router

router = APIRouter(prefix="/identity")

router.include_router(users_router)
router.include_router(roles_router)
router.include_router(api_keys_router)
router.include_router(auth_router)
router.include_router(registration_router)
router.include_router(invitations_router)
