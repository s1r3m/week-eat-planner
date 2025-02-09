import pytest

from week_eat_planner.config import settings

DB_URL = 'dummy_db_url'
BE_HOST = 'http://localhost.be'
FE_HOST = 'http://localhost.fe'
SECRET_KEY = 'test'
ALGORITHM = 'HS256'
TOKEN_TTL = 15
ADMIN_IDS = [1]
BOT_TOKEN = 'dummy_token'
TG_API_SITE = 'http://api.telegram.org'


@pytest.fixture
def mocked_settings(mocker):
    mocker.patch.object(settings, 'DB_URL', DB_URL)
    mocker.patch.object(settings, 'BE_HOST', BE_HOST)
    mocker.patch.object(settings, 'FE_HOST', FE_HOST)
    mocker.patch.object(settings, 'SECRET_KEY', SECRET_KEY)
    mocker.patch.object(settings, 'ALGORITHM', ALGORITHM)
    mocker.patch.object(settings, 'TOKEN_TTL', TOKEN_TTL)
    mocker.patch.object(settings, 'ADMIN_IDS', ADMIN_IDS)
    mocker.patch.object(settings, 'BOT_TOKEN', BOT_TOKEN)
    mocker.patch.object(settings, 'TG_API_SITE', TG_API_SITE)


def test_get_webhook_url__always__correct_setting(mocked_settings):
    webhook_url = settings.get_webhook_url()
    assert webhook_url == f'{BE_HOST}/webhook'


def test_get_tg_api_url__always__correct_setting(mocked_settings):
    tg_api_url = settings.get_tg_api_url()
    assert tg_api_url == f'{TG_API_SITE}/bot{BOT_TOKEN}'
