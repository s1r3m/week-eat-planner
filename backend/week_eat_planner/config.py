"""Configuration settings for the application.

This module loads configuration settings from a .env file and makes them
available as a `Settings` object.
"""

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    IS_DEBUG: bool

    DB_URL: str

    BE_HOST: str
    FE_HOST: str

    # Storage settings.
    STORAGE_HOST: str | None = Field(default=None)
    STORAGE_ACCESS_KEY_ID: str
    STORAGE_SECRET_ACCESS_KEY: str
    STORAGE_REGION: str

    # Auth settings.
    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_ISSUER: str
    JWT_AUDIENCE: str
    ACCESS_TOKEN_TTL: int  # Access token time to live in minutes
    REFRESH_TOKEN_TTL: int  # Refresh token time to live in days
    ROTATE_TOKEN_EXPIRE_DELTA: int  # Time delta in minutes to rotate refresh token if it's close to expiration

    # Logger settings.
    FORMAT_LOG: str = '{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}'
    LOG_ROTATION: str = '10 MB'

    # Telegram bot variables.
    ADMIN_IDS: list[int]
    BOT_TOKEN: str
    TG_API_SITE: str

    model_config = SettingsConfigDict(env_file=Path(__file__).parents[1] / '.env')

    def get_webhook_url(self) -> str:
        """Constructs the full webhook URL for the Telegram bot.

        Returns:
            The complete webhook URL.
        """
        return f'{self.BE_HOST}/webhook'

    def get_tg_api_url(self) -> str:
        """Constructs the base URL for the Telegram Bot API.

        Returns:
            The Telegram Bot API URL.
        """
        return f'{self.TG_API_SITE}/bot{self.BOT_TOKEN}'


settings = Settings()
database_url = settings.DB_URL
