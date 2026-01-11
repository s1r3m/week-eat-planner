from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class Token(BaseModel):
    """Schema for the authentication token."""

    access_token: str
    token_type: str


class RefreshTokenFromDB(BaseModel):
    token_hash: str | None = None
    user_id: UUID | None = None
    device_fingerprint: str | None = None

    model_config = {'from_attributes': True}


class TokenUpdate(BaseModel):
    expires_at: datetime | None = None
    replaced_by: UUID | None = None
    revoked: bool | None = None
