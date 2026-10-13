from wep_qa.clients import Clients


class BaseActions:
    def __init__(self, clients: Clients) -> None:
        self._clients = clients
