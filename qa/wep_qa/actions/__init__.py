from wep_qa.actions.assertion_actions import AssertionActions
from wep_qa.actions.user_actions import UserActions
from wep_qa.clients import Clients


class Actions:
    def __init__(self) -> None:
        clients = Clients()
        self.user = UserActions(clients)
        self.assertion = AssertionActions(clients)
