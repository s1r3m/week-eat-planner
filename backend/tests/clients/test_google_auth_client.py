from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import status
from httpx import HTTPStatusError, Request, RequestError, Response
from jose import JWTError

from week_eat_planner.clients.google_auth_client import GOOGLE_ISSUER, GoogleAuthClient, GoogleUrl
from week_eat_planner.config import settings
from week_eat_planner.exceptions import OAuthInvalidCodeException, OAuthProviderException

FAKE_ID_TOKEN_CLAIMS = {
    'sub': 'google-sub-123',
    'email': 'user@example.com',
    'email_verified': True,
    'name': 'Test User',
    'picture': 'https://example.com/avatar.jpg',
}

FAKE_JWKS = {'keys': [{'kid': 'key1', 'kty': 'RSA'}]}


@pytest.fixture
def mock_httpx_client() -> AsyncMock:
    client = AsyncMock()
    mock_token_response = MagicMock()
    mock_token_response.json.return_value = {'id_token': 'fake.jwt.token', 'access_token': 'fake.access.token'}
    mock_jwks_response = MagicMock()
    mock_jwks_response.json.return_value = FAKE_JWKS
    client.post.return_value = mock_token_response
    client.get.return_value = mock_jwks_response
    return client


async def test_get_oauth_user__valid_code__oauth_user_data_returned(mocker, mock_httpx_client):
    mocker.patch('week_eat_planner.clients.google_auth_client.jwt.decode', return_value=FAKE_ID_TOKEN_CLAIMS)
    client = GoogleAuthClient(mock_httpx_client)

    result = await client.get_oauth_user('auth_code')

    assert result.oauth_id == FAKE_ID_TOKEN_CLAIMS['sub']
    assert result.email == FAKE_ID_TOKEN_CLAIMS['email']
    assert result.username == FAKE_ID_TOKEN_CLAIMS['name']
    assert result.avatar_url == FAKE_ID_TOKEN_CLAIMS['picture']


async def test_get_oauth_user__no_picture__avatar_url_is_none(mocker, mock_httpx_client):
    claims_without_picture = {k: v for k, v in FAKE_ID_TOKEN_CLAIMS.items() if k != 'picture'}
    mocker.patch('week_eat_planner.clients.google_auth_client.jwt.decode', return_value=claims_without_picture)
    client = GoogleAuthClient(mock_httpx_client)

    result = await client.get_oauth_user('auth_code')

    assert result.avatar_url is None


async def test_get_oauth_user__jwks_fetched_and_decoded_with_correct_params(mocker, mock_httpx_client):
    mock_decode = mocker.patch(
        'week_eat_planner.clients.google_auth_client.jwt.decode', return_value=FAKE_ID_TOKEN_CLAIMS
    )
    client = GoogleAuthClient(mock_httpx_client)

    await client.get_oauth_user('auth_code')

    mock_httpx_client.get.assert_awaited_once()
    call_kwargs = mock_decode.call_args
    assert call_kwargs.kwargs['algorithms'] == ['RS256']
    assert call_kwargs.kwargs['audience'] == settings.GOOGLE_CLIENT_ID
    assert call_kwargs.kwargs['issuer'] == GOOGLE_ISSUER
    assert call_kwargs.kwargs['access_token'] == 'fake.access.token'


@pytest.mark.parametrize(
    'status_code',
    [
        pytest.param(status.HTTP_400_BAD_REQUEST, id='bad_request'),
        pytest.param(status.HTTP_401_UNAUTHORIZED, id='unauthorized'),
    ],
)
async def test_get_oauth_user__invalid_or_expired_code__invalid_code_error_raised(mock_httpx_client, status_code):
    request = Request('POST', 'https://oauth2.googleapis.com/token')
    response = Response(status_code=status_code, request=request)
    mock_httpx_client.post.return_value.raise_for_status.side_effect = HTTPStatusError(
        message='error', request=request, response=response
    )
    client = GoogleAuthClient(mock_httpx_client)

    with pytest.raises(OAuthInvalidCodeException) as exc:
        await client.get_oauth_user('bad_code')

    error = OAuthInvalidCodeException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


