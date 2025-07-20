from http import HTTPMethod, HTTPStatus

from httpx import Client, HTTPStatusError, Response


class UnexpectedStatusCode(HTTPStatusError):
    pass


class BaseApiClient:
    def __init__(self, base_url: str) -> None:
        self.client = Client(base_url=base_url)
        self._base_url = base_url

    def _call(
        self,
        method: str,
        url: str,
        expected_status_code: HTTPStatus,
        raise_for_status: bool = True,
    ) -> Response:
        request = self.client.build_request(method, url)

        response = self.client.send(request)
        if response.status_code != expected_status_code:
            err_msg = f'Unexpected status code: {response.status_code}, expected: {expected_status_code}'
            raise UnexpectedStatusCode(err_msg, request=request, response=response)

        # TODO: add json schema validation

        if raise_for_status:
            response.raise_for_status()

        return response


class WepApiClient(BaseApiClient):
    PING = '/api/ping'

    def get_ping(self) -> Response:
        return self._call(HTTPMethod.GET, url=self.PING, expected_status_code=HTTPStatus.OK)
