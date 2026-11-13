import pytest

from wep_qa.clients.api_client import UnexpectedStatusCodeError
from wep_qa.constants import Error


def test_login__not_regestred_user__error_raised(actions, user):
    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.login_user(user)

    actions.assertion.check_error_response(exc, Error.BAD_CREDENTIALS)
