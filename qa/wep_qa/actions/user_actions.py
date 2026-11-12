from httpx import Response

from wep_qa.actions.base_actions import BaseActions
from wep_qa.qa_models import User


class UserActions(BaseActions):
    def ping(self) -> Response:
        return self._clients.api.get_ping()

    def register_user(self, user: User) -> Response:
        return self._clients.api.post_register(email=user.email, password=user.password)

    def login_user(self, user: User) -> Response:
        return self._clients.api.post_login(email=user.email, password=user.password)
