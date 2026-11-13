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
    ALREADY_ACTIVATED_USER = HTTPStatus.CONFLICT, 'A user is already activated'
    BAD_CREDENTIALS = HTTPStatus.UNAUTHORIZED, 'Could not validate credentials'
    BAD_ACTIVATION_TOKEN = HTTPStatus.CONFLICT, 'Bad activation token'
    EMAIL_IS_TAKEN = HTTPStatus.CONFLICT, 'User already exists'
    NO_SESSION_IN_REQUEST = HTTPStatus.UNAUTHORIZED, 'No session token in request'


class Header(StrEnum):
    COOKIE = 'Cookie'
    SET_COOKIE = 'set-cookie'
