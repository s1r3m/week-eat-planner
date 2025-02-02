from pydantic import BaseModel


class WeekModel(BaseModel):
    name: str
    user_id: int


class UserModel(BaseModel):
    username: str
    email: str
