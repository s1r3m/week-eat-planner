"""Security utilities for password hashing."""

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

ph = PasswordHasher()


def get_password_hash(password: str) -> str:
    """Hashes a plain text password.

    Args:
        password: The plain text password to hash.

    Returns:
        The hashed password as a string.
    """
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a hashed password.

    Args:
        plain_password: The plain text password to verify.
        hashed_password: The hashed password to compare against.

    Returns:
        True if the passwords match, False otherwise.
    """
    try:
        ph.verify(hashed_password, plain_password)
    except InvalidHashError, VerifyMismatchError:
        return False

    return True
