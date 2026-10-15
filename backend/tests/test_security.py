from tests.constants import HASHED_PASSWORD, PASSWORD
from week_eat_planner.security.hashing import get_password_hash, verify_password

BAD_TOKEN = 'bad_token'
OTHER_HASH = '$2b$12$lq6H9Uj6.CXVBm2lYffICOZmnaIFalgOqEfgWBq5v7mh6Z1pZU28m'


def test_get_password_hash__valid_string__hashed_password():
    hashed_password = get_password_hash(PASSWORD)
    assert hashed_password != PASSWORD


def test_verify_password__valid_hash__password_match():
    result = verify_password(PASSWORD, HASHED_PASSWORD)
    assert result


def test_verify_password__bad_hash__password_mismatch():
    result = verify_password(PASSWORD, OTHER_HASH)
    assert not result
