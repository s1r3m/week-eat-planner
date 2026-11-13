from dataclasses import dataclass
from enum import Enum
from http import HTTPStatus

EMAIL = 'user@wep.com'
PASSWORD = 'S3cr3tPa$$'


@dataclass
class ErrorData:
    code: HTTPStatus
    detail: str


class Error(ErrorData, Enum):
    BAD_CREDENTIALS = HTTPStatus.UNAUTHORIZED, 'Could not validate credentials'
