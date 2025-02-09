from typing import Annotated

from fastapi import APIRouter, Depends, Response
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.dao import WeekDAO
from week_eat_planner.api.schemas import UserOut, WeekModel
from week_eat_planner.db.session_maker import db
from week_eat_planner.dependencies.auth_deps import get_current_active_user

router = APIRouter()


@router.get('/ping')
async def ping() -> Response:
    logger.info('Got /ping request')
    return Response(content='pong', status_code=200)


@router.get('/weeks', response_model=list[WeekModel])
async def get_weeks(
    user: Annotated[UserOut, Depends(get_current_active_user)],
    session: AsyncSession = Depends(db.get_db),
) -> list[WeekModel]:
    logger.info('Got /weeks request')
    weeks = await WeekDAO(session).get_weeks(user)
    return [WeekModel.model_validate(week) for week in weeks]
