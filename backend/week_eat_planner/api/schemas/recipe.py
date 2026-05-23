from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, computed_field

from week_eat_planner.api.schemas.common import OwnerId, RecordId
from week_eat_planner.config import settings
from week_eat_planner.constants import Unit


class CookingStep(BaseModel):
    """Represents a single step in the cooking process.

    Attributes:
        order: The sequence number of the step.
        step: The description of what to do in this step.
    """

    order: int
    step: str


class Ingredient(BaseModel):
    """Represents an ingredient required for a recipe.

    Attributes:
        name: Name of the ingredient.
        amount: Quantity required.
        unit: Unit of measurement (e.g., grams, pieces).
    """

    name: str
    amount: int
    unit: Unit


class RecipeBase(BaseModel):
    """Base schema for a recipe, containing common fields."""

    name: str
    is_public: bool
    steps: list[CookingStep] = Field(default_factory=list)
    ingredients: list[Ingredient] = Field(default_factory=list)


class RecipeCreate(RecipeBase):
    """Schema for creating a new recipe. Inherits all fields from RecipeBase."""

    pass


class RecipeUpdate(BaseModel):
    """Schema for updating an existing recipe.

    Attributes:
        name: The new name of the recipe.
        is_public: The new public/private status.
        steps: The updated list of cooking steps.
        ingredients: The updated list of ingredients.
        image_key: The new storage key for the recipe image.
    """

    name: str | None = None
    is_public: bool | None = None
    steps: list[CookingStep] | None = None
    ingredients: list[Ingredient] | None = None
    image_key: str | None = None


class ImageMixin(BaseModel):
    """Mixin for schemas with image support.

    Attributes:
        image_key: The storage key for the image.
    """

    image_key: str | None = Field(default=None, exclude=True)

    @computed_field
    def image_url(self) -> str | None:
        """Derives a full public URL from the stored image key, or None if no image is set.

        Returns:
            The full public URL to the image, or None.
        """
        if self.image_key:
            return f'{settings.STORAGE_HOST}/{self.image_key}'
        return None


class RecipeRead(RecipeBase, RecordId, OwnerId, ImageMixin):
    """Schema for reading a recipe, including the database ID and user ID.

    Attributes:
        author: The username or email of the recipe's author.
        is_favorite: Whether the recipe is marked as favorite by the current user.
    """

    author: str
    is_favorite: bool

    model_config = ConfigDict(from_attributes=True)


class RecipeReadMinimal(RecordId, ImageMixin):
    """A minimal schema for recipe previews, showing only the ID and name.

    Attributes:
        name: The name of the recipe.
        author: The username or email of the recipe's author.
        is_favorite: Whether the recipe is marked as favorite by the current user.
    """

    name: str
    author: str
    is_favorite: bool

    model_config = ConfigDict(from_attributes=True)


class RecipeFavoriteFilter(BaseModel):
    """Filter for looking up a specific user–recipe favorite relationship.

    Attributes:
        user_id: The ID of the user.
        recipe_id: The ID of the recipe.
    """

    user_id: UUID
    recipe_id: UUID
