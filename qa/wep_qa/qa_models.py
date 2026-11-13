from dataclasses import dataclass, field

from wep_qa.constants import PASSWORD


@dataclass(slots=True)
class User:
    email: str
    username: str
    session: str = ''
    password: str = PASSWORD
    id: str | None = None

    def __hash__(self) -> int:
        return hash(id)


@dataclass(slots=True)
class Repo:
    users: set[User] = field(default_factory=set)
