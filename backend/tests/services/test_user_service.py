from unittest.mock import AsyncMock

import pytest
from fastapi import status

from week_eat_planner.api.schemas.common import RecordId
from week_eat_planner.api.schemas.user import UserUpdate
from week_eat_planner.constants import OAuthProvider
from week_eat_planner.exceptions import OAuthAccountException, UserNotFoundException
from week_eat_planner.security.hashing import get_password_hash
from week_eat_planner.services.user_service import UserService

NEW_PASSWORD = 'new_password'
OLD_PASSWORD = 'old_password'


@pytest.fixture
def mocked_user_dao(mocker) -> AsyncMock:
    user_dao_mock = mocker.AsyncMock()
    mocker.patch('week_eat_planner.services.user_service.UserDAO', return_value=user_dao_mock)
    return user_dao_mock


async def test_get_user__user_exists__user_returned(mocked_user_dao, mocked_session, db_user):
    mocked_user_dao.find_one_or_none_by_id.return_value = db_user
    user = await UserService(mocked_session).get_user(db_user.id)
    assert user == db_user


async def test_get_user__user_not_found__error_raised(mocked_user_dao, mocked_session, user_read):
    mocked_user_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(UserNotFoundException) as exc:
        await UserService(mocked_session).get_user(user_read.id)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'User {user_read.id} was not found!'


async def test_update_user__username_provided__updated_user_returned(
    mocked_user_dao, mocked_session, user_read, db_user
):
    user_update = UserUpdate(username='new_name')
    mocked_user_dao.find_one_or_none_by_id.return_value = db_user
    mocked_user_dao.update.return_value = db_user

    result = await UserService(mocked_session).update_user(user_read, user_update)

    assert result == db_user
    mocked_user_dao.update.assert_awaited_once_with(RecordId(id=user_read.id), user_update)


async def test_update_user__user_not_found__error_raised(mocked_user_dao, mocked_session, user_read):
    user_update = UserUpdate(username='new_name')
    mocked_user_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(UserNotFoundException) as exc:
        await UserService(mocked_session).update_user(user_read, user_update)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'User {user_read.id} was not found!'


async def test_change_password__user_removed__error_raised(mocked_user_dao, mocked_session, user_read):
    mocked_user_dao.find_one_or_none_by_id.return_value = None

    with pytest.raises(UserNotFoundException) as exc:
        await UserService(mocked_session).change_password(user_read, OLD_PASSWORD, NEW_PASSWORD)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == f'User {user_read.id} was not found!'


async def test_change_password__oauth_provider_user__error_raised(mocked_user_dao, mocked_session, user_read, db_user):
    db_user.hashed_password = None
    db_user.oauth_provider = OAuthProvider.GOOGLE
    mocked_user_dao.find_one_or_none_by_id.return_value = db_user

    with pytest.raises(OAuthAccountException) as exc:
        await UserService(mocked_session).change_password(user_read, OLD_PASSWORD, NEW_PASSWORD)

    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert exc.value.detail == 'This email is registered via a social login'


async def test_change_password__valid_data__password_changed(mocked_user_dao, mocked_session, user_read, db_user):
    db_user.hashed_password = get_password_hash(OLD_PASSWORD)  # Set the right password
    mocked_user_dao.find_one_or_none_by_id.return_value = db_user
    mocked_user_dao.update.return_value = db_user

    await UserService(mocked_session).change_password(user_read, OLD_PASSWORD, NEW_PASSWORD)

    mocked_user_dao.update.assert_awaited_once()
