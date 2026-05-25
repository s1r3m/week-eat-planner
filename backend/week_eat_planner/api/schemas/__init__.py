from .common import OwnerId, RecordId
from .meal_slot import MealSlotAssign, MealSlotRead
from .recipe import RecipeCreate, RecipeFavoriteFilter, RecipeRead, RecipeReadMinimal, RecipeUpdate
from .token import RefreshTokenFilter, Token, TokenUpdate
from .user import Email, UserCreate, UserRead
from .week import WeekCreate, WeekRead, WeekReadMinimal, WeekUpdate

__all__ = [
    'Email',
    'RecipeFavoriteFilter',
    'MealSlotAssign',
    'MealSlotRead',
    'OwnerId',
    'RecipeCreate',
    'RecipeRead',
    'RecipeReadMinimal',
    'RecipeUpdate',
    'RecordId',
    'RefreshTokenFilter',
    'Token',
    'TokenUpdate',
    'UserCreate',
    'UserRead',
    'WeekCreate',
    'WeekRead',
    'WeekReadMinimal',
    'WeekUpdate',
]


MealSlotRead.model_rebuild()
WeekRead.model_rebuild()
