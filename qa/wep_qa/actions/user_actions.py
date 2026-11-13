from httpx import Response

from wep_qa.actions.base_actions import BaseActions
from wep_qa.constants import Header
from wep_qa.qa_models import User
from wep_qa.utils import parse_response_header


class UserActions(BaseActions):
    def ping(self) -> Response:
        return self._clients.api.get_ping()

    def register_user(self, user: User) -> Response:
        response = self._clients.api.post_register(email=user.email, password=user.password, username=user.username)
        body = response.json()
        user.id = body['id']

        self._repo.users.add(user)
        return response

    def login_user(self, user: User) -> Response:
        response = self._clients.api.post_login(email=user.email, password=user.password)
        headers = parse_response_header(response, Header.SET_COOKIE)
        session = headers.get(Header.AUTH_SESSION)
        if not session:
            raise ValueError(f'No session in response: {headers}')

        user.session = session
        return response

    def logout_user(self, user: User) -> Response:
        response = self._clients.api.post_logout(user.session)
        return response
