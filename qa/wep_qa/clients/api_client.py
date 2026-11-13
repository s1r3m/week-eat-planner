from http import HTTPMethod, HTTPStatus

from httpx import Client, HTTPStatusError, Response
from loguru import logger

from wep_qa.constants import AUTH_SESSION


class UnexpectedStatusCodeError(HTTPStatusError):
    """Exception raised when the API returns an unexpected status code."""


class BaseApiClient:
    """Base class for API clients."""

    def __init__(self, base_url: str) -> None:
        """Initialize the API client.

        Args:
            base_url (str): The base URL for the API.
        """
        self.client = Client(base_url=base_url)
        self._base_url = base_url

    def _call(
        self,
        method: str,
        url: str,
        headers: dict[str, str] | None = None,
        json: dict | None = None,
        cookies: dict[str, str] | None = None,
        expected_status_code: HTTPStatus | None = None,
        raise_for_status: bool = True,
    ) -> Response:
        """Perform an HTTP request and validate the response status code.

        Args:
            method (str): The HTTP method (GET, POST, etc.).
            url (str): The URL to request.
            headers (dict): Optional request headers.
            json (dict): The optional json body that is sent with request.
            cookies (dict): Optional request cookies, merged with the client's cookie jar.
            expected_status_code (HTTPStatus): The status code expected from the API.
            raise_for_status (bool): Whether to call raise_for_status() on the response. Defaults to True.

        Returns:
            Response: The HTTP response object.

        Raises:
            UnexpectedStatusCodeError: If the response status code does not match expected_status_code.
            HTTPStatusError: If raise_for_status is True and the response has an error status code.
        """
        request = self.client.build_request(method, url, json=json, headers=headers, cookies=cookies)

        response = self.client.send(request)
        if expected_status_code and response.status_code != expected_status_code:
            err_msg = f'Unexpected status code: {response.status_code}, expected: {expected_status_code}'
            logger.error(f'{err_msg}: {response.text}')
            raise UnexpectedStatusCodeError(err_msg, request=request, response=response)

        # TODO: add json schema validation

        if raise_for_status:
            response.raise_for_status()

        return response


class WepApiClient(BaseApiClient):
    """Client for the WEP API."""

    PING = '/api/ping'

    AUTH_LOGIN = '/api/auth/login'
    AUTH_LOGOUT = '/api/auth/logout'
    AUTH_SIGNUP = '/api/auth/signup'

    def get_ping(self) -> Response:
        """Get the ping response from the API.

        Returns:
            Response: The HTTP response object.
        """
        return self._call(HTTPMethod.GET, url=self.PING, expected_status_code=HTTPStatus.OK)

    def post_login(self, email: str, password: str) -> Response:
        """Post a login request via API.

        Returns:
            Response: The HTTP response object.
        """
        return self._call(
            method=HTTPMethod.POST,
            url=self.AUTH_LOGIN,
            json={'email': email, 'password': password},
            expected_status_code=HTTPStatus.OK,
        )

    def post_register(self, email: str, password: str, username: str) -> Response:
        """Post the register request via API.

        Returns:
            Response: The HTTP response object.
        """
        return self._call(
            method=HTTPMethod.POST,
            url=self.AUTH_SIGNUP,
            json={'email': email, 'password': password, 'username': username},
            expected_status_code=HTTPStatus.CREATED,
        )

    def post_logout(self, session: str | None) -> Response:
        """Logs out the user via API.

        Returns:
            Response: The HTTP response object.
        """
        return self._call(
            method=HTTPMethod.POST,
            url=self.AUTH_LOGOUT,
            cookies={AUTH_SESSION: session or ''},
            expected_status_code=HTTPStatus.NO_CONTENT,
        )

    def get_weeks(self, session: str) -> Response:
        return self._call(
            method=HTTPMethod.GET,
            url='/api/weeks',
            cookies={AUTH_SESSION: session},
            expected_status_code=HTTPStatus.OK,
        )
