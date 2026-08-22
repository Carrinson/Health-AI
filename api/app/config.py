from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
        Configurations Landed from environment variable or a .env file.

        Why not just read os.environ directly Pydantic validates types at startup - 
        if DATABASE_URL is missing or PORT isnt an integer, the app fails 
        immediatly with a clear message, instead of crashing on the first request 
        an hour later.
    """

    app_name: str = "Health Demo API"
    debug: bool = False 


    # Points at the SSH tunnel to the VPS Postgres, so from the app's point of
    # view the database is local.
    database_url: str = "postgresql+psycopg://healthai:changeme@localhost:5432/healthai"

    # Used to sign JWTs. Anyone holding this can forge a token for any user.
    secret_key: str = "dev-only-change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    ml_model_dir: str = "models"

    model_config = SettingsConfigDict(
        env_file=".env", 
        extra="ignore",
        protected_namespaces=(),
        )

@lru_cache
def get_settings() -> Settings:
    """Cached so the .env file is parsed once not on every request"""
    return Settings()

