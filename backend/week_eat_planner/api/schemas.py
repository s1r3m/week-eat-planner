from datetime import datetime

from loguru import logger
from pydantic import BaseModel, EmailStr, Field

from week_eat_planner.helpers import pwd_context


class WeekModel(BaseModel):
    name: str
    user_id: int

    class Config:
        from_attributes = True


class UserShow(BaseModel):
    id: int
    email: str
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class EmailModel(BaseModel):
    email: EmailStr = Field(description='User email')


class UserCreate(EmailModel):
    password: str = Field(description='User password')


class UserModel(UserShow):
    hashed_password: str

    class Config:
        from_attributes = True

    def verify_password(self, password: str) -> bool:
        logger.debug(f'Verifying password for {self.email=}')
        return pwd_context.verify(password, self.hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        logger.debug(f'Hashing {password=}')
        return pwd_context.hash(password)
