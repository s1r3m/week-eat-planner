from dataclasses import dataclass
from enum import Enum, StrEnum
from http import HTTPStatus

EMAIL = 'user@wep.com'
PASSWORD = 'S3cr3tPa$$'
AUTH_SESSION = 'wep_session'


@dataclass
class ErrorData:
    code: HTTPStatus
    detail: str


class Error(ErrorData, Enum):
    BAD_CREDENTIALS = HTTPStatus.UNAUTHORIZED, 'Could not validate credentials'
    EMAIL_IS_TAKEN = HTTPStatus.CONFLICT, 'User already exists'


class Header(StrEnum):
    COOKIE = 'Cookie'
    SET_COOKIE = 'set-cookie'
