import pytest

from wep_qa.clients.api_client import UnexpectedStatusCodeError
from wep_qa.constants import Error


def test_register__valid_data__user_created(actions, user):
    response = actions.user.register_user(user)
    actions.assertion.check_register_user_response(response, user)


def test_register__email_taken__error_raised(actions, created_user):
    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.register_user(created_user)

    actions.assertion.check_error_response(exc, Error.EMAIL_IS_TAKEN)
