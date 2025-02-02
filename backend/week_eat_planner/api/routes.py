from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dao import WeekDAO
from week_eat_planner.api.schemas import UserModel
from week_eat_planner.dao.session_maker import db


router = APIRouter(prefix='/api/v1')


@router.get('/ping')
async def ping() -> Response:
    return Response(content='pong', status_code=200)


@router.get('/weeks')
async def get_weeks(
    user: UserModel,
    session: AsyncSession = Depends(db.get_db),
) -> Response:
    return await WeekDAO(session).get_one_or_none(user)
