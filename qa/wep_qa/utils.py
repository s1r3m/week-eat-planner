from httpx import Response

from wep_qa.constants import Header


def parse_response_header(response: Response, header: Header) -> dict[str, str | None]:
    """Gets the request and the header name to parse.

    Returns:
        A dict {key: value}.
    """
    raw_header_value: str = response.headers.get(header, '')
    if not raw_header_value:
        return {}

    result: dict[str, str | None] = {}
    pairs = raw_header_value.split('; ')
    for line in pairs:
        values = line.split('=', 1)
        key = values[0].strip()
        value = values[1].strip() if len(values) > 1 and values[1] != '""' else None
        result[key] = value

    return result
