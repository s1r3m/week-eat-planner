from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_URL: str
    BE_HOST: str
    FE_HOST: str

    # Auth.
    SECRET_KEY: str
    ALGORITHM: str
    TOKEN_TTL: int

    # Logger settings.
    FORMAT_LOG: str = "{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
    LOG_ROTATION: str = "10 MB"

    # TG vars.
    ADMIN_IDS: list[int]
    BOT_TOKEN: str
    TG_API_SITE: str

    model_config = SettingsConfigDict(env_file=Path(__file__).parents[1] / '.env')

    def get_webhook_url(self) -> str:
        return f'{self.BE_HOST}/webhook'

    def get_tg_api_url(self) -> str:
        return f'{self.TG_API_SITE}/bot{self.BOT_TOKEN}'


settings = Settings()
database_url = settings.DB_URL
