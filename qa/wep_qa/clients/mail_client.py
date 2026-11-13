from enum import StrEnum

from httpx import Client

ACTIVATION_SUBJECT = 'Welcome to Week Eat Planner'


class MailUrl(StrEnum):
    MESSAGES = '/api/v1/messages'


class WepMailClient:
    def __init__(self, url: str) -> None:
        self._client = Client(base_url=url)

    def get_activation_token(self, email: str) -> str:
        response = self._client.get(MailUrl.MESSAGES, params={'to': email, 'limit': 1})
        body = response.json()
        messages = body['messages']
        filtered_messages = [msg for msg in messages if msg['Subject'] == ACTIVATION_SUBJECT]
        if not filtered_messages:
            return ''

        _, token = filtered_messages[0]['Snippet'].split(':')
        return token.strip()
