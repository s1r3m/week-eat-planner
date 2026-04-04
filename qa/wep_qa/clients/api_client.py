from http import HTTPMethod, HTTPStatus

from httpx import Client, HTTPStatusError, Response


class UnexpectedStatusCodeError(HTTPStatusError):
    """Exception raised when the API returns an unexpected status code."""
    pass


class BaseApiClient:
    """Base class for API clients."""
    def __init__(self, base_url: str) -> None:
        """
        Create a BaseApiClient with an httpx Client configured for the provided API base URL.
        
        Parameters:
            base_url (str): The base URL used to initialize the underlying HTTP client (e.g., "https://api.example.com").
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
        """
        Perform an HTTP request and validate that the response status code matches the expected value.
        
        If the response status code differs from expected_status_code, raises UnexpectedStatusCodeError containing the original request and response. If raise_for_status is True, calls response.raise_for_status() which may raise HTTPStatusError for error status codes.
        
        Parameters:
            method (str): HTTP method to use (e.g., "GET", "POST").
            url (str): Request URL or path relative to the client's base URL.
            expected_status_code (HTTPStatus): Status code that the response must have.
            raise_for_status (bool): If True, call response.raise_for_status() after status validation.
        
        Returns:
            Response: The HTTP response object.
        
        Raises:
            UnexpectedStatusCodeError: When the response status code does not equal expected_status_code.
            HTTPStatusError: When raise_for_status is True and the response has an HTTP error status.
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
        """
        Request the API's ping endpoint.
        
        Returns:
            Response: The HTTP response from the ping endpoint; expected to have status code 200 (OK).
        """
        return self._call(HTTPMethod.GET, url=self.PING, expected_status_code=HTTPStatus.OK)
