from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class Email(BaseModel):
    email: EmailStr


class UserCreate(Email):
    """Schema for creating a new user."""

    password: str


class UserId(BaseModel):
    id: UUID


class UserRead(Email, UserId):
    """Schema for reading user data."""

    is_active: bool

    model_config = ConfigDict(from_attributes=True)
