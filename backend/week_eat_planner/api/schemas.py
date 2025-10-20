from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr

from week_eat_planner.db.models import DayOfWeek, MealType


class Token(BaseModel):
    """Schema for the authentication token."""

    access_token: str
    token_type: str


class RefreshTokenFromDB(BaseModel):
    token_hash: str | None = None
    user_id: UUID | None = None


class TokenUpdate(BaseModel):
    expires_at: datetime | None = None
    replaced_by: UUID | None = None
    revoked: bool | None = None


class Email(BaseModel):
    """Schema to check email fields."""

    email: EmailStr


class UserCreate(Email):
    """Schema for creating a new user."""

    password: str


class UserID(BaseModel):
    id: UUID


class UserOut(UserID):
    """Schema for user data sent to the client."""

    email: str
    is_active: bool

    class Config:
        from_attributes = True


class RecipeCreate(BaseModel):
    """Schema for creating a new recipe."""

    name: str
    is_public: bool
    ingredients: dict[str, int | float | str]


class RecipePreviewOut(BaseModel):
    """Schema for a short representation of a recipe."""

    id: UUID
    name: str

    class Config:
        from_attributes = True


class RecipeUserId(BaseModel):
    user_id: UUID


class RecipeOut(RecipePreviewOut, RecipeUserId):
    """Schema for a detailed representation of a recipe."""

    is_public: bool
    ingredients: dict[str, int | float | str]


class MealSlotOut(BaseModel):
    """Schema for a meal slot representation."""

    id: UUID
    day_of_week: DayOfWeek
    meal_type: MealType
    recipe: RecipePreviewOut | None = None

    class Config:
        from_attributes = True


class WeekBase(BaseModel):
    """Base schema for week data."""

    name: str


class WeekPreviewOut(WeekBase):
    """Schema for a short representation of a week."""

    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True


class WeekCreate(WeekBase):
    """Schema for creating a new week."""

    pass


class WeekUpdate(BaseModel):
    """Schema for updating a week's data."""

    name: str


class WeekOut(WeekPreviewOut):
    """Schema for a detailed representation of a week, including meal slots."""

    meal_slots: list[MealSlotOut]

    class Config:
        from_attributes = True
