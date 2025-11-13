import pytest

from week_eat_planner.helpers import generate_uuid7

EMAIL = 'ya@ya.eu'
PASSWORD = '123456'
HASHED_PASSWORD = '$2b$12$LWMbERKL6XH7CzFNXR4tOO8wsxOCYzQBLpqH4qoTlZvy1s4riAVNu'
USER_ID = generate_uuid7()
CLIENT_ID = generate_uuid7()
USERAGENT = 'curl v2.0'

WEEK_1_ID = generate_uuid7()
WEEK_1_NAME = 'first'
WEEK_2_ID = generate_uuid7()
WEEK_2_NAME = 'second'

RECIPE_NAME = 'Eggs'
RECIPE_IS_PUBLIC = False
RECIPE_INGREDIENTS = {'eggs': 2}

REFRESH_TOKEN = '9Q_3Rclneasa6LFcA2TOxFp1hzBnkVIE8jsbCMdyvhGg5FlylOJa-9zuVa4jYXdFvKWChXf2qMx_lsYv54OcKg'
HASHED_REFRESH_TOKEN = '9626ebd9a1951b4e2ebb23c8e14f1a33ea54beb5daf0bb9309d79fe86c4677a3'

FOR_UPDATE_PARAMETRIZE = [
    pytest.param(True, id='for_update'),
    pytest.param(False, id='read_only'),
]
