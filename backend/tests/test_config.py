import pytest

from week_eat_planner.config import settings

IS_DEBUG = 'true'
DB_URL = 'dummy_db_url'
BE_HOST = 'http://localhost.be'
FE_HOST = 'http://localhost.fe'
STORAGE_HOST = 'http://localhost.storage'
STORAGE_ACCESS_KEY_ID = 'wep'
STORAGE_SECRET_ACCESS_KEY = 'wep'
STORAGE_REGION = 'test'
SESSION_TTL_DAYS = 3
GOOGLE_CLIENT_ID = 'google_id'
GOOGLE_CLIENT_SECRET = 'google_secret'
SMTP_HOST = 'mailpit'
SMTP_PORT = 1025
EMAIL_FROM = 'no-reply@wep.com'


@pytest.fixture
def mocked_settings(mocker):
    mocker.patch.object(settings, 'IS_DEBUG', IS_DEBUG)
    mocker.patch.object(settings, 'DB_URL', DB_URL)
    mocker.patch.object(settings, 'BE_HOST', BE_HOST)
    mocker.patch.object(settings, 'FE_HOST', FE_HOST)
    mocker.patch.object(settings, 'STORAGE_HOST', STORAGE_HOST)
    mocker.patch.object(settings, 'STORAGE_ACCESS_KEY_ID', STORAGE_ACCESS_KEY_ID)
    mocker.patch.object(settings, 'STORAGE_SECRET_ACCESS_KEY', STORAGE_SECRET_ACCESS_KEY)
    mocker.patch.object(settings, 'STORAGE_REGION', STORAGE_REGION)
    mocker.patch.object(settings, 'SESSION_TTL_DAYS', SESSION_TTL_DAYS)
    mocker.patch.object(settings, 'GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID)
    mocker.patch.object(settings, 'GOOGLE_CLIENT_SECRET', GOOGLE_CLIENT_SECRET)
    mocker.patch.object(settings, 'SMTP_HOST', SMTP_HOST)
    mocker.patch.object(settings, 'SMTP_PORT', SMTP_PORT)
    mocker.patch.object(settings, 'EMAIL_FROM', EMAIL_FROM)


def test_get_webhook_url__always__correct_setting(mocked_settings):
    webhook_url = settings.get_webhook_url()
    assert webhook_url == f'{BE_HOST}/webhook'
