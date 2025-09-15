from week_eat_planner.config import settings

URL_NOT_EXIST = '/test'


def test_settings__always__settings_present():
    assert settings


async def test_app_instance__bad_path__not_found_response(client):
    response = await client.get(URL_NOT_EXIST)

    assert response.status_code == 404
    assert response.json() == {'detail': 'Not Found'}
