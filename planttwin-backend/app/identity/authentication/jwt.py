"""
JWT Token Utilities — PlantTwin AI Multi-Tenant Auth
=====================================================
Real JWT token creation and verification using python-jose.
Access tokens carry user_id, organization_id, and role in the payload
for stateless authentication and tenant-scoped authorization.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
from uuid import UUID

from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException, status

from app.core.config.settings import settings


CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

TOKEN_EXPIRED_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token has expired",
    headers={"WWW-Authenticate": "Bearer"},
)


def create_access_token(
    user_id: UUID,
    organization_id: Optional[UUID] = None,
    role: Optional[str] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Create a signed JWT access token.

    Payload:
        sub: str (user UUID)
        org_id: str | None (organization UUID for tenant scoping)
        role: str | None (user role for RBAC)
        exp: datetime (expiration)
        iat: datetime (issued at)
        type: "access"
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "org_id": str(organization_id) if organization_id else None,
        "role": role,
        "exp": expire,
        "iat": now,
        "type": "access",
    }

    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    user_id: UUID,
    organization_id: Optional[UUID] = None,
) -> str:
    """
    Create a signed JWT refresh token with a longer expiry.

    Payload:
        sub: str (user UUID)
        org_id: str | None
        exp: datetime
        iat: datetime
        type: "refresh"
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "org_id": str(organization_id) if organization_id else None,
        "exp": expire,
        "iat": now,
        "type": "refresh",
    }

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.

    Returns the full payload dict on success.
    Raises HTTPException 401 on invalid or expired tokens.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        if payload.get("sub") is None:
            raise CREDENTIALS_EXCEPTION
        return payload
    except ExpiredSignatureError:
        raise TOKEN_EXPIRED_EXCEPTION
    except JWTError:
        raise CREDENTIALS_EXCEPTION
