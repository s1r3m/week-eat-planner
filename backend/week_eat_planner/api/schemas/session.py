"""Lookup filters for stored, hashed authentication session tokens."""

from uuid import UUID

from pydantic import BaseModel


class SessionToken(BaseModel):
    """Filter a session lookup by its stored token hash.

    Attributes:
        hashed_token: SHA-256 hex digest of the plain-text session token.
    """

    hashed_token: str


class UserSession(SessionToken):
    """Identify a user's session by its token hash and owner.

    Attributes:
        user_id: ID of the user who owns the session.
    """

    user_id: UUID
