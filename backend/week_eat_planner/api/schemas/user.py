from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class Email(BaseModel):
    email: EmailStr


class UserCreate(Email):
    """Schema for creating a new user."""

    password: str
    username: str | None = None


class UserId(BaseModel):
    id: UUID


class UserRead(Email, UserId):
    """Schema for reading user data."""

    is_active: bool
    username: str | None
    avatar_url: str | None

    model_config = ConfigDict(from_attributes=True)
