from email.message import EmailMessage

from aiosmtplib import send

from week_eat_planner.config import settings
from week_eat_planner.db.models.user import User


class EmailService:
    """Send account activation and password reset emails."""

    def __init__(self) -> None:
        """Initialize the email service."""

    async def send_activation_email(self, user: User, activation_token: str) -> None:
        """Send an account activation email containing the provided token.

        Args:
            user: Account receiving the activation email.
            activation_token: Plain-text token to include in the email.
        """

        message = EmailMessage()
        message['Subject'] = 'Welcome to Week Eat Planner'
        message['To'] = user.email
        message.set_content(f'Hello, {user.username}! Thanks for registration! The token: {activation_token}')

        await self._send_email(message)

    async def send_password_reset_email(self) -> None:
        """Send a password reset email."""

    async def _send_email(self, message: EmailMessage) -> None:
        """Send an email through the configured SMTP server.

        Args:
            message: Email message to send.
        """
        message['From'] = settings.EMAIL_FROM

        await send(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT)
