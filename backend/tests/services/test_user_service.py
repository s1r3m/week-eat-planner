import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from week_eat_planner.security.token_provider import TokenProvider
from week_eat_planner.services.user_service import UserService


@pytest.fixture
def mocked_user_service(mocked_session: AsyncSession) -> UserService:
    return UserService(mocked_session)


@pytest.fixture
def other_encoded_token() -> str:
    return TokenProvider.create_access_token('other_email@test.com')


async def test_get_user__user_exists_valid_token__user_returned(
    mocker, mocked_session, mocked_user_service, encoded_token, db_user
):
    scalars_mock = mocker.MagicMock(return_value=db_user)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    user = await mocked_user_service.get_user_by_token(encoded_token)

    assert user.id == db_user.id
    assert user.email == db_user.email


async def test_get_user__user_exists_invalid_token__none_returned(
    mocker, mocked_session, mocked_user_service, other_encoded_token, db_user
):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    user = await mocked_user_service.get_user_by_token(other_encoded_token)

    assert user is None


async def test_get_user__user_not_exists_valid_token__none_returned(
    mocker, mocked_session, mocked_user_service, encoded_token
):
    scalars_mock = mocker.MagicMock(return_value=None)
    mocked_session.execute.return_value = mocker.AsyncMock(scalar_one_or_none=scalars_mock)

    user = await mocked_user_service.get_user_by_token(encoded_token)

    assert user is None
