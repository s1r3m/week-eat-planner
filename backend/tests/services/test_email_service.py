from email.message import EmailMessage
from unittest.mock import AsyncMock

import pytest

from week_eat_planner.config import settings
from week_eat_planner.services.email_service import EmailService


@pytest.fixture
def mocked_smtp_send(mocker) -> AsyncMock:
    smtp_send_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.email_service.send', new=smtp_send_mock)

    return smtp_send_mock


async def test_send_activation_email__valid_user__email_sent(mocked_smtp_send, db_user):
    activation_token = 'activation-token'

    await EmailService().send_activation_email(db_user, activation_token)

    mocked_smtp_send.assert_awaited_once()
    message = mocked_smtp_send.await_args.args[0]
    assert message['Subject'] == 'Welcome to Week Eat Planner'
    assert message['To'] == db_user.email
    assert message['From'] == settings.EMAIL_FROM
    assert message.get_content() == (
        f'Hello, {db_user.username}! Thanks for registration! The token: {activation_token}\n'
    )
    mocked_smtp_send.assert_awaited_once_with(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT)


async def test_send_email__message__smtp_send_invoked(mocked_smtp_send):
    message = EmailMessage()

    await EmailService()._send_email(message)

    assert message['From'] == settings.EMAIL_FROM
    mocked_smtp_send.assert_awaited_once_with(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT)
