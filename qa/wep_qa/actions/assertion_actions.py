from httpx import Response
from pytest import ExceptionInfo

from wep_qa.actions.base_actions import BaseActions
from wep_qa.constants import Error, Header
from wep_qa.qa_models import User
from wep_qa.utils import parse_response_header


class AssertionActions(BaseActions):
    def check_ping_response(self, response: Response) -> None:
        assert response.text == 'pong'

    def check_error_response(self, exc: ExceptionInfo, error: Error) -> None:
        response: Response = exc.value.response
        assert response.status_code == error.code
        assert response.json() == {'detail': error.detail}

    def check_register_user_response(self, response: Response, user: User) -> None:
        self._check_user_response(response, user)

    def check_login_response(self, response: Response, user: User) -> None:
        assert Header.AUTH_SESSION in response.headers.get(Header.SET_COOKIE)
        self._check_user_response(response, user)

    def _check_user_response(self, response: Response, user: User) -> None:
        assert response.json() == {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'is_email_verified': False,
            'avatar_url': None,
            'oauth_provider': None,
        }

    def check_logout_response(self, response: Response) -> None:
        assert not response.text
        cookies = parse_response_header(response, Header.SET_COOKIE)
        assert not cookies[Header.AUTH_SESSION]
        assert not response.cookies
