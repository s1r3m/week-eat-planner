from httpx import Response

from wep_qa.actions.base_actions import BaseActions


class UserActions(BaseActions):
    def ping(self) -> Response:
        return self._clients.api.get_ping()
