"""Application-wide constants.

This module defines enumerations for application URLs and token types.
"""

from enum import StrEnum

REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'


class AppUrl(StrEnum):
    """Enumeration of API endpoint URLs."""

    AUTH_LOGIN = '/auth/login'
    AUTH_LOGOUT = '/auth/logout'
    AUTH_ME = '/auth/me'
    AUTH_REFRESH = '/auth/refresh'
    AUTH_SIGNUP = '/auth/signup'

    PING = '/ping'

    WEEKS = '/weeks'
    WEEKS_TPL = '/weeks/{week_id}'


class TokenType(StrEnum):
    """Enumeration of token types."""

    BEARER = 'bearer'
