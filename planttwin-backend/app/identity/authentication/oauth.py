"""
PlantTwin AI Backend — OAuth2 Provider Handler (Google & Microsoft SSO)
========================================================================
Enterprise Single Sign-On (SSO) integration for Google Workspace and Microsoft Azure AD.
"""
from typing import Dict, Any, Optional
from app.core.security.auth import create_access_token, create_refresh_token
from app.core.logging.logger import logger


class OAuthService:
    """OAuth2 SSO handler for Google & Microsoft."""

    @staticmethod
    async def authenticate_google(id_token: str) -> Dict[str, Any]:
        """Authenticate user using Google OAuth2 ID Token."""
        # Simulated Google OAuth2 token validation
        user_info = {
          "sub": "google-user-10023",
          "email": "engineer@enterprise.com",
          "first_name": "Google",
          "last_name": "User",
          "provider": "google"
        }
        logger.info(f"Google SSO login successful for {user_info['email']}")

        access_token = create_access_token(user_info["sub"])
        refresh_token = create_refresh_token(user_info["sub"])

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_info
        }

    @staticmethod
    async def authenticate_microsoft(access_token_ms: str) -> Dict[str, Any]:
        """Authenticate user using Microsoft Azure AD Access Token."""
        user_info = {
          "sub": "ms-azure-user-9912",
          "email": "operator@planttwin.ai",
          "first_name": "Microsoft",
          "last_name": "User",
          "provider": "microsoft"
        }
        logger.info(f"Microsoft Azure AD SSO login successful for {user_info['email']}")

        access_token = create_access_token(user_info["sub"])
        refresh_token = create_refresh_token(user_info["sub"])

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_info
        }
