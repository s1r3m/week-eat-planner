import pytest_asyncio
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from tests.api.conftest import WEEK_1_NAME
from tests.test_security import PASSWORD
from week_eat_planner.api.schemas import WeekCreate, WeekReadMinimal
from week_eat_planner.api.schemas.meal_slot import MealSlotAssign
from week_eat_planner.api.schemas.week import WeekRead
from week_eat_planner.constants import AppUrl
from week_eat_planner.db.models.recipe import Recipe
from week_eat_planner.db.models.shopping_list import ShoppingList
from week_eat_planner.db.models.week import Week
from week_eat_planner.exceptions import (
    MealSlotAssignException,
    NoAccessTokenException,
    WeekForbiddenException,
    WeekNotFoundException,
)
from week_eat_planner.helpers import generate_uuid7
from week_eat_planner.services.shopping_list_service import ShoppingListService
from week_eat_planner.services.week_service import WeekService


@pytest_asyncio.fixture
async def created_week_with_recipe(created_week: Week, created_recipe: Recipe, db_session: AsyncSession) -> Week:
    await WeekService(db_session).assign_recipes_to_meal_slots(
        created_week,
        MealSlotAssign(recipe_id=str(created_recipe.id), slot_id=str(created_week.meal_slots[0].id)),
    )
    return created_week


@pytest_asyncio.fixture
async def created_shopping_list(created_week_with_recipe: Week, db_session: AsyncSession) -> ShoppingList:
    shopping_list = await ShoppingListService(db_session).create(created_week_with_recipe)
    return shopping_list


async def test_create_week__with_auth__week_in_response(auth_client_for_created_user, created_user):
    response = await auth_client_for_created_user.post(
        AppUrl.WEEKS, json=WeekCreate(name=WEEK_1_NAME).model_dump(mode='json')
    )

    body = response.json()
    assert response.status_code == status.HTTP_201_CREATED
    assert body.pop('id')
    assert body == {'name': WEEK_1_NAME, 'user_id': str(created_user.id)}


async def test_get_weeks__empty_db__empty_response(auth_client_for_created_user):
    response = await auth_client_for_created_user.get(AppUrl.WEEKS)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


