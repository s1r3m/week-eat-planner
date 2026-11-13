def test_logout__logged_in_user__session_removed(actions, auth_user):
    response = actions.user.logout_user(auth_user)
    actions.assertion.check_logout_response(response)


def test_logout__not_logged_in_user__no_errors(actions, user):
    response = actions.user.logout_user(user)
    actions.assertion.check_logout_response(response)
