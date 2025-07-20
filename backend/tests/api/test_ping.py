async def test_ping__always__pong_response(client):
    response = await client.get('/ping')

    assert response.status_code == 200
    assert response.text == 'pong'
