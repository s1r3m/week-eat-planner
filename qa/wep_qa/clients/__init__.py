from settings import APP_URL

from wep_qa.clients.api_client import WepApiClient


class Clients:
    def __init__(self) -> None:
        self.api = WepApiClient(APP_URL)
