from uuid import UUID

from fastapi import HTTPException, status


class NotFoundException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class RecipeNotFound(NotFoundException):
    def __init__(self, recipe_id: str | UUID) -> None:
        super().__init__(detail=f'Recipe {recipe_id} not found')


class WeekNotFound(NotFoundException):
    def __init__(self, week_id: str | UUID) -> None:
        super().__init__(detail=f'Week {week_id} not found')


class TokenException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class InvalidJwtToken(TokenException):
    def __init__(self, token: str) -> None:
        super().__init__(detail=f'Invalid JWT token: {token}')


class RefreshTokenRevoked(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='Refresh token revoked')


class NoEmailInToken(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='No email in JWT token')


class RefreshTokenMissing(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='Refresh Token missing')


class RefreshTokenNotFound(TokenException):
    def __init__(self, token: str) -> None:
        super().__init__(detail=f'Token {token} not found')


class TokenExpired(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='Token expired')


class TokenRevoked(TokenException):
    def __init__(self, token: str) -> None:
        super().__init__(detail=f'Token {token} revoked')


class LogicException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class UserAlreadyExists(LogicException):
    def __init__(self, email: str) -> None:
        super().__init__(detail=f'User with {email=} already exists')


class MealSlotAssignException(LogicException):
    def __init__(self, errors: list[dict]) -> None:
        super().__init__(detail=f'Error during assigning meal_slots: {errors}')


class LoginWithAuthException(LogicException):
    def __init__(self, detail: str | None = None) -> None:
        super().__init__(detail=detail or 'Login requests should not be authenticated')


class SignUpWithAuthException(LogicException):
    def __init__(self) -> None:
        super().__init__(detail='Sign up requests should not be authenticated')


class AccessForbiddenException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class MealSlotForbidden(AccessForbiddenException):
    def __init__(self, meal_slot_id: UUID) -> None:
        super().__init__(detail=f'Meal slot {meal_slot_id} forbidden')


class TokenForbidden(AccessForbiddenException):
    def __init__(self, token: str) -> None:
        super().__init__(detail=f'Token {token} forbidden')


class ValidationException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class RecipeForbidden(AccessForbiddenException):
    def __init__(self, recipe_id: UUID) -> None:
        super().__init__(detail=f'Recipe {recipe_id} forbidden')


class WeekForbidden(AccessForbiddenException):
    def __init__(self, week_id: UUID) -> None:
        super().__init__(detail=f'Week {week_id} forbidden')


class InvalidEmail(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail='Invalid email')


class InvalidCredentials(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials')


class RecipeFavoriteMissing(LogicException):
    def __init__(self, recipe_id: UUID, user_id: UUID) -> None:
        super().__init__(detail=f'Recipe {recipe_id} favorite by {user_id} is not found, but should')
