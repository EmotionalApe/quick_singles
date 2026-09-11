from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Cricket Scorer"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = (
        "postgresql+psycopg://cricket:cricket@localhost:5432/cricket_scorer"
    )

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Cookie Settings for Scorer Session
    COOKIE_SECURE: bool | None = None
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: str | None = None

    # Admin API Key for maintenance/cleanup endpoints
    ADMIN_API_KEY: str | None = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if isinstance(value, str):
            val = value.strip()
            # Standardize postgresql driver to psycopg (v3)
            if val.startswith("postgres://"):
                return val.replace("postgres://", "postgresql+psycopg://", 1)
            elif val.startswith("postgresql://") and not val.startswith("postgresql+"):
                return val.replace("postgresql://", "postgresql+psycopg://", 1)
            return val
        return value

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Union[List[str], str]) -> List[str]:
        if isinstance(value, str):
            if not value.strip():
                return []
            if value.startswith("[") and value.endswith("]"):
                import json
                try:
                    return json.loads(value)
                except Exception:
                    pass
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"}

    @property
    def cookie_secure(self) -> bool:
        if self.COOKIE_SECURE is not None:
            return self.COOKIE_SECURE
        return self.is_production

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [self.CORS_ORIGINS]

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
