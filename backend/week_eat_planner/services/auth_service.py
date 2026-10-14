"""Service layer for authentication and user registration logic."""

from datetime import UTC, datetime, timedelta

from httpx import AsyncClient
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.api.schemas import Email, GoogleCode, UserCreate, UserFilter, UserLogin, UserSession
from week_eat_planner.clients.google_auth_client import GoogleAuthClient
from week_eat_planner.config import settings
from week_eat_planner.db.dao import SessionDAO, UserDAO
from week_eat_planner.db.models import Session, User
from week_eat_planner.exceptions import (
    InvalidCredentialsException,
    OAuthAccountException,
    PasswordAccountException,
    UserAlreadyExistsException,
)
from week_eat_planner.security.hashing import get_password_hash, verify_password
from week_eat_planner.security.token_provider import TokenProvider


class AuthService:
    """Service for handling authentication-related business logic."""

    def __init__(self, session: AsyncSession) -> None:
        self._user_dao = UserDAO(session)
        self._session_dao = SessionDAO(session)

    async def register_user(self, user_data: UserCreate) -> User:
        """Registers a new user.

        Checks if a user with the given email already exists. If not, it hashes the
        password and creates a new user.

        Args:
            user_data: User data according to UserCreate.

        Returns:
            The created user object.

        Raises:
            UserAlreadyExistsException: If a user with the same email is already registered.
        """
        logger.info(f'New user registration attempt for {user_data.email=}')
        existing_user = await self._user_dao.find_one_or_none(Email(email=user_data.email))
        if existing_user:
            logger.error('User with that email already exists')
            raise UserAlreadyExistsException()

        user = User(
            email=str(user_data.email),
            username=user_data.username,
            hashed_password=get_password_hash(user_data.password),
        )
        created_user = await self._user_dao.add(user)
        logger.info('User registered successfully')

        return created_user

    async def login(self, user_data: UserLogin) -> str:
        """Logs a user in.

        Validates user credentials and returns access and refresh tokens upon success.

        Args:
            username: The user's email.
            password: The user's password.

        Returns:
            A session token.

        Raises:
            InvalidEmailException: If the email format is invalid.
            InvalidCredentialsException: If the user is not registered or the password is incorrect.
        """
        logger.info(f'Login attempt for user: {user_data.email}')
        db_user = await self._user_dao.find_one_or_none(Email(email=user_data.email))
        if db_user and not db_user.hashed_password:
            logger.error('OAuth account attempted password login')
            raise OAuthAccountException()

        if not (db_user and db_user.hashed_password and verify_password(user_data.password, db_user.hashed_password)):
            logger.error('Invalid credentials')
            raise InvalidCredentialsException()

        token = await self._generate_session_token(db_user)

        logger.info('User logged in successfully')
        return token

    async def login_with_google(self, data: GoogleCode, httpx_client: AsyncClient) -> str:
        """Authenticates a user via Google OAuth 2.0 authorization code flow.

        Exchanges the authorization code for verified user identity, then either
        logs in an existing OAuth user or creates a new account. Raises an error
        if the email is already registered with a password.

        Args:
            data: The authorization code payload received from the Google consent screen.
            httpx_client: An async HTTP client passed to the Google OAuth client.

        Returns:
            A session token.

        Raises:
            PasswordAccountException: If the email from Google is already registered
                with a password account.
            OAuthAccountException: If the email was used in some other OAuth registration.
            OAuthInvalidCodeException: If Google rejects the authorization code.
            OAuthProviderException: If the Google token exchange or JWT verification fails.
        """
        logger.info('Google OAuth login attempt started')
        client = GoogleAuthClient(httpx_client)
        user_data = await client.get_oauth_user(data.code)
        db_user = await self._user_dao.find_one_or_none(
            UserFilter(oauth_provider=user_data.oauth_provider, oauth_id=user_data.oauth_id)
        )
        if not db_user:
            email_user = await self._user_dao.find_one_or_none(UserFilter(email=user_data.email))
            if email_user:
                if email_user.hashed_password:
                    logger.error('Email already has a password account')
                    raise PasswordAccountException()
                logger.error('Email is already registered via OAuth')
                raise OAuthAccountException()

            user = User(**user_data.model_dump(), is_email_verified=True)
            db_user = await self._user_dao.add(user)
            logger.info('Created new user via Google OAuth')
        else:
            logger.info('Existing Google OAuth user logged in')

        session_token = await self._generate_session_token(db_user)
        return session_token

    async def _generate_session_token(self, db_user: User) -> str:
        token = TokenProvider.get_session_token()
        hashed_token = TokenProvider.hash_token(token)
        now = datetime.now(UTC)
        auth_session = Session(
            user_id=db_user.id,
            hashed_token=hashed_token,
            last_used_at=now,
            expires_at=now + timedelta(days=settings.SESSION_TTL_DAYS),
        )

        await self._session_dao.add(auth_session)

        return token

    async def logout(self, auth_session: Session) -> None:
        """Logs out a user by revoking their session.

        Args:
            auth_session: The current session from the request.
        """
        logger.info(f'Logout attempt for user {auth_session.user.id}')

        await self._session_dao.delete(
            UserSession(user_id=auth_session.user.id, session_token=auth_session.hashed_token)
        )
        logger.info(f'User {auth_session.user.id} logged out successfully')
