from pydantic import BaseModel, ConfigDict, EmailStr

from week_eat_planner.api.schemas.common import RecordId


class Email(BaseModel):
    """Schema containing only the user's email address."""

    email: EmailStr


class UserCreate(Email):
    """Schema for creating a new user."""

    password: str
    username: str | None = None


class UserRead(Email, RecordId):
    """Detailed schema for reading user information.

    Includes active status, username, and avatar metadata.
    """

    is_active: bool
    username: str | None
    avatar_url: str | None

    model_config = ConfigDict(from_attributes=True)
