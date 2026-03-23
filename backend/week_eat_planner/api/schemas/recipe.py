from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from week_eat_planner.constants import Unit


class OwnerId(BaseModel):
    user_id: UUID


class CookingStep(BaseModel):
    action: str


class Ingredient(BaseModel):
    name: str
    amount: int
    unit: Unit


class RecipeBase(BaseModel):
    """Base schema for a recipe, containing common fields."""

    name: str
    is_public: bool = False
    steps: list[CookingStep] = Field(default_factory=list)
    ingredients: list[Ingredient] = Field(default_factory=list)


class RecipeCreate(RecipeBase):
    """Schema for creating a new recipe. Inherits all fields from RecipeBase."""

    pass


class RecipeUpdate(RecipeBase):
    """Schema for updating an existing recipe."""

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
