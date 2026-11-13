from http import HTTPStatus

from httpx import Response
from pytest import ExceptionInfo

from wep_qa.actions.base_actions import BaseActions
from wep_qa.constants import Error
from wep_qa.qa_models import User


class AssertionActions(BaseActions):
    def check_ping_response(self, response: Response) -> None:
        assert response.text == 'pong'

    def check_error_response(self, exc: ExceptionInfo, error: Error) -> None:
        response: Response = exc.value.response
        assert response.status_code == error.code
        assert response.json() == {'detail': error.detail}

    def check_register_user_response(self, response: Response, user: User) -> None:
        assert response.status_code == HTTPStatus.CREATED
        assert response.json() == {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'is_email_verified': False,
            'avatar_url': None,
            'oauth_provider': None,
        }
