import pytest
from fastapi import HTTPException

from tests.conftest import EMAIL
from week_eat_planner.exceptions import InvalidJwtToken, NoEmailInToken, TokenExpiredException
from week_eat_planner.helpers import (
    create_access_token,
    generate_refresh_token,
    get_email_from_token,
    get_password_hash,
    hash_refresh_token,
    verify_hash_equals,
    verify_password,
)

BAD_TOKEN = 'bad_token'
HASHED_PASSWORD = '$2b$12$LWMbERKL6XH7CzFNXR4tOO8wsxOCYzQBLpqH4qoTlZvy1s4riAVNu'
OTHER_HASH = '$2b$12$lq6H9Uj6.CXVBm2lYffICOZmnaIFalgOqEfgWBq5v7mh6Z1pZU28m'
EXPIRED_HASH = (
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIiLCJleHAiOjE3NTg2NTY5NDR9'
    '.rI14bmWNH4Ev4IhRY8M7hak73cSQx3SWTt9CyMJ_mIk'
)
PASSWORD = '123456'


def test_decode__valid_token__decoded_str(encoded_token):
    email = get_email_from_token(encoded_token)
    assert email == EMAIL


@pytest.mark.parametrize(
    'invalid_token, error',
    [
        pytest.param(BAD_TOKEN, InvalidJwtToken, id='not_hash_token'),
        pytest.param(create_access_token(''), NoEmailInToken, id='no_email_token'),
        pytest.param(EXPIRED_HASH, TokenExpiredException, id='expired_token'),
    ],
)
def test_decode__invalid_token__error_raised(invalid_token, error):
    with pytest.raises(HTTPException) as exc:
        get_email_from_token(invalid_token)

    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


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


def test_generate_refresh_token__always__token_generated():
    token = generate_refresh_token()
    assert token


def test_generate_refresh_token__second_call__other_token_generated():
    token_1 = generate_refresh_token()
    token_2 = generate_refresh_token()
    assert token_1 != token_2


def test_hash_refresh_token__valid_token__token_hashed():
    token = generate_refresh_token()
    hash_token = hash_refresh_token(token)
    assert hash_token != token


def test_hash_refresh_token__other_token__other_hash():
    token_1 = generate_refresh_token()
    token_2 = generate_refresh_token()
    hash_token_1 = hash_refresh_token(token_1)

    hash_token_2 = hash_refresh_token(token_2)

    assert hash_token_1 != hash_token_2


def test_verify_hash_equals__same_token__return_true():
    token = generate_refresh_token()
    hash_1 = hash_refresh_token(token)
    hash_2 = hash_refresh_token(token)

    result = verify_hash_equals(hash_1, hash_2)

    assert result is True


def test_verify_hash_equals__different_tokens__return_false():
    token_1 = generate_refresh_token()
    token_2 = generate_refresh_token()
    hash_token_1 = hash_refresh_token(token_1)
    hash_token_2 = hash_refresh_token(token_2)

    result = verify_hash_equals(hash_token_1, hash_token_2)

    assert result is False
