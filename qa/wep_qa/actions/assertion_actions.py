from httpx import Response
from pytest import ExceptionInfo

from wep_qa.actions.base_actions import BaseActions
from wep_qa.constants import Error


class AssertionActions(BaseActions):
    def check_ping_response(self, response: Response) -> None:
        assert response.text == 'pong'

    def check_error_response(self, exc: ExceptionInfo, error: Error) -> None:
        response: Response = exc.value.response
        assert response.status_code == error.code
        assert response.json() == {'detail': error.detail}
