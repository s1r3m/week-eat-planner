from pydantic import BaseModel, ConfigDict, EmailStr, Field

from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.constants import OAuthProvider


class Email(BaseModel):
    """Schema containing only the user's email address."""

    email: EmailStr


class UserCreate(Email):
    """Schema for creating a new user."""

    password: str
    username: str = Field(min_length=1)


class UserRead(Email, RecordId):
    """Detailed schema for reading user information.

    Includes active status, username, and avatar metadata.
    """

    is_active: bool
    username: str
    avatar_url: str | None

    model_config = ConfigDict(from_attributes=True)


class UserFilter(BaseModel):
    oauth_id: str | None = None
    email: str | None = None


class GoogleCode(BaseModel):
    code: str


class OAuthUserData(BaseModel):
    oauth_provider: OAuthProvider = Field(exclude=True)
    oauth_id: str
    email: str
    username: str
    avatar_url: str | None
