from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.constants import MIN_PASSWORD_LENGTH, OAuthProvider


class Email(BaseModel):
    """Schema containing only the user's email address."""

    email: EmailStr


class UserCreate(Email):
    """Schema for creating a new user."""

    password: str = Field(min_length=MIN_PASSWORD_LENGTH)
    username: str = Field(min_length=1)


class UserRead(Email, RecordId):
    """Detailed schema for reading user information.

    Includes active status, username, and avatar metadata.
    """

    is_active: bool
    username: str
    avatar_url: str | None
    oauth_provider: str | None

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
    """Schema for updating a user's profile."""

    username: str = Field(min_length=1)


class UserChangePassword(BaseModel):
    """Schema for updating a user's password."""

    old_password: str = Field(min_length=MIN_PASSWORD_LENGTH)
    new_password: str = Field(min_length=MIN_PASSWORD_LENGTH)

    @model_validator(mode='after')
    def passwords_dont_match(self) -> 'UserChangePassword':
        """Checks that new_password is not the same as old_password.

        Raises:
            ValueError: if new_password matches old_password.

        Returns:
            UserChangePassword model.
        """
        if self.old_password == self.new_password:
            raise ValueError('Passwords are the same')
        return self


class HashedPassword(BaseModel):
    """Schema for updating user's password."""

    hashed_password: str
