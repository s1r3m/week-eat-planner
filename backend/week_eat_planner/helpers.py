from uuid import UUID

from fastapi import UploadFile
from uuid_utils import uuid7

from week_eat_planner.constants import ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES
from week_eat_planner.exceptions import ValidationException


def generate_uuid7() -> UUID:
    """uuid7() returns uuid_utils.UUID but the DB doesn't recognise that.

    Instead, convert the new value to uuid.UUID type.

    Returns:
        uuid.UUID uuid7() representation.
    """
    return UUID(str(uuid7()))


async def check_image_suitable(image: UploadFile) -> None:
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValidationException(f'Unsupported image type: {image.content_type}')

    # Read at most MAX_IMAGE_SIZE_BYTES + 1 to check size limit
    content = await image.read(MAX_IMAGE_SIZE_BYTES + 1)
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise ValidationException(
            f'Image too large: maximum size is {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB',
        )

    # Reset file pointer for storage client
    await image.seek(0)
