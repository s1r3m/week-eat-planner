from week_eat_planner.db.models import User, Meal, Week


def test_user__filled_all_fields__correct_model():
    nickname = 'testuser'
    user_id = 100

    user = User(id=user_id, nickname=nickname)

    assert user.nickname == nickname
    assert user.id == user_id


def test_create_meal__filled_all_fields__correct_model():
    meal_id = 123
    meal = Meal(id=meal_id)
    assert meal.id == meal_id


def test_create_week__filled_all_fields__correct_model():
    start_day = 'Monday'
    week = Week(week_start=start_day)
    assert week.week_start == start_day


def test_week_meal__relationship__success():
    week = Week(week_start="Sunday")
    meal = Meal()

    week.meals.append(meal)

    assert len(week.meals) == 1
    assert week.meals[0] == meal
