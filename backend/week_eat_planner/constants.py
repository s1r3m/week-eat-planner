"""Application-wide constants.

This module defines enumerations for application URLs and token types.
"""
from enum import StrEnum


class AppUrl(StrEnum):
    """Enumeration of API endpoint URLs."""
    AUTH_LOGIN = '/auth/login'
    AUTH_ME = '/auth/me'
    AUTH_SIGNUP = '/auth/signup'

    PING = '/ping'

    WEEKS = '/weeks'
    WEEKS_TPL = '/weeks/{week_id}'


class TokenType(StrEnum):
    """Enumeration of token types."""
    BEARER = 'bearer'
