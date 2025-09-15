from fastapi import APIRouter, Response
from loguru import logger

from week_eat_planner.constants import PING

router = APIRouter()


@router.get(PING)
async def ping() -> Response:
    logger.info('Got /ping request.')
    return Response(content='pong', status_code=200)
