import pytest

from wep_qa.clients.api_client import UnexpectedStatusCodeError
from wep_qa.constants import Error
from wep_qa.qa_models import User


@pytest.fixture
def not_regestered_user() -> User:
    return User(email='not@user.com', password='SomePas$123')


def test_login__not_regestred_user__error_raised(actions, not_regestered_user):
    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.login_user(not_regestered_user)

    actions.assertion.check_error_response(exc, Error.BAD_CREDENTIALS)
