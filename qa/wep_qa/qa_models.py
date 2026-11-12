from dataclasses import dataclass
from uuid import UUID

from wep_qa.constants import PASSWORD


@dataclass(slots=True)
class User:
    email: str
    password: str = PASSWORD
    id: UUID | None = None
