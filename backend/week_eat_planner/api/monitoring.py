from fastapi import APIRouter, Response
from loguru import logger

router = APIRouter()


@router.get('/ping')
async def ping() -> Response:
    logger.info('Got /ping request.')
    return Response(content='pong', status_code=200)
