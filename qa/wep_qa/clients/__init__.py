from settings import APP_URL, PROXY_URL
from wep_qa.clients.api_client import WepApiClient
from wep_qa.clients.proxy_client import WepProxyClient


class Clients:
    def __init__(self) -> None:
        self.api = WepApiClient(APP_URL)
        self.proxy = WepProxyClient(PROXY_URL)
