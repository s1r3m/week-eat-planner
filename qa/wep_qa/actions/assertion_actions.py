from httpx import Response

from wep_qa.actions.base_actions import BaseActions


class AssertionActions(BaseActions):
    def check_ping_response(self, response: Response) -> None:
        assert response.text == 'pong'
