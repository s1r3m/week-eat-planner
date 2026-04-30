from unittest.mock import AsyncMock, MagicMock

import pytest

from week_eat_planner.clients.google_auth_client import GoogleAuthClient

FAKE_ID_TOKEN_CLAIMS = {
    'sub': 'google-sub-123',
    'email': 'user@example.com',
    'name': 'Test User',
    'picture': 'https://example.com/avatar.jpg',
}


@pytest.fixture
def mock_httpx_client() -> AsyncMock:
    return AsyncMock()


async def test_token_exchange__valid_code__oauth_user_data_returned(mocker, mock_httpx_client):
    mock_response = MagicMock()
    mock_response.json.return_value = {'id_token': 'fake.jwt.token'}
    mock_httpx_client.post.return_value = mock_response
    mocker.patch(
        'week_eat_planner.clients.google_auth_client.jwt.get_unverified_claims', return_value=FAKE_ID_TOKEN_CLAIMS
    )
    client = GoogleAuthClient(mock_httpx_client)

    result = await client.token_exchange('auth_code')

    assert result.oauth_id == FAKE_ID_TOKEN_CLAIMS['sub']
    assert result.email == FAKE_ID_TOKEN_CLAIMS['email']
    assert result.username == FAKE_ID_TOKEN_CLAIMS['name']
    assert result.avatar_url == FAKE_ID_TOKEN_CLAIMS['picture']


async def test_token_exchange__no_picture__avatar_url_is_none(mocker, mock_httpx_client):
    claims_without_picture = {k: v for k, v in FAKE_ID_TOKEN_CLAIMS.items() if k != 'picture'}
    mock_response = MagicMock()
    mock_response.json.return_value = {'id_token': 'fake.jwt.token'}
    mock_httpx_client.post.return_value = mock_response
    mocker.patch(
        'week_eat_planner.clients.google_auth_client.jwt.get_unverified_claims', return_value=claims_without_picture
    )
    client = GoogleAuthClient(mock_httpx_client)

    result = await client.token_exchange('auth_code')

    assert result.avatar_url is None
