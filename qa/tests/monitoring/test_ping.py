from wep_qa.actions import Actions


def test_ping__always__return_pong(actions: Actions):
    response = actions.user.ping()
    actions.assertion.check_ping_response(response)
