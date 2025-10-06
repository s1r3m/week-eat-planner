from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'])


def get_password_hash(password: str) -> str:
    """Hashes a plain text password.

    Args:
        password: The plain text password to hash.

    Returns:
        The hashed password as a string.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a hashed password.

    Args:
        plain_password: The plain text password to verify.
        hashed_password: The hashed password to compare against.

    Returns:
        True if the passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)
