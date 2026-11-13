from httpx import Response
from pytest import ExceptionInfo

from wep_qa.actions.base_actions import BaseActions
from wep_qa.constants import AUTH_SESSION, Error, Header
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
        set_cookies = parse_response_header(response, Header.SET_COOKIE)
        assert set_cookies.get(AUTH_SESSION)
        self._check_user_response(response, user)

    def check_logout_response(self, response: Response) -> None:
        assert not response.text
        set_cookies = parse_response_header(response, Header.SET_COOKIE)
        assert not set_cookies[AUTH_SESSION]
        assert not response.cookies

    def check_verify_email_response(self, response: Response) -> None:
        self._check_successful_response(response)

    def check_resend_activation_token_response(self, response: Response) -> None:
        self._check_successful_response(response)

    def check_resend_activation_token(self, user: User) -> None:
        token = self._clients.mail.get_activation_token(user.email)
        assert token != user.activation_token

    def _check_successful_response(self, response: Response) -> None:
        assert response.json() == {'status': 'success'}

    def check_user(self, user: User) -> None:
        response = self._clients.api.get_user(user.session)
        self._check_user_response(response, user)

    def _check_user_response(self, response: Response, user: User) -> None:
        assert response.json() == {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'is_email_verified': user.is_email_activated,
            'avatar_url': None,
            'oauth_provider': None,
        }
