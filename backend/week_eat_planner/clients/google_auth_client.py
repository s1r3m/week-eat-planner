from enum import StrEnum

from httpx import AsyncClient
from jose import jwt

from week_eat_planner.api.schemas.user import OAuthUserData
from week_eat_planner.config import settings
from week_eat_planner.constants import OAuthProvider

GOOGLE_ISSUER = 'https://accounts.google.com'


class GoogleUrl(StrEnum):
    TOKEN = 'https://oauth2.googleapis.com/token'
    JWKS = 'https://www.googleapis.com/oauth2/v3/certs'


class GoogleAuthClient:
    def __init__(self, httpx_client: AsyncClient) -> None:
        self._client = httpx_client

    async def token_exchange(self, code: str) -> OAuthUserData:
        response = await self._client.post(
            url=GoogleUrl.TOKEN,
            data={
                'code': code,
                'client_id': settings.GOOGLE_CLIENT_ID,
                'client_secret': settings.GOOGLE_CLIENT_SECRET,
                'redirect_uri': 'postmessage',
                'grant_type': 'authorization_code',
            },
        )
        response.raise_for_status()
        id_token = response.json()['id_token']

        jwks_response = await self._client.get(GoogleUrl.JWKS)
        jwks_response.raise_for_status()
        jwks = jwks_response.json()

        data = jwt.decode(
            id_token,
            jwks,
            algorithms=['RS256'],
            audience=settings.GOOGLE_CLIENT_ID,
            issuer=GOOGLE_ISSUER,
        )

        return OAuthUserData(
            oauth_provider=OAuthProvider.GOOGLE,
            oauth_id=data['sub'],
            email=data['email'],
            avatar_url=data.get('picture'),
            username=data['name'],
        )
