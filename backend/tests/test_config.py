import pytest

from week_eat_planner.config import settings

DEBUG_MODE = 'true'
DB_URL = 'dummy_db_url'
BE_HOST = 'http://localhost.be'
FE_HOST = 'http://localhost.fe'
JWT_SECRET = 'test'
JWT_ALGORITHM = 'HS256'
JWT_ISSUER = 'wep-auth'
JWT_AUDIENCE = 'wep-api'
ACCESS_TOKEN_TTL = 15
REFRESH_TOKEN_TTL = 900
ADMIN_IDS = [1]
BOT_TOKEN = 'dummy_token'
TG_API_SITE = 'http://api.telegram.org'


@pytest.fixture
def mocked_settings(mocker):
    mocker.patch.object(settings, 'DEBUG_MODE', DEBUG_MODE)
    mocker.patch.object(settings, 'DB_URL', DB_URL)
    mocker.patch.object(settings, 'BE_HOST', BE_HOST)
    mocker.patch.object(settings, 'FE_HOST', FE_HOST)
    mocker.patch.object(settings, 'JWT_SECRET', JWT_SECRET)
    mocker.patch.object(settings, 'JWT_ALGORITHM', JWT_ALGORITHM)
    mocker.patch.object(settings, 'JWT_AUDIENCE', JWT_AUDIENCE)
    mocker.patch.object(settings, 'JWT_ALGORITHM', JWT_ALGORITHM)
    mocker.patch.object(settings, 'ACCESS_TOKEN_TTL', ACCESS_TOKEN_TTL)
    mocker.patch.object(settings, 'REFRESH_TOKEN_TTL', REFRESH_TOKEN_TTL)
    mocker.patch.object(settings, 'ADMIN_IDS', ADMIN_IDS)
    mocker.patch.object(settings, 'BOT_TOKEN', BOT_TOKEN)
    mocker.patch.object(settings, 'TG_API_SITE', TG_API_SITE)


def test_get_webhook_url__always__correct_setting(mocked_settings):
    webhook_url = settings.get_webhook_url()
    assert webhook_url == f'{BE_HOST}/webhook'


def test_get_tg_api_url__always__correct_setting(mocked_settings):
    tg_api_url = settings.get_tg_api_url()
    assert tg_api_url == f'{TG_API_SITE}/bot{BOT_TOKEN}'
