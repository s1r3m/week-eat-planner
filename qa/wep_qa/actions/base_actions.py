from wep_qa.clients import Clients
from wep_qa.qa_models import Repo


class BaseActions:
    def __init__(self, clients: Clients, repo: Repo) -> None:
        self._clients = clients
        self._repo = repo
