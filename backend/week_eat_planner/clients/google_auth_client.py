"""Client for Google OAuth 2.0 authentication."""

from enum import StrEnum

from fastapi import status
from httpx import AsyncClient, HTTPStatusError, RequestError
from jose import JWTError, jwt
from loguru import logger

from week_eat_planner.api.schemas.user import OAuthUserData
from week_eat_planner.config import settings
from week_eat_planner.constants import OAuthProvider
from week_eat_planner.exceptions import OAuthInvalidCodeException, OAuthProviderException

GOOGLE_ISSUER = 'https://accounts.google.com'


class GoogleUrl(StrEnum):
    """Google OAuth 2.0 endpoint URLs."""

    TOKEN = 'https://oauth2.googleapis.com/token'
    JWKS = 'https://www.googleapis.com/oauth2/v3/certs'


class GoogleAuthClient:
    """Client for authenticating users via Google OAuth 2.0.

    Exchanges an authorization code for a verified identity by fetching
    Google's public JWKS and validating the returned ID token signature,
    audience, issuer, and expiry.
    """

    def __init__(self, httpx_client: AsyncClient) -> None:
        """Initializes the client with a shared async HTTP client.

        Args:
            httpx_client: An async HTTP client used for all outbound requests.
        """
        self._client = httpx_client

    async def get_oauth_user(self, code: str) -> OAuthUserData:
        """Exchanges a Google authorization code for verified user identity data.

        Performs the authorization code exchange against Google's token endpoint,
        fetches Google's public JWKS, and verifies the returned ID token's
        signature, audience, issuer, and expiry before extracting the user claims.

        Args:
            code: The one-time authorization code received from the Google OAuth
                consent screen.

        Returns:
            An OAuthUserData instance populated with the verified claims from
            Google's ID token.

        Raises:
            OAuthInvalidCodeException: If Google rejects the code with a 400 or
                401 (expired, already used, or malformed code).
            OAuthProviderException: If Google returns a 5xx error, a network
                error occurs, or the ID token fails JWT verification.
        """
        logger.info('Exchanging Google authorization code for user identity.')
        try:
            token_response = await self._client.post(
                url=GoogleUrl.TOKEN,
                data={
                    'code': code,
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'redirect_uri': 'postmessage',
                    'grant_type': 'authorization_code',
                },
            )
            token_response.raise_for_status()
            token_data = token_response.json()
            id_token = token_data.get('id_token')
            if id_token is None:
                logger.error('Google token response is missing the id_token field.')
                raise OAuthProviderException('No id_token in response')

            access_token = token_data.get('access_token')
            if access_token is None:
                logger.error('Google token response is missing the access_token field.')
                raise OAuthProviderException('No access_token in response')

            logger.debug('Received ID token from Google token endpoint.')
            jwks_response = await self._client.get(GoogleUrl.JWKS)
            jwks_response.raise_for_status()
            jwks = jwks_response.json()
            logger.debug('Fetched Google JWKS for token verification.')

            data = jwt.decode(
                id_token,
                jwks,
                algorithms=['RS256'],
                audience=settings.GOOGLE_CLIENT_ID,
                issuer=GOOGLE_ISSUER,
                access_token=access_token,
            )
            missing_claims = [key for key in ('sub', 'email', 'name') if key not in data]
            if missing_claims:
                logger.error(f'Google ID token is missing required claims: {missing_claims}.')
                raise OAuthProviderException()
            if not data.get('email_verified'):
                logger.error('Google ID token has an unverified email.')
                raise OAuthProviderException()

        except HTTPStatusError as exc:
            if exc.response.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED):
                logger.warning(f'Google rejected authorization code with {exc.response.status_code}.')
                raise OAuthInvalidCodeException() from exc
            logger.error(f'Google token endpoint returned unexpected status {exc.response.status_code}.')
            raise OAuthProviderException() from exc
        except RequestError as exc:
            logger.error(f'Network error during Google OAuth exchange: {exc}.')
            raise OAuthProviderException() from exc
        except JWTError as exc:
            logger.error(f'Google ID token verification failed: {exc}.')
            raise OAuthProviderException() from exc

        logger.info('Successfully verified Google identity.')
        return OAuthUserData(
            oauth_provider=OAuthProvider.GOOGLE,
            oauth_id=data['sub'],
            email=data['email'],
            avatar_url=data.get('picture'),
            username=data['name'],
        )
