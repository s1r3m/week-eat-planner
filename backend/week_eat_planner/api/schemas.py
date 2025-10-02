from uuid import UUID

from pydantic import BaseModel, EmailStr

import week_eat_planner.db.models as db_model


class Token(BaseModel):
    """Schema for the authentication token."""

    access_token: str
    token_type: str


class UserOut(BaseModel):
    """Schema for user data sent to the client."""

    id: UUID
    email: str
    is_active: bool

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr
    password: str


class WeekPreviewOut(BaseModel):
    """Schema for a short representation of a week."""

    id: UUID
    name: str
    user_id: UUID

    class Config:
        from_attributes = True


class WeekCreate(BaseModel):
    """Schema for creating a new week."""

    name: str


class MealSlotOut(BaseModel):
    """Schema for a meal slot representation."""

    id: UUID
    day_of_week: db_model.DayOfWeek
    meal_type: db_model.MealType
    recipe_id: UUID | None = None

    class Config:
        from_attributes = True


class WeekOut(WeekPreviewOut):
    """Schema for a detailed representation of a week, including meal slots."""

    meal_slots: list[MealSlotOut]

    class Config:
        from_attributes = True


class WeekUpdate(BaseModel):
    """Schema for updating a week's data."""

    name: str
