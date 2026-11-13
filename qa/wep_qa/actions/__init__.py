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
            if not (user.id and self._clients.proxy.delete_user(user_id=user.id)):
                raise ValueError(f'User with email {user.email} was not created')

        self._clients.proxy.check_db_isolation()
