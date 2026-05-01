from unittest.mock import AsyncMock, MagicMock

import pytest

from week_eat_planner.clients.google_auth_client import GOOGLE_ISSUER, GoogleAuthClient

FAKE_ID_TOKEN_CLAIMS = {
    'sub': 'google-sub-123',
    'email': 'user@example.com',
    'name': 'Test User',
    'picture': 'https://example.com/avatar.jpg',
}

FAKE_JWKS = {'keys': [{'kid': 'key1', 'kty': 'RSA'}]}


@pytest.fixture
def mock_httpx_client() -> AsyncMock:
    client = AsyncMock()
    mock_token_response = MagicMock()
    mock_token_response.json.return_value = {'id_token': 'fake.jwt.token'}
    mock_jwks_response = MagicMock()
    mock_jwks_response.json.return_value = FAKE_JWKS
    client.post.return_value = mock_token_response
    client.get.return_value = mock_jwks_response
    return client


async def test_token_exchange__valid_code__oauth_user_data_returned(mocker, mock_httpx_client):
    mocker.patch(
        'week_eat_planner.clients.google_auth_client.jwt.decode', return_value=FAKE_ID_TOKEN_CLAIMS
    )
    client = GoogleAuthClient(mock_httpx_client)

    result = await client.token_exchange('auth_code')

    assert result.oauth_id == FAKE_ID_TOKEN_CLAIMS['sub']
    assert result.email == FAKE_ID_TOKEN_CLAIMS['email']
    assert result.username == FAKE_ID_TOKEN_CLAIMS['name']
    assert result.avatar_url == FAKE_ID_TOKEN_CLAIMS['picture']


async def test_token_exchange__no_picture__avatar_url_is_none(mocker, mock_httpx_client):
    claims_without_picture = {k: v for k, v in FAKE_ID_TOKEN_CLAIMS.items() if k != 'picture'}
    mocker.patch(
        'week_eat_planner.clients.google_auth_client.jwt.decode', return_value=claims_without_picture
    )
    client = GoogleAuthClient(mock_httpx_client)

    result = await client.token_exchange('auth_code')

    assert result.avatar_url is None


async def test_token_exchange__jwks_and_decodes_with_it__correct_params(mocker, mock_httpx_client):
    mock_decode = mocker.patch(
        'week_eat_planner.clients.google_auth_client.jwt.decode', return_value=FAKE_ID_TOKEN_CLAIMS
    )
    client = GoogleAuthClient(mock_httpx_client)

    await client.token_exchange('auth_code')

    mock_httpx_client.get.assert_awaited_once()
    call_kwargs = mock_decode.call_args
    assert call_kwargs.kwargs['algorithms'] == ['RS256']
    assert call_kwargs.kwargs['issuer'] == GOOGLE_ISSUER
