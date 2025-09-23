from fastapi import APIRouter, Response
from loguru import logger

from week_eat_planner.constants import AppUrl

router = APIRouter()


@router.get(AppUrl.PING)
async def ping() -> Response:
    """A health check endpoint.

    Returns:
        A response with the content 'pong'.
    """
    logger.info('Got /ping request.')
    return Response(content='pong', status_code=200)
