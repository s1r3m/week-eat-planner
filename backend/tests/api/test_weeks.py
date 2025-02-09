import pytest


@pytest.mark.xfail(reason='No auth')
def test_weeks__empty_db__empty_response(client):
    response = client.get('/weeks')

    assert response.status_code == 200
    assert response.json() == []
