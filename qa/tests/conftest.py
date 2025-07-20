import pytest

from wep_qa.actions import Actions


@pytest.fixture
def actions() -> Actions:
    return Actions()
