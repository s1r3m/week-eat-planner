"""Helper functions for the application."""

from uuid import UUID

from fastapi import Response, UploadFile
from uuid_utils import uuid7

from week_eat_planner.config import settings
from week_eat_planner.constants import ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, SESSION_COOIKE_NAME
from week_eat_planner.exceptions import (
    ImageContentTypeMissingException,
    ImageTooLargeException,
    UnsupportedImageTypeException,
)


def generate_uuid7() -> UUID:
    """Generate a UUID v7 (time-ordered UUID).

    uuid7() returns uuid_utils.UUID but the DB doesn't recognise that.
    Instead, convert the new value to uuid.UUID type.

    Returns:
        A UUID v7 instance.
    """
    return UUID(str(uuid7()))


async def check_image_suitable(image: UploadFile) -> None:
    """Validate an uploaded image for type and size.

    Args:
        image: The uploaded file to validate.

    Raises:
        ImageContentTypeMissingException: If the image has no content type.
        UnsupportedImageTypeException: If the image type is not allowed.
        ImageTooLargeException: If the image exceeds the size limit.
    """
    if not image.content_type:
        raise ImageContentTypeMissingException

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise UnsupportedImageTypeException(image.content_type)

    # Read at most MAX_IMAGE_SIZE_BYTES + 1 to check size limit
    content = await image.read(MAX_IMAGE_SIZE_BYTES + 1)
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise ImageTooLargeException(MAX_IMAGE_SIZE_BYTES)

    # Reset file pointer for storage client
    await image.seek(0)


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOIKE_NAME,
        value=token,
        httponly=True,
        secure=not settings.IS_DEBUG,
        samesite='lax',
        max_age=settings.SESSION_TTL_DAYS * 24 * 60 * 60,
        path='/',
    )
