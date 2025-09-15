from week_eat_planner.constants import PING


async def test_ping__always__pong_response(client):
    response = await client.get(PING)

    assert response.status_code == 200
    assert response.text == 'pong'
