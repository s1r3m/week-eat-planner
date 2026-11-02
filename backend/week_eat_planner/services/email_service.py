from email.message import EmailMessage

from aiosmtplib import send

from week_eat_planner.config import settings
from week_eat_planner.db.models.user import User


class EmailService:
    """Email service that sends emails. AI will cover this."""

    def __init__(self) -> None:
        """Init method."""

    async def send_activation_email(self, user: User, activation_token: str) -> None:
        """Sends an email with activation code to the user."""

        message = EmailMessage()
        message['Subject'] = 'Welcome to Week Eat Planner'
        message['To'] = user.email
        message.set_content(f'Hello, {user.username}! Thanks for registration! The token: {activation_token}')

        await self._send_email(message)

    async def send_password_reset_email(self) -> None:
        """Sends an email with password reset instructions and codes."""

    async def _send_email(self, message: EmailMessage) -> None:
        """Sends the email to SMTP_HOST."""
        message['From'] = settings.EMAIL_FROM

        await send(message, hostname=settings.SMTP_HOST, port=settings.SMTP_PORT)
