from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class Token(BaseModel):
    """Schema for the authentication token.

    Attributes:
        access_token: The JWT access token.
        token_type: The type of token (e.g., 'bearer').
    """

    access_token: str
    token_type: str


class RefreshTokenFromDB(BaseModel):
    """Schema for a refresh token as stored in the database.

    Attributes:
        token_hash: The hash of the refresh token.
        user_id: The ID of the user who owns the token.
    """

    token_hash: str | None = None
    user_id: UUID | None = None

    model_config = {'from_attributes': True}


class TokenUpdate(BaseModel):
    """Schema for updating a refresh token's metadata.

    Attributes:
        expires_at: The new expiration timestamp.
        replaced_by: The ID of the token that replaced this one.
        revoked: Whether the token has been revoked.
    """

    expires_at: datetime | None = None
    replaced_by: UUID | None = None
    revoked: bool | None = None
