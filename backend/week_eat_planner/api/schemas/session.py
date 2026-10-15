from uuid import UUID

from pydantic import BaseModel


class SessionToken(BaseModel):
    hashed_token: str


class UserSession(SessionToken):
    user_id: UUID
