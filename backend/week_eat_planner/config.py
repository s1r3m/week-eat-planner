"""Configuration settings for the application.

This module loads configuration settings from a .env file and makes them
available as a `Settings` object.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables and backend/.env.

    Attributes:
        IS_DEBUG: Whether debug mode is enabled; disables the session cookie's Secure flag.
        DB_URL: SQLAlchemy database connection URL.
        BE_HOST: Backend base URL used to construct the Telegram webhook URL.
        FE_HOST: Frontend host setting.
        STORAGE_HOST: S3-compatible endpoint and public image URL base.
        STORAGE_ACCESS_KEY_ID: Object storage access key ID.
        STORAGE_SECRET_ACCESS_KEY: Object storage secret access key.
        STORAGE_REGION: Object storage region setting.
        JWT_SECRET: Legacy JWT signing secret unused by current session authentication.
        JWT_ALGORITHM: Legacy JWT signing algorithm setting.
        JWT_ISSUER: Legacy JWT issuer setting.
        JWT_AUDIENCE: Legacy JWT audience setting.
        SESSION_TTL_DAYS: Stored session lifetime and cookie max-age in days.
        ROTATE_TOKEN_EXPIRE_DELTA: Legacy refresh-token rotation setting, currently unused.
        FORMAT_LOG: Log message format, with a timestamp, level, and message by default.
        LOG_ROTATION: Log rotation size, defaulting to 10 MB.
        ADMIN_IDS: Telegram administrator IDs.
        BOT_TOKEN: Telegram bot token.
        TG_API_SITE: Telegram API base URL.
        GOOGLE_CLIENT_ID: OAuth client ID and expected Google ID-token audience.
        GOOGLE_CLIENT_SECRET: OAuth client secret used for the Google code exchange.
    """

    IS_DEBUG: bool

    DB_URL: str

    BE_HOST: str
    FE_HOST: str

    # Storage settings.
    STORAGE_HOST: str
    STORAGE_ACCESS_KEY_ID: str
    STORAGE_SECRET_ACCESS_KEY: str
    STORAGE_REGION: str

    # Auth settings.
    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_ISSUER: str
    JWT_AUDIENCE: str
    SESSION_TTL_DAYS: int  # Refresh token time to live in days
    ROTATE_TOKEN_EXPIRE_DELTA: int  # Time delta in minutes to rotate refresh token if it's close to expiration

    # Logger settings.
    FORMAT_LOG: str = '{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}'
    LOG_ROTATION: str = '10 MB'

    # Telegram bot variables.
    ADMIN_IDS: list[int]
    BOT_TOKEN: str
    TG_API_SITE: str

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

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
