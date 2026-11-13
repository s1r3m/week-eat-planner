from wep_qa.actions.assertion_actions import AssertionActions
from wep_qa.actions.user_actions import UserActions
from wep_qa.clients import Clients
from wep_qa.qa_models import Repo


class Actions:
    def __init__(self) -> None:
        self._clients = Clients()
        self._repo = Repo()

        self.assertion = AssertionActions(self._clients, self._repo)
        self.user = UserActions(self._clients, self._repo)

    def cleanup(self) -> None:
        for user in self._repo.users:
            assert user.id, 'User was not craeted properly'
            self._clients.proxy.delete_user(user_id=user.id)

        self._clients.proxy.check_db_isolation()
