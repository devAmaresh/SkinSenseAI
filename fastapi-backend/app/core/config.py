from decouple import config
import secrets


class Settings:
    # Database Configuration
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./skinai.db")

    # Security Configuration
    SECRET_KEY: str = config("SECRET_KEY", default=secrets.token_urlsafe(32))
    ALGORITHM: str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config(
        "ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int
    )

    # Database Pool Configuration
    DB_POOL_SIZE: int = config("DB_POOL_SIZE", default=10, cast=int)
    DB_MAX_OVERFLOW: int = config("DB_MAX_OVERFLOW", default=20, cast=int)
    DB_POOL_RECYCLE: int = config("DB_POOL_RECYCLE", default=300, cast=int)

    # Application Configuration
    DEBUG: bool = config("DEBUG", default=False, cast=bool)
    TESTING: bool = config("TESTING", default=False, cast=bool)

    # CORS Configuration
    ALLOWED_ORIGINS: list = config(
        "ALLOWED_ORIGINS",
        default="http://localhost:3000,http://localhost:8080,http://localhost:19006",
        cast=lambda v: [s.strip() for s in v.split(",")],
    )
    GEMINI_API_KEY: str = config("GEMINI_API_KEY", default="")


settings = Settings()
