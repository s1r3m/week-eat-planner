from unittest.mock import AsyncMock

import pytest
from fastapi import status

from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.api.schemas.user import UserUpdate
from week_eat_planner.constants import OAuthProvider
from week_eat_planner.exceptions import InvalidCredentialsException, OAuthAccountException, UserRemovedException
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.security.hashing import get_password_hash
from week_eat_planner.security.token_provider import TokenProvider
from week_eat_planner.services.user_service import UserService

NEW_PASSWORD = 'new_password'
OLD_PASSWORD = 'old_password'


@pytest.fixture
def mocked_user_dao(mocker) -> AsyncMock:
    user_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.user_service.UserDAO', return_value=user_dao_mock)
    return user_dao_mock


@pytest.fixture
def other_encoded_token() -> str:
    return TokenProvider.create_access_token(generate_uuid7())


async def test_get_user__user_exists__user_returned(mocked_user_dao, mocked_session, encoded_token, db_user):
    mocked_user_dao.find_one_or_none.return_value = db_user
    user = await UserService(mocked_session).get_user_by_token(encoded_token)
    assert user == db_user


async def test_get_user__user_not_exist__none_returned(mocked_user_dao, mocked_session, encoded_token):
    mocked_user_dao.find_one_or_none.return_value = None

    with pytest.raises(InvalidCredentialsException) as exc:
        await UserService(mocked_session).get_user_by_token(encoded_token)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Could not validate credentials'


async def test_get_user__not_active_user__error_raised(mocked_user_dao, mocked_session, encoded_token, db_user):
    db_user.is_active = False
    mocked_user_dao.find_one_or_none.return_value = db_user

    with pytest.raises(InvalidCredentialsException) as exc:
        await UserService(mocked_session).get_user_by_token(encoded_token)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Could not validate credentials'


async def test_update_user__username_provided__updated_user_returned(
    mocked_user_dao, mocked_session, user_read, db_user
):
    user_update = UserUpdate(username='new_name')
    mocked_user_dao.update.return_value = db_user

    result = await UserService(mocked_session).update_user(user_read, user_update)

    assert result == db_user
    mocked_user_dao.update.assert_awaited_once_with(RecordId(id=user_read.id), user_update)


async def test_change_password__user_removed__error_raised(mocked_user_dao, mocked_session, user_read):
    mocked_user_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(UserRemovedException) as exc:
        await UserService(mocked_session).change_password(user_read, OLD_PASSWORD, NEW_PASSWORD)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'User {user_read.id} was removed somehow!'


async def test_change_password__oauth_provider_user__error_raised(mocked_user_dao, mocked_session, user_read, db_user):
    db_user.hashed_password = None
    db_user.oauth_provider = OAuthProvider.GOOGLE
    mocked_user_dao.find_one_or_none_by_id.return_value = db_user

    with pytest.raises(OAuthAccountException) as exc:
        await UserService(mocked_session).change_password(user_read, OLD_PASSWORD, NEW_PASSWORD)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == 'This email is registered via a social login'


async def test_change_password__old_password_mismatch__error_raised(
    mocked_user_dao, mocked_session, user_read, db_user
):
    db_user.hashed_password = get_password_hash(NEW_PASSWORD)  # Set other password
    mocked_user_dao.find_one_or_none_by_id.return_value = db_user

    with pytest.raises(InvalidCredentialsException) as exc:
        await UserService(mocked_session).change_password(user_read, OLD_PASSWORD, NEW_PASSWORD)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc.value.detail == 'Old password does not match!'


async def test_change_password__valid_data__password_changed(mocked_user_dao, mocked_session, user_read, db_user):
    db_user.hashed_password = get_password_hash(OLD_PASSWORD)  # Set the right password
    mocked_user_dao.find_one_or_none_by_id.return_value = db_user
    mocked_user_dao.update.return_value = db_user

    await UserService(mocked_session).change_password(user_read, OLD_PASSWORD, NEW_PASSWORD)

    mocked_user_dao.update.assert_awaited_once()