@pytest.mark.parametrize(
    'status_code',
    [
        pytest.param(status.HTTP_500_INTERNAL_SERVER_ERROR, id='internal_server_error'),
        pytest.param(status.HTTP_503_SERVICE_UNAVAILABLE, id='service_unavailable'),
    ],
)
async def test_get_oauth_user__provider_server_error__provider_error_raised(mock_httpx_client, status_code):
    request = Request('POST', GoogleUrl.TOKEN)
    response = Response(status_code=status_code, request=request)
    mock_httpx_client.post.return_value.raise_for_status.side_effect = HTTPStatusError(
        message='error', request=request, response=response
    )
    client = GoogleAuthClient(mock_httpx_client)

    with pytest.raises(OAuthProviderException) as exc:
        await client.get_oauth_user('auth_code')

    error = OAuthProviderException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_get_oauth_user__network_error__provider_error_raised(mock_httpx_client):
    mock_httpx_client.post.side_effect = RequestError('connection failed')
    client = GoogleAuthClient(mock_httpx_client)

    with pytest.raises(OAuthProviderException) as exc:
        await client.get_oauth_user('auth_code')

    error = OAuthProviderException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_get_oauth_user__invalid_jwt__provider_error_raised(mocker, mock_httpx_client):
    mocker.patch('week_eat_planner.clients.google_auth_client.jwt.decode', side_effect=JWTError('bad token'))
    client = GoogleAuthClient(mock_httpx_client)

    with pytest.raises(OAuthProviderException) as exc:
        await client.get_oauth_user('auth_code')

    error = OAuthProviderException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


async def test_get_oauth_user__missing_id_token__provider_error_raised(mock_httpx_client):
    mock_httpx_client.post.return_value.json.return_value = {}
    client = GoogleAuthClient(mock_httpx_client)

    with pytest.raises(OAuthProviderException) as exc:
        await client.get_oauth_user('auth_code')

    error = OAuthProviderException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == 'No id_token in response'


async def test_get_oauth_user__missing_access_token__provider_error_raised(mock_httpx_client):
    mock_httpx_client.post.return_value.json.return_value = {'id_token': 'some_token'}
    client = GoogleAuthClient(mock_httpx_client)

    with pytest.raises(OAuthProviderException) as exc:
        await client.get_oauth_user('auth_code')

    error = OAuthProviderException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == 'No access_token in response'


@pytest.mark.parametrize(
    'claims',
    [
        pytest.param({'email': 'user@example.com', 'name': 'Test User'}, id='missing_sub'),
        pytest.param({'sub': 'google-sub-123', 'name': 'Test User'}, id='missing_email'),
        pytest.param({'sub': 'google-sub-123', 'email': 'user@example.com'}, id='missing_name'),
    ],
)
async def test_get_oauth_user__missing_required_claims__provider_error_raised(mocker, mock_httpx_client, claims):
    mocker.patch('week_eat_planner.clients.google_auth_client.jwt.decode', return_value=claims)
    client = GoogleAuthClient(mock_httpx_client)

    with pytest.raises(OAuthProviderException) as exc:
        await client.get_oauth_user('auth_code')

    error = OAuthProviderException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


@pytest.mark.parametrize(
    'email_verified',
    [
        pytest.param(False, id='false'),
        pytest.param(None, id='missing'),
    ],
)
async def test_get_oauth_user__unverified_email__provider_error_raised(mocker, mock_httpx_client, email_verified):
    claims = {**FAKE_ID_TOKEN_CLAIMS, 'email_verified': email_verified}
    if email_verified is None:
        claims.pop('email_verified')
    mocker.patch('week_eat_planner.clients.google_auth_client.jwt.decode', return_value=claims)
    client = GoogleAuthClient(mock_httpx_client)

    with pytest.raises(OAuthProviderException) as exc:
        await client.get_oauth_user('auth_code')

    error = OAuthProviderException()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail
