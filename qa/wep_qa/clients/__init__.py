from settings import APP_URL, MAIL_URL, PROXY_URL
from wep_qa.clients.api_client import WepApiClient
from wep_qa.clients.mail_client import WepMailClient
from wep_qa.clients.proxy_client import WepProxyClient


class Clients:
    def __init__(self) -> None:
        self.api = WepApiClient(APP_URL)
        self.mail = WepMailClient(MAIL_URL)
        self.proxy = WepProxyClient(PROXY_URL)
