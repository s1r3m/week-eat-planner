from .common import OwnerId, RecordId
from .meal_slot import MealSlotAssign, MealSlotRead
from .recipe import RecipeCreate, RecipeRead, RecipeReadMinimal, RecipeUpdate, UserRecipeFavorite
from .token import RefreshTokenFromDB, Token, TokenUpdate
from .user import Email, UserCreate, UserRead
from .week import WeekCreate, WeekRead, WeekReadMinimal, WeekUpdate

__all__ = [
    'Email',
    'UserRecipeFavorite',
    'MealSlotAssign',
    'MealSlotRead',
    'OwnerId',
    'RecipeCreate',
    'RecipeRead',
    'RecipeReadMinimal',
    'RecipeUpdate',
    'RecordId',
    'RefreshTokenFromDB',
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
