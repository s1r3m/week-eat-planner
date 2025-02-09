import pytest
from loguru import logger

from tests.conftest import EMAIL
from week_eat_planner.helpers import create_access_token, get_email_from_token, get_password_hash, verify_password


TOKEN_DATA = {"sub": EMAIL}
ENCODED_TOKEN = (
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ5YUB5YS5ldSIsImV4cCI6MTczOTE4MTk3OH0.'
    'DF-fx3RjWeZB0NVoGIjNbWKe6gHpPA0ZW8Yn4DnGJxA'
)
BAD_TOKEN = 'bad_token'
HASHED_PASSWORD = '$2b$12$Ut6AYZYJGgQuBLwoGY1cQOzzYtf2CEeDvj0Q/Rk.EOzD8Gu1kKeWG'
OTHER_HASH = '$2b$12$lq6H9Uj6.CXVBm2lYffICOZmnaIFalgOqEfgWBq5v7mh6Z1pZU28m'
PASSWORD = '123456'


def test_decode__valid_token__decoded_str():
    email = get_email_from_token(ENCODED_TOKEN)

    assert email == EMAIL


def test_decode__bad_token__error_raised():
    with pytest.raises(ValueError) as exc:
        get_email_from_token(BAD_TOKEN)

    assert str(exc.value) == 'Invalid token'


def test_encode__valid_str__encoded_token():
    token = create_access_token(TOKEN_DATA)
    logger.info(f'Created token: {token}')

    assert token


def test_get_password_hash__valid_string__hashed_password():
    hashed_password = get_password_hash(PASSWORD)

    assert hashed_password != PASSWORD


def test_verify_password__valid_hash__password_match():
    result = verify_password(PASSWORD, HASHED_PASSWORD)

    assert result


def test_verify_password__bad_hash__password_mismatch():
    result = verify_password(PASSWORD, OTHER_HASH)

    assert not result
