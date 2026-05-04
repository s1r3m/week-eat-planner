from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

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
    """Filter for querying users by OAuth credentials or email."""

    oauth_provider: OAuthProvider | None = None
    oauth_id: str | None = None
    email: str | None = None


class GoogleCode(BaseModel):
    """Request body carrying the one-time authorization code from the Google OAuth consent screen."""

    code: str = Field(min_length=1)


class OAuthUserData(BaseModel):
    """Verified identity data extracted from a Google ID token after a successful OAuth exchange."""

    oauth_provider: OAuthProvider
    oauth_id: str
    email: str
    username: str
    avatar_url: str | None


class UserUpdate(BaseModel):
    """Schema for updating user profile fields. At least one field must be provided."""

    email: EmailStr | None = None
    username: str | None = Field(default=None, min_length=1)

    @model_validator(mode='before')
    @classmethod
    def at_least_one(cls, values: dict) -> dict:
        if all([value is None for value in values.values()]):
            raise ValueError('At least one value must be set!')
        return values
