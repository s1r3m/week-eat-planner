"""Legacy JWT and refresh-token schemas unused by current session authentication."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class Token(BaseModel):
    """Legacy JWT response schema unused by current authentication endpoints.

    Attributes:
        access_token: JWT access token value.
        token_type: Token scheme, such as bearer.
    """

    access_token: str
    token_type: str


class RefreshTokenFilter(BaseModel):
    """Legacy refresh-token filter unused by current session lookups.

    Attributes:
        token_hash: Refresh-token hash, defaulting to None.
        user_id: Token owner's ID, defaulting to None.
    """

    token_hash: str | None = None
    user_id: UUID | None = None

    model_config = {'from_attributes': True}


class TokenUpdate(BaseModel):
    """Legacy refresh-token metadata update unused by current session authentication.

    Attributes:
        expires_at: Replacement expiration timestamp, defaulting to None.
        replaced_by: ID of the replacement token, defaulting to None.
        revoked: Revocation flag, defaulting to None.
    """

    expires_at: datetime | None = None
    replaced_by: UUID | None = None
    revoked: bool | None = None
