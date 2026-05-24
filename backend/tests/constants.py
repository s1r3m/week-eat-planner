from week_eat_planner.api.schemas.recipe import CookingStep, Ingredient
from week_eat_planner.constants import Unit
from week_eat_planner.helpers import generate_uuid7

EMAIL = 'ya@ya.eu'
PASSWORD = '12345678'
HASHED_PASSWORD = '$2b$12$kZ/3TY5QSO0QRg8rMvo1d.9WaJDwqM9354IFiOLCSjGl7Gts9Y/B.'
USER_ID = generate_uuid7()
USERNAME = 'yaya'

WEEK_1_ID = generate_uuid7()
WEEK_1_NAME = 'first'
WEEK_2_ID = generate_uuid7()
WEEK_2_NAME = 'second'

RECIPE_NAME = 'Eggs'
RECIPE_IS_PUBLIC = False
RECIPE_STEPS = [CookingStep(order=0, step='Boil eggs for 10 minutes')]
RECIPE_INGREDIENTS = [Ingredient(name='eggs', amount=2, unit=Unit.PIECES)]

REFRESH_TOKEN = '9Q_3Rclneasa6LFcA2TOxFp1hzBnkVIE8jsbCMdyvhGg5FlylOJa-9zuVa4jYXdFvKWChXf2qMx_lsYv54OcKg'
HASHED_REFRESH_TOKEN = '9626ebd9a1951b4e2ebb23c8e14f1a33ea54beb5daf0bb9309d79fe86c4677a3'
