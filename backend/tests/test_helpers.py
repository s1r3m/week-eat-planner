import pytest

from tests.conftest import EMAIL
from week_eat_planner.helpers import (
    create_access_token,
    get_email_from_token,
    get_password_hash,
    verify_password,
)

BAD_TOKEN = 'bad_token'
HASHED_PASSWORD = '$2b$12$LWMbERKL6XH7CzFNXR4tOO8wsxOCYzQBLpqH4qoTlZvy1s4riAVNu'
OTHER_HASH = '$2b$12$lq6H9Uj6.CXVBm2lYffICOZmnaIFalgOqEfgWBq5v7mh6Z1pZU28m'
PASSWORD = '123456'


def test_decode__valid_token__decoded_str(encoded_token):
    email = get_email_from_token(encoded_token)
    assert email == EMAIL


def test_decode__bad_token__error_raised():
    with pytest.raises(ValueError) as exc:
        get_email_from_token(BAD_TOKEN)

    assert str(exc.value) == 'Invalid token'


def test_encode__valid_str__encoded_token():
    token = create_access_token(EMAIL)
    assert token != EMAIL


def test_get_password_hash__valid_string__hashed_password():
    hashed_password = get_password_hash(PASSWORD)
    assert hashed_password != PASSWORD


def test_verify_password__valid_hash__password_match():
    result = verify_password(PASSWORD, HASHED_PASSWORD)
    assert result


def test_verify_password__bad_hash__password_mismatch():
    result = verify_password(PASSWORD, OTHER_HASH)
    assert not result
