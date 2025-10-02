from fastapi import status

from week_eat_planner.config import settings

URL_NOT_EXIST = '/test'


def test_settings__always__settings_present():
    assert settings


async def test_app_instance__bad_path__not_found_response(client):
    response = await client.get(URL_NOT_EXIST)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {'detail': 'Not Found'}
