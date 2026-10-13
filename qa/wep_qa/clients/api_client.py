from http import HTTPMethod, HTTPStatus

from httpx import Client, HTTPStatusError, Response


class UnexpectedStatusCodeError(HTTPStatusError):
    """Exception raised when the API returns an unexpected status code."""
    pass


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
        expected_status_code: HTTPStatus,
        raise_for_status: bool = True,
    ) -> Response:
        """Perform an HTTP request and validate the response status code.

        Args:
            method (str): The HTTP method (GET, POST, etc.).
            url (str): The URL to request.
            expected_status_code (HTTPStatus): The status code expected from the API.
            raise_for_status (bool): Whether to call raise_for_status() on the response. Defaults to True.

        Returns:
            Response: The HTTP response object.

        Raises:
            UnexpectedStatusCodeError: If the response status code does not match expected_status_code.
            HTTPStatusError: If raise_for_status is True and the response has an error status code.
        """
        request = self.client.build_request(method, url)

        response = self.client.send(request)
        if response.status_code != expected_status_code:
            err_msg = f'Unexpected status code: {response.status_code}, expected: {expected_status_code}'
            raise UnexpectedStatusCodeError(err_msg, request=request, response=response)

        # TODO: add json schema validation

        if raise_for_status:
            response.raise_for_status()

        return response


class WepApiClient(BaseApiClient):
    """Client for the WEP API."""
    PING = '/api/ping'

    def get_ping(self) -> Response:
        """Get the ping response from the API.

        Returns:
            Response: The HTTP response object.
        """
        return self._call(HTTPMethod.GET, url=self.PING, expected_status_code=HTTPStatus.OK)
