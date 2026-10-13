from fastapi import status

from week_eat_planner.constants import AppUrl


async def test_ping__always__pong_response(client):
    response = await client.get(AppUrl.PING)

    assert response.status_code == status.HTTP_200_OK
    assert response.text == 'pong'
