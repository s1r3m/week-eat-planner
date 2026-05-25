import pytest

from tests.constants import HASHED_PASSWORD, PASSWORD, USER_ID
from week_eat_planner.exceptions import InvalidJwtTokenException, TokenExpiredException
from week_eat_planner.security.hashing import get_password_hash, verify_password
from week_eat_planner.security.token_provider import TokenProvider, get_user_id_from_token

BAD_TOKEN = 'bad_token'
OTHER_HASH = '$2b$12$lq6H9Uj6.CXVBm2lYffICOZmnaIFalgOqEfgWBq5v7mh6Z1pZU28m'
EXPIRED_HASH = (
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIiLCJleHAiOjE3NTg2NTY5NDR9'
    '.rI14bmWNH4Ev4IhRY8M7hak73cSQx3SWTt9CyMJ_mIk'
)


def test_decode__valid_token__decoded_str(encoded_token):
    user_id = get_user_id_from_token(encoded_token)
    assert user_id == USER_ID


@pytest.mark.parametrize(
    ('invalid_token', 'error_class'),
    [
        pytest.param(BAD_TOKEN, InvalidJwtTokenException, id='not_hash_token'),
        pytest.param('', InvalidJwtTokenException, id='no_user_id_token'),
        pytest.param(EXPIRED_HASH, TokenExpiredException, id='expired_token'),
    ],
)
def test_decode__invalid_token__error_raised(invalid_token, error_class):
    with pytest.raises(error_class) as exc:
        get_user_id_from_token(invalid_token)

    error = error_class()
    assert exc.value.status_code == error.status_code
    assert exc.value.detail == error.detail


def test_encode__valid_str__encoded_token():
    token = TokenProvider.create_access_token(USER_ID)
    assert token != USER_ID


def test_get_password_hash__valid_string__hashed_password():
    hashed_password = get_password_hash(PASSWORD)
    assert hashed_password != PASSWORD


def test_verify_password__valid_hash__password_match():
    result = verify_password(PASSWORD, HASHED_PASSWORD)
    assert result


def test_verify_password__bad_hash__password_mismatch():
    result = verify_password(PASSWORD, OTHER_HASH)
    assert not result


def test_create_refresh_token__always__token_generated():
    token = TokenProvider.create_refresh_token()
    assert token


def test_create_refresh_token__second_call__other_token_generated():
    token_1 = TokenProvider.create_refresh_token()
    token_2 = TokenProvider.create_refresh_token()
    assert token_1 != token_2


def test_hash_refresh_token__valid_token__token_hashed():
    token = TokenProvider.create_refresh_token()
    hash_token = TokenProvider.hash_refresh_token(token)
    assert hash_token != token


def test_hash_refresh_token__other_token__other_hash():
    token_1 = TokenProvider.create_refresh_token()
    token_2 = TokenProvider.create_refresh_token()
    hash_token_1 = TokenProvider.hash_refresh_token(token_1)

    hash_token_2 = TokenProvider.hash_refresh_token(token_2)

    assert hash_token_1 != hash_token_2
