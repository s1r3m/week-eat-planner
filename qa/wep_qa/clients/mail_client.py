from enum import StrEnum

import allure
from httpx import Client

ACTIVATION_SUBJECT = 'Welcome to Week Eat Planner'


class MailUrl(StrEnum):
    SEARCH = '/api/v1/search'


class WepMailClient:
    def __init__(self, url: str) -> None:
        self._client = Client(base_url=url)

    @allure.step
    def get_activation_token(self, email: str) -> str:
        response = self._client.get(MailUrl.SEARCH, params={'query': f'to:{email}'})
        body = response.json()
        messages = body['messages']
        filtered_messages = [msg for msg in messages if msg['Subject'] == ACTIVATION_SUBJECT]
        if not filtered_messages:
            raise ValueError(f'No emails for {email}')

        _, token = filtered_messages[0]['Snippet'].split(':')
        return token.strip()
