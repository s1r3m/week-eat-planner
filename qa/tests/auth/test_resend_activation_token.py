import pytest

from wep_qa.clients.api_client import UnexpectedStatusCodeError
from wep_qa.constants import Error


def test_resend_activation_token__valid_user__token_sent(actions, auth_user):
    response = actions.user.resend_activation_token(auth_user)

    actions.assertion.check_resend_activation_token_response(response)
    actions.assertion.check_resend_activation_token(auth_user)


def test_resend_activation_token__no_auth_user__error_raised(actions, created_user):
    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.resend_activation_token(created_user)

    actions.assertion.check_error_response(exc, Error.NO_SESSION_IN_REQUEST)


def test_resend_activation_token__activated_user__error_raised(actions, activated_user):
    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.resend_activation_token(activated_user)

    actions.assertion.check_error_response(exc, Error.ALREADY_ACTIVATED_USER)
