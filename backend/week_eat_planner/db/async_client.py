import httpx


class HttpClientManager:
    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient()
        return self._client

    async def close_client(self) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None


http_client_manager = HttpClientManager()
