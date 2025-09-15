from enum import StrEnum

AUTH_PREFIX = '/auth'
AUTH_LOGIN = '/login'
AUTH_ME = '/me'
AUTH_SIGNUP = '/signup'

PING = '/ping'


class TokenType(StrEnum):
    BEARER = 'bearer'
