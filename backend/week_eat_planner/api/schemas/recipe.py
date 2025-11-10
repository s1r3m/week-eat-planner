from uuid import UUID

from pydantic import BaseModel, ConfigDict


class OwnerId(BaseModel):
    user_id: UUID


class RecipeBase(BaseModel):
    """Base schema for a recipe, containing common fields."""

    name: str
    is_public: bool = False
    ingredients: dict[str, int | float | str]


class RecipeCreate(RecipeBase):
    """Schema for creating a new recipe. Inherits all fields from RecipeBase."""

    pass


class RecipeUpdate(RecipeBase):
    """
    Schema for updating an existing recipe. All fields are optional.
    Note: In a real-world PATCH scenario, you might want all fields to be optional.
    If so, inherit from a different base or manually define fields as Optional[...].
    """

    pass


class RecipeRead(RecipeBase, OwnerId):
    """Schema for reading a recipe, including the database ID and user ID."""

    id: UUID

    model_config = ConfigDict(from_attributes=True)


class RecipeReadMinimal(BaseModel):
    """A minimal schema for recipe previews, showing only the ID and name."""

    id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)
