from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/udaan_courses"
    admin_username: str = "admin"
    admin_password: str = "change-me"
    session_secret: str = "development-only-change-this-secret-32chars"
    frontend_origin: str = "http://localhost:5173"
    google_client_id: str = ""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

# Render and some providers supply postgres:// or postgresql:// URLs.
DATABASE_URL = settings.database_url.replace("postgres://", "postgresql+psycopg://", 1)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