async def test_get_weeks__week_exists__week_in_response(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.get(AppUrl.WEEKS)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [WeekReadMinimal.model_validate(created_week).model_dump(mode='json')]


async def test_get_weeks__no_auth__error_in_response(client):
    response = await client.get(AppUrl.WEEKS)

    error = NoAccessTokenException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_get_week__user_with_week__week_in_response(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.get(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == WeekRead.model_validate(created_week).model_dump(mode='json')


async def test_get_week__week_not_exist__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.get(f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}')

    error = WeekNotFoundException(bad_week_id)
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_get_week__no_auth__error_in_response(client, created_week):
    response = await client.get(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    error = WeekForbiddenException(week_id=created_week.id)
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_update_week__new_name__week_in_response(auth_client_for_created_user, created_week):
    new_name = 'new_name'

    response = await auth_client_for_created_user.patch(
        url=f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}', json={'name': new_name}
    )

    body = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert body == {
        'id': str(created_week.id),
        'name': new_name,
        'user_id': str(created_week.user_id),
    }


async def test_update_week__no_auth__error_in_response(client, created_week):
    response = await client.patch(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}', json={'name': 'new_name'})

    error = NoAccessTokenException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_update_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.patch(
        url=f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}',
        json={'name': 'test'},
    )

    error = WeekNotFoundException(bad_week_id)
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_delete_week__no_auth__error_in_response(client, created_week):
    response = await client.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    error = NoAccessTokenException()
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_delete_week__user_without_week__error_in_response(auth_client_for_created_user):
    bad_week_id = generate_uuid7()

    response = await auth_client_for_created_user.delete(f'{AppUrl.WEEKS_TPL.format(week_id=bad_week_id)}')

    error = WeekNotFoundException(bad_week_id)
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_delete_week__user_with_week__week_removed(auth_client_for_created_user, created_week):
    response = await auth_client_for_created_user.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not response.text


async def test_delete_week__other_user_existing_week__error_in_response(
    created_week, auth_client_factory, created_user_2
):
    user_client_2 = await auth_client_factory(created_user_2, PASSWORD)

    response = await user_client_2.delete(f'{AppUrl.WEEKS_TPL.format(week_id=created_week.id)}')

    error = WeekForbiddenException(created_week.id)
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_assign_recipe_to_meal_slot__valid_data__updated_slots_in_response(
    created_week,
    created_recipe,
    auth_client_for_created_user,
):
    slot_to_assign = created_week.meal_slots[0]

    response = await auth_client_for_created_user.patch(
        AppUrl.WEEK_SLOTS_TPL.format(week_id=created_week.id),
        json=[{'slot_id': str(slot_to_assign.id), 'recipe_id': str(created_recipe.id)}],
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            'id': str(slot_to_assign.id),
            'day_of_week': slot_to_assign.day_of_week.value,
            'meal_type': slot_to_assign.meal_type.value,
            'recipe': {
                'id': str(created_recipe.id),
                'name': created_recipe.name,
                'author': created_recipe.author,
                'is_favorite': False,
                'image_url': None,
            },
        },
    ]


async def test_assign_recipe_to_meal_slot__invalid_data__error_in_response(
    created_week,
    created_recipe,
    auth_client_for_created_user,
):
    bad_uuid = 'bad_uuid'

    response = await auth_client_for_created_user.patch(
        AppUrl.WEEK_SLOTS_TPL.format(week_id=created_week.id),
        json=[
            {'slot_id': str(created_week.meal_slots[0].id), 'recipe_id': str(created_recipe.id)},
            {'slot_id': bad_uuid, 'recipe_id': str(created_recipe.id)},
        ],
    )

    error_message = {'recipe_id': str(created_recipe.id), 'slot_id': bad_uuid, 'error': 'Invalid slot ID'}
    error = MealSlotAssignException([error_message])
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_create_shopping_list__week_exists__shopping_list_created(
    created_week_with_recipe, auth_client_for_created_user
):
    response = await auth_client_for_created_user.post(
        AppUrl.SHOPPING_LIST_TPL.format(week_id=created_week_with_recipe.id)
    )

    assert response.status_code == status.HTTP_201_CREATED
    recipe = created_week_with_recipe.meal_slots[0].recipe
    assert response.json() == {
        'week_id': str(created_week_with_recipe.id),
        'items': [{'checked': False, **ing} for ing in recipe.ingredients],
    }


async def test_create_shopping_list__bad_week_id__error_in_response(auth_client_for_created_user):
    not_existing_week_id = generate_uuid7()

    response = await auth_client_for_created_user.post(AppUrl.SHOPPING_LIST_TPL.format(week_id=not_existing_week_id))

    error = WeekNotFoundException(not_existing_week_id)
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_get_shopping_list__list_exists__shopping_list_in_response(
    auth_client_for_created_user, created_shopping_list
):
    week = created_shopping_list.week

    response = await auth_client_for_created_user.get(AppUrl.SHOPPING_LIST_TPL.format(week_id=week.id))

    assert response.status_code == status.HTTP_200_OK
    recipe = week.meal_slots[0].recipe
    assert response.json() == {
        'week_id': str(week.id),
        'items': [{'checked': False, **ing} for ing in recipe.ingredients],
    }


async def test_get_shopping_list__week_not_exist__error_in_response(auth_client_for_created_user):
    not_existing_week_id = generate_uuid7()

    response = await auth_client_for_created_user.get(AppUrl.SHOPPING_LIST_TPL.format(week_id=not_existing_week_id))

    error = WeekNotFoundException(not_existing_week_id)
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}


async def test_update_shopping_list__list_exists__shopping_list_in_response(
    auth_client_for_created_user, created_shopping_list
):
    week = created_shopping_list.week
    recipe = week.meal_slots[0].recipe

    response = await auth_client_for_created_user.put(
        AppUrl.SHOPPING_LIST_TPL.format(week_id=week.id),
        json={'items': [{'checked': True, **ing} for ing in recipe.ingredients]},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        'week_id': str(week.id),
        'items': [{'checked': True, **ing} for ing in recipe.ingredients],
    }


async def test_update_shopping_list__week_not_exist__error_in_response(
    auth_client_for_created_user, created_shopping_list
):
    not_existing_week_id = generate_uuid7()
    week = created_shopping_list.week
    recipe = week.meal_slots[0].recipe

    response = await auth_client_for_created_user.put(
        AppUrl.SHOPPING_LIST_TPL.format(week_id=not_existing_week_id),
        json={'items': [{'checked': True, **ing} for ing in recipe.ingredients]},
    )

    error = WeekNotFoundException(not_existing_week_id)
    assert response.status_code == error.status_code
    assert response.json() == {'detail': error.detail}
