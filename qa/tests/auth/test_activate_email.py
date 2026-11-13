import pytest

from wep_qa.clients.api_client import UnexpectedStatusCodeError
from wep_qa.constants import Error


def test_verify_email__new_user_registration_no_login__email_activated(actions, created_user):
    activation_token = created_user.activation_token
    response = actions.user.verify_user_email(created_user, activation_token)
    actions.assertion.check_verify_email_response(response)


def test_verify_email__logged_in_user__status_updated(actions, auth_user):
    activation_token = actions.user.get_activation_token(auth_user)

    response = actions.user.verify_user_email(auth_user, activation_token)

    actions.assertion.check_verify_email_response(response)
    actions.assertion.check_user(auth_user)


def test_verify_email__bad_token__error_raised(actions, created_user):
    bad_token = 'bad_token'

    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.verify_user_email(created_user, bad_token)

    actions.assertion.check_error_response(exc, Error.BAD_ACTIVATION_TOKEN)


def test_verify_email__used_token__error_raised(actions, activated_user):
    used_token = activated_user.activation_token

    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.verify_user_email(activated_user, used_token)

    actions.assertion.check_error_response(exc, Error.BAD_ACTIVATION_TOKEN)


def test_verify_email__old_valid_token__error_raised(actions, auth_user):
    activation_token = actions.user.get_activation_token(auth_user)
    actions.user.resend_activation_token(auth_user)

    with pytest.raises(UnexpectedStatusCodeError) as exc:
        actions.user.verify_user_email(auth_user, activation_token)

    actions.assertion.check_error_response(exc, Error.BAD_ACTIVATION_TOKEN)
