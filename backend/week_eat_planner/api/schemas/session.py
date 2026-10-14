from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, Field


class SessionToken(BaseModel):
    session_token: Annotated[str, Field(min_length=1)]


class UserSession(SessionToken):
    user_id: UUID
