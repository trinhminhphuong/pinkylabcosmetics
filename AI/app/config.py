from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


AI_ROOT = Path(__file__).resolve().parents[1]


def _split_csv(value: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in value.split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    app_name: str = "PinkyLab AI Service"
    host: str = os.getenv("AI_HOST", "0.0.0.0")
    port: int = int(os.getenv("AI_PORT", "8010"))
    database_path: str = os.getenv("AI_DATABASE_PATH", str(AI_ROOT / "app" / "data" / "ai.db"))
    backend_base_url: str = os.getenv("AI_BACKEND_BASE_URL", "http://localhost:8080/api/v1").rstrip("/")
    backend_timeout_seconds: float = float(os.getenv("AI_BACKEND_TIMEOUT_SECONDS", "2.0"))
    cors_origins: tuple[str, ...] = _split_csv(
        os.getenv("AI_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    )


settings = Settings()
