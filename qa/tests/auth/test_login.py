import pytest

from wep_qa.clients.api_client import UnexpectedStatusCodeError
from wep_qa.constants import Error
from wep_qa.qa_models import User


def test_login__valid_user__logged_in(actions, created_user):
    response = actions.user.login_user(created_user)
    actions.assertion.check_login_response(response, created_user)


def test_login__not_regestred_user__error_raised(actions, user):
    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.login_user(user)

    actions.assertion.check_error_response(exc, Error.BAD_CREDENTIALS)


def test_login__wrong_password__error_raised(actions, created_user):
    user = User(email=created_user.email, password='wrong_password', username='User')

    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.login_user(user)

    actions.assertion.check_error_response(exc, Error.BAD_CREDENTIALS)
