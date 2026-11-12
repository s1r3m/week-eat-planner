"""Generate opaque session tokens and hash them for database storage."""

import hashlib
import secrets


class TokenProvider:
    """Factory for creating and hashing session tokens."""

    @classmethod
    def create_token(cls) -> str:
        """Generate a cryptographically random, URL-safe session token.

        Returns:
            A URL-safe token generated from 32 random bytes.
        """
        return secrets.token_urlsafe(32)

    @classmethod
    def get_token_hash(cls, token: str) -> str:
        """Hash an opaque session token using SHA-256 for storage and lookup.

        Args:
            token: Plain-text session token.

        Returns:
            The hexadecimal SHA-256 digest of the UTF-8 encoded token.
        """
        digest = hashlib.sha256(token.encode('utf-8')).hexdigest()
        return digest
