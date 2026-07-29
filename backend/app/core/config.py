import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Crypto Algo Trading Bot"
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "trader")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "traderpassword")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "cryptobot")
    DATABASE_URL: str = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    # Binance Settings
    BINANCE_API_KEY: str = os.getenv("BINANCE_API_KEY", "")
    BINANCE_API_SECRET: str = os.getenv("BINANCE_API_SECRET", "")
    USE_TESTNET: bool = os.getenv("USE_TESTNET", "True").lower() in ("true", "1", "t")

    # Redis & Celery Settings
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-jwt-and-fernet-encryption-12345!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    class Config:
        env_file = ".env"

settings = Settings()
