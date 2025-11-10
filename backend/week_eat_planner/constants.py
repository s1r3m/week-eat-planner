"""Application-wide constants.

This module defines enumerations for application URLs and token types.
"""

from enum import StrEnum

REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'


class AppUrl(StrEnum):
    """Enumeration of API endpoint URLs."""

    AUTH_LOGIN = '/api/auth/login'
    AUTH_LOGOUT = '/api/auth/logout'
    AUTH_REFRESH = '/api/auth/refresh'
    AUTH_SIGNUP = '/api/auth/signup'

    PING = '/api/ping'

    RECIPES = '/api/recipes'
    RECIPES_TPL = '/api/recipes/{recipe_id}'

    WEEKS = '/api/weeks'
    WEEKS_TPL = '/api/weeks/{week_id}'
    WEEK_SLOTS_TPL = '/api/weeks/{week_id}/slots'

    USER = '/api/user'


class TokenType(StrEnum):
    """Enumeration of token types."""

    BEARER = 'bearer'
