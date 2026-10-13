from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.constants import MIN_PASSWORD_LENGTH, OAuthProvider


class Email(BaseModel):
    """Schema containing only the user's email address.

    Attributes:
        email: The user's email address.
    """

    email: EmailStr


class UserCreate(Email):
    """Schema for creating a new user.

    Attributes:
        password: The user's plain-text password.
        username: The user's chosen display name.
    """

    password: str = Field(min_length=MIN_PASSWORD_LENGTH)
    username: str = Field(min_length=1)


class UserRead(Email, RecordId):
    """Detailed schema for reading user information.

    Includes active status, username, and avatar metadata.

    Attributes:
        is_active: Whether the user account is active.
        username: The user's display name.
        avatar_url: The URL to the user's avatar image.
        oauth_provider: The name of the OAuth provider, if applicable.
    """

    is_active: bool
    username: str
    avatar_url: str | None
    oauth_provider: str | None

    model_config = ConfigDict(from_attributes=True)


class UserFilter(BaseModel):
    """Filter for querying users by OAuth credentials or email.

    Attributes:
        oauth_provider: The OAuth provider to filter by.
        oauth_id: The provider-specific user ID.
        email: The email address to filter by.
    """

    oauth_provider: OAuthProvider | None = None
    oauth_id: str | None = None
    email: str | None = None


class GoogleCode(BaseModel):
    """Request body carrying the one-time authorization code from the Google OAuth consent screen.

    Attributes:
        code: The authorization code from Google.
    """

    code: str = Field(min_length=1)


class OAuthUserData(BaseModel):
    """Verified identity data extracted from a Google ID token after a successful OAuth exchange.

    Attributes:
        oauth_provider: The OAuth provider.
        oauth_id: The provider-specific user ID.
        email: The user's email address.
        username: The user's display name.
        avatar_url: The URL to the user's avatar image.
    """

    oauth_provider: OAuthProvider
    oauth_id: str
    email: str
    username: str
    avatar_url: str | None


class UserUpdate(BaseModel):
    """Schema for updating a user's profile.

    Attributes:
        username: The new display name for the user.
    """

    username: str = Field(min_length=1)


class UserChangePassword(BaseModel):
    """Schema for updating a user's password.

    Attributes:
        old_password: The current password.
        new_password: The new desired password.
    """

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
    """Schema for updating user's password.

    Attributes:
        hashed_password: The new hashed password.
    """

    hashed_password: str
