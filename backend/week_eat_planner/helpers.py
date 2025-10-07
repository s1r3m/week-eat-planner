from uuid import UUID

from uuid_utils import uuid7


def generate_uuid7() -> UUID:
    """uuid7() returns uuid_utils.UUID but the DB doesn't recognise that.

    Instead, convert the new value to uuid.UUID type.

    Returns:
        uuid.UUID uuid7() representation.
    """
    return UUID(str(uuid7()))
