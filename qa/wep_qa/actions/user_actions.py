from httpx import Response

from wep_qa.actions.base_actions import BaseActions
from wep_qa.constants import AUTH_SESSION, Header
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
        session = headers.get(AUTH_SESSION)
        if not session:
            raise ValueError(f'No session in response: {headers}')

        user.session = session
        return response

    def logout_user(self, user: User) -> Response:
        response = self._clients.api.post_logout(user.session)
        return response

    def get_activation_token(self, user: User) -> str:
        return self._clients.mail.get_activation_token(user.email)

    def verify_user_email(self, user: User, token: str) -> Response:
        response = self._clients.api.activate_email(token)
        user.is_email_activated = True
        return response
