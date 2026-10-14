"""Utility for creating and validating JWT and refresh tokens."""

import hashlib
import secrets


class TokenProvider:
    """Factory for creating and hashing session tokens."""

    @classmethod
    def hash_token(cls, token: str) -> str:
        """Hashes a refresh token using SHA256 for secure storage.

        Args:
            token: The plain-text refresh token.

        Returns:
            The hex digest of the hashed token.
        """
        digest = hashlib.sha256(token.encode('utf-8')).hexdigest()
        return digest

    @classmethod
    def get_session_token(cls) -> str:
        return secrets.token_urlsafe(32)
