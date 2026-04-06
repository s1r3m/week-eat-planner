from enum import StrEnum

REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'


class AppUrl(StrEnum):
    """Enumeration of API endpoint URLs."""

    AUTH_LOGIN = '/auth/login'
    AUTH_LOGOUT = '/auth/logout'
    AUTH_REFRESH = '/auth/refresh'
    AUTH_SIGNUP = '/auth/signup'

    PING = '/ping'

    RECIPES = '/recipes'
    RECIPES_MY = '/my_recipes'
    RECIPES_TPL = '/recipes/{recipe_id}'
    RECIPES_IMAGE_TPL = '/recipes/{recipe_id}/image'

    WEEKS = '/weeks'
    WEEKS_TPL = '/weeks/{week_id}'
    WEEK_SLOTS_TPL = '/weeks/{week_id}/slots'

    USER = '/user'


class StorageBucket(StrEnum):
    RECIPES = 'recipes'
    USERS = 'users'
    WEEKS = 'weeks'


class TokenType(StrEnum):
    """Enumeration of token types."""

    BEARER = 'bearer'


class Unit(StrEnum):
    CANS = 'cans'
    GRAM = 'g'
    MILILITERS = 'ml'
    PIECES = 'pcs'


MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
