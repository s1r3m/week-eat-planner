from uuid import UUID

from pydantic import BaseModel, EmailStr


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
    password: str | None = None


class WeekModel(BaseModel):
    name: str
    user_id: UUID

    class Config:
        from_attributes = True
