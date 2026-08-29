from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration loaded from environment variables or a .env file.

    Pydantic validates types at startup — if DATABASE_URL is missing or a value
    is the wrong type, the app fails immediately with a clear message instead of
    crashing on the first request an hour later.
    """

    app_name: str = "HealthAI Demo API"
    debug: bool = False

    database_url: str = "postgresql+psycopg://healthai:changeme@localhost:5432/healthai"

    secret_key: str = "dev-only-change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    ml_model_dir: str = "models"

    # Points at Ollama on the VPS host. Containers reach the host via the
    # Docker network's own gateway IP, NOT localhost or host.docker.internal
    # (the latter doesn't reliably work on Linux hosts). This value depends
    # on which Docker network the API container is on — check with:
    #   docker network inspect <network-name> --format '{{(index .IPAM.Config 0).Gateway}}'
    ollama_url: str = "http://172.20.0.1:11434/api/generate"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        protected_namespaces=(),
    )


@lru_cache
def get_settings() -> Settings:
    """Cached so the .env file is parsed once, not on every request."""
    return Settings()