import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PlantTwin AI Backend"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "local_sqlite"
    DEBUG: bool = True

    # Security
    JWT_SECRET_KEY: str = "planttwin_super_secret_jwt_key_32bytes_min!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000"]

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5433
    POSTGRES_USER: str = "planttwin"
    POSTGRES_PASSWORD: str = "planttwin_secret"
    POSTGRES_DB: str = "planttwin_db"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.ENVIRONMENT in ("local_sqlite", "development", "local") or os.getenv("USE_LOCAL_SQLITE", "true").lower() == "true":
            if os.getenv("USE_POSTGRES", "false").lower() != "true":
                return "sqlite+aiosqlite:///./planttwin.db"
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    @property
    def REDIS_URI(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # Siemens & Industrial Connectivity Defaults
    SIEMENS_S7_DEFAULT_IP: str = "192.168.0.1"
    OPCUA_DEFAULT_SERVER_URL: str = "opc.tcp://localhost:4840"
    MQTT_DEFAULT_BROKER: str = "localhost"

    # ── Multi-Tenant & Invitation Settings ─────────────────
    FRONTEND_URL: str = "http://localhost:3000"
    INVITATION_EXPIRE_DAYS: int = 7

    # ── Email / SMTP Settings (console fallback for dev) ───
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    EMAIL_FROM: str = "noreply@planttwin.ai"
    EMAIL_FROM_NAME: str = "PlantTwin AI"
    # When True, emails are printed to console instead of sent via SMTP
    EMAIL_USE_CONSOLE: bool = True

    # AI Configuration
    GOOGLE_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
