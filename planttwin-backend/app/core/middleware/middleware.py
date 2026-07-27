"""
PlantTwin AI Backend v2.0 — Request/Response Middleware
========================================================
CORS, request ID injection, request logging, and exception handling.
"""
import time
import uuid
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config.settings import settings
from app.core.logging.logger import logger


def setup_cors(app: FastAPI) -> None:
    """Configure CORS middleware for cross-origin frontend access."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs every incoming request with timing, method, path, and status code."""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.perf_counter()

        try:
            response: Response = await call_next(request)
        except Exception as exc:
            logger.error(
                "Unhandled exception during request",
                request_id=request_id,
                method=request.method,
                path=str(request.url.path),
                error=str(exc),
            )
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "message": "Internal server error",
                    "request_id": request_id,
                },
            )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(
            "Request processed",
            request_id=request_id,
            method=request.method,
            path=str(request.url.path),
            status_code=response.status_code,
            duration_ms=duration_ms,
        )

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time-Ms"] = str(duration_ms)

        return response


def setup_middleware(app: FastAPI) -> None:
    """Register all application middleware."""
    setup_cors(app)
    app.add_middleware(RequestLoggingMiddleware)
