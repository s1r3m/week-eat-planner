import pytest

from week_eat_planner.constants import WEEKS


@pytest.mark.xfail(reason='No auth')
async def test_weeks__empty_db__empty_response(client):
    response = await client.get(WEEKS)

    assert response.status_code == 200
    assert response.json() == []
