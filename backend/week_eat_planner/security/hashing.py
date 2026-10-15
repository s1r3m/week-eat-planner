"""Security utilities for password hashing."""

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

ph = PasswordHasher()


def get_password_hash(password: str) -> str:
    """Hash a plain-text password using Argon2 with the configured hasher defaults.

    Args:
        password: Plain-text password to hash.

    Returns:
        An encoded Argon2 password hash, including its salt and parameters.
    """
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against an encoded Argon2 hash.

    Args:
        plain_password: Plain-text password to verify.
        hashed_password: Encoded Argon2 hash to compare against.

    Returns:
        True if verification succeeds. Return False for a password mismatch or
        an invalid hash format.

    Raises:
        VerificationError: If Argon2 verification fails for a reason other than
            a password mismatch or an invalid hash format.
    """
    try:
        ph.verify(hashed_password, plain_password)
    except InvalidHashError, VerifyMismatchError:
        return False

    return True
