def test_register__valid_data__user_created(actions, user):
    response = actions.user.register_user(user)

    actions.assertion.check_register_user_response(response, user)
