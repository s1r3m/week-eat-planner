from enum import StrEnum


class CookieToken(StrEnum):
    ACCESS = 'user_access_token'
    REFRESH = 'user_refresh_token'
