from uuid import UUID

from pydantic import BaseModel, EmailStr

from week_eat_planner.db.models import DayOfWeek, MealType


class Token(BaseModel):
    access_token: str
    token_type: str


class UserOut(BaseModel):
    id: UUID
    email: str
    is_active: bool

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class WeekPreviewOut(BaseModel):
    id: UUID
    name: str
    user_id: UUID

    class Config:
        from_attributes = True


class WeekCreate(BaseModel):
    name: str


class MealSlotOut(BaseModel):
    id: UUID
    day_of_week: DayOfWeek
    meal_type: MealType
    recipe_id: UUID | None = None


class WeekOut(WeekPreviewOut):
    meal_slots: list[MealSlotOut]
