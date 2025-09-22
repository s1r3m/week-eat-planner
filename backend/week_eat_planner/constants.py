from enum import StrEnum


class AppUrl(StrEnum):
    AUTH_LOGIN = f'/auth/login'
    AUTH_ME = f'/auth/me'
    AUTH_SIGNUP = f'/auth/signup'

    PING = '/ping'

    WEEKS = '/weeks'
    WEEKS_TPL = '/weeks/{week_id}'


class TokenType(StrEnum):
    BEARER = 'bearer'
