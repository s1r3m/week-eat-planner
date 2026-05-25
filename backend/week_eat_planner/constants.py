"""Application-wide constants and enumerations."""

from enum import StrEnum

MIN_PASSWORD_LENGTH = 8


class AppUrl(StrEnum):
    """Enumeration of API endpoint URLs."""

    AUTH_GOOGLE_EXCHANGE = '/auth/google/exchange'
    AUTH_LOGIN = '/auth/login'
    AUTH_LOGOUT = '/auth/logout'
    AUTH_REFRESH = '/auth/refresh'
    AUTH_SIGNUP = '/auth/signup'

    PING = '/ping'

    RECIPES = '/recipes'
    RECIPES_FAVORITES = '/recipes/favorites'
    RECIPES_MY = '/recipes/my_recipes'
    RECIPES_TPL = '/recipes/{recipe_id}'
    RECIPES_IMAGE_TPL = '/recipes/{recipe_id}/image'
    RECIPES_FAVORITES_TPL = '/recipes/{recipe_id}/favorite'

    WEEKS = '/weeks'
    WEEKS_TPL = '/weeks/{week_id}'
    WEEK_SLOTS_TPL = '/weeks/{week_id}/slots'

    USER = '/user'
    USER_PASSWORD = '/user/password'


ACCESS_TOKEN_COOKIE_NAME = 'access_token'
ACCESS_TOKEN_COOIKE_PATH = '/'
REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'
REFRESH_TOKEN_COOKIE_PATH = '/'


class StorageBucket(StrEnum):
    """Enumeration of object storage bucket names."""

    RECIPES = 'recipes'
    USERS = 'users'
    WEEKS = 'weeks'


class TokenType(StrEnum):
    """Enumeration of token types."""

    BEARER = 'bearer'


class Unit(StrEnum):
    """Enumeration of supported measurement units for recipe ingredients."""

    CANS = 'cans'
    GRAM = 'g'
    MILILITERS = 'ml'
    PIECES = 'pcs'


class OAuthProvider(StrEnum):
    """Enumeration of supported OAuth identity providers."""

    GOOGLE = 'GOOGLE'


MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
