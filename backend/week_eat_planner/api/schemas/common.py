from uuid import UUID

from pydantic import BaseModel


class OwnerId(BaseModel):
    """Schema for identifying the owner of a record.

    Attributes:
        user_id: The ID of the user who owns the record.
    """

    user_id: UUID


class RecordId(BaseModel):
    """Schema for identifying a record by its UUID.

    Attributes:
        id: The unique identifier for the record.
    """

    id: UUID


class SuccessResponse(BaseModel):
    """A generic success response model.

    Attributes:
        status: The status message, typically "success".
    """

    status: str = 'success'
