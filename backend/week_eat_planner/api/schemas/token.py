from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class Token(BaseModel):
    """Schema for the authentication token."""

    access_token: str
    token_type: str


class RefreshTokenFromDB(BaseModel):
    """Schema for a refresh token as stored in the database."""
    token_hash: str | None = None
    user_id: UUID | None = None

    model_config = {'from_attributes': True}


class TokenUpdate(BaseModel):
    """Schema for updating a refresh token's metadata."""
    expires_at: datetime | None = None
    replaced_by: UUID | None = None
    revoked: bool | None = None
