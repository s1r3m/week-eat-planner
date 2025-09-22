"""Configuration settings for the application.

This module loads configuration settings from a .env file and makes them
available as a `Settings` object.
"""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    DB_URL: str
    BE_HOST: str
    FE_HOST: str

    # Auth settings.
    SECRET_KEY: str
    ALGORITHM: str
    TOKEN_TTL: int  # Access token time to live in minutes.

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
