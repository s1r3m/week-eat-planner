from typing import Protocol, cast
from xmlrpc.client import ServerProxy

import allure


class _WepProxy(Protocol):
    def remove_user(self, user_id: str) -> bool: ...
    def check_db_isolation(self) -> None: ...


class WepProxyClient:
    def __init__(self, url: str) -> None:
        self._client = cast(_WepProxy, ServerProxy(url, allow_none=True, use_builtin_types=True))

    def check_db_isolation(self) -> None:
        self._client.check_db_isolation()

    @allure.step
    def delete_user(self, *, user_id: str) -> bool:
        return self._client.remove_user(user_id)
