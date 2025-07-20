from wep_qa.clients.api_client import WepApiClient
from settings import APP_URL


class Clients:
    def __init__(self) -> None:
        self.api = WepApiClient(APP_URL)
