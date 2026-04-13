from uuid import UUID

from pydantic import BaseModel


class OwnerId(BaseModel):
    """Schema for identifying the owner of a record."""

    user_id: UUID


class RecordId(BaseModel):
    """Schema for identifying a record by its UUID."""

    id: UUID
