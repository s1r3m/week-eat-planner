from .meal_slot import MealSlotAssign, MealSlotRead
from .recipe import OwnerId, RecipeCreate, RecipeRead, RecipeReadMinimal, RecipeUpdate
from .token import RefreshTokenFromDB, Token, TokenRefresh, TokenUpdate
from .user import Email, UserCreate, UserId, UserRead
from .week import WeekCreate, WeekRead, WeekReadMinimal, WeekUpdate

__all__ = [
    'Email',
    'MealSlotAssign',
    'MealSlotRead',
    'OwnerId',
    'RecipeCreate',
    'RecipeRead',
    'RecipeReadMinimal',
    'RecipeUpdate',
    'RefreshTokenFromDB',
    'Token',
    'TokenUpdate',
    'TokenRefresh',
    'UserCreate',
    'UserId',
    'UserRead',
    'WeekCreate',
    'WeekRead',
    'WeekReadMinimal',
    'WeekUpdate',
]


MealSlotRead.model_rebuild()
WeekRead.model_rebuild()
