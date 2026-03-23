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
    RECIPES_TPL = '/recipes/{recipe_id}'

    WEEKS = '/weeks'
    WEEKS_TPL = '/weeks/{week_id}'
    WEEK_SLOTS_TPL = '/weeks/{week_id}/slots'

    USER = '/user'


class TokenType(StrEnum):
    """Enumeration of token types."""

    BEARER = 'bearer'


class Unit(StrEnum):
    CANS = 'cans'
    GRAM = 'g'
    MILILITERS = 'ml'
    PIECES = 'pcs'
