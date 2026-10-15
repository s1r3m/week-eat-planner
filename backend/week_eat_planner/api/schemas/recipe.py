"""Recipe input, output, image, ingredient, and favorite filter schemas."""

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_serializer

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
    amount: Decimal
    unit: Unit

    @field_serializer('amount')
    def serialize_amount(self, amount: Decimal) -> str:
        """Serializes Decimal amount to string to preserve precision in JSON.

        Args:
            amount: The Decimal amount to serialize.

        Returns:
            The string representation of the amount.
        """
        return str(amount)


class RecipeBase(BaseModel):
    """Base schema for a recipe, containing common fields.

    Attributes:
        name: The name of the recipe.
        is_public: Whether the recipe is visible to all users.
        steps: A list of cooking steps for the recipe.
        ingredients: A list of ingredients required for the recipe.
    """

    name: str
    is_public: bool
    steps: list[CookingStep] = Field(default_factory=list)
    ingredients: list[Ingredient] = Field(default_factory=list)


class RecipeCreate(RecipeBase):
    """Schema for creating a new recipe. Inherits all fields from RecipeBase."""

    pass


class RecipeUpdate(BaseModel):
    """Partial update fields for an existing recipe.

    Only explicitly provided fields are applied by database updates. Fields
    default to None; explicitly passing None remains an update value.

    Attributes:
        name: Replacement name.
        is_public: Replacement public/private flag.
        steps: Replacement cooking steps.
        ingredients: Replacement ingredient list.
        image_key: Replacement bucket/key reference for the image.
    """

    name: str | None = None
    is_public: bool | None = None
    steps: list[CookingStep] | None = None
    ingredients: list[Ingredient] | None = None
    image_key: str | None = None


class ImageMixin(BaseModel):
    """Add an internal image key and a computed public image URL to a schema.

    Attributes:
        image_key: Optional bucket/key reference, excluded from serialized output.
        image_url: Public URL computed from STORAGE_HOST and image_key, or None.
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
    """Full recipe response with inherited content, IDs, and computed image URL.

    Attributes:
        author: Display name of the recipe's author.
        is_favorite: Whether the recipe is a favorite of the requesting user.
    """

    author: str
    is_favorite: bool

    model_config = ConfigDict(from_attributes=True)


class RecipeReadMinimal(RecordId, ImageMixin):
    """Recipe preview containing its ID, name, author, favorite flag, and image URL.

    Attributes:
        name: Name of the recipe.
        author: Display name of the recipe's author.
        is_favorite: Whether the recipe is a favorite of the requesting user.
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
