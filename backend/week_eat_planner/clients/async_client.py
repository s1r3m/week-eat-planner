"""Async HTTP client management."""

import httpx


class HttpClientManager:
    """Manages the lifecycle of a shared httpx.AsyncClient instance."""

    def __init__(self) -> None:
        """Initializes the manager with no active client."""
        self._client: httpx.AsyncClient | None = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Provides access to the httpx.AsyncClient instance.

        The client is created on first access.

        Returns:
            The httpx.AsyncClient instance.
        """
        if self._client is None:
            self._client = httpx.AsyncClient()
        return self._client

    async def close_client(self) -> None:
        """Asynchronously closes the httpx.AsyncClient if it has been created."""
        if self._client:
            await self._client.aclose()
            self._client = None


http_client_manager = HttpClientManager()
