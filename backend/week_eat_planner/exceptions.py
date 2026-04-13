"""Custom exception classes for the application."""

from uuid import UUID

from fastapi import HTTPException, status


# Not Found exceptions.
class NotFoundException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class RecipeNotFoundException(NotFoundException):
    def __init__(self, recipe_id: str | UUID) -> None:
        super().__init__(detail=f'Recipe {recipe_id} not found')


class WeekNotFoundException(NotFoundException):
    def __init__(self, week_id: str | UUID) -> None:
        super().__init__(detail=f'Week {week_id} not found')


# Bad JWT exceptions.
class TokenException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class InvalidJwtTokenException(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='Invalid JWT token')


class RefreshTokenRevokedException(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='Refresh token revoked')


class NoEmailInTokenException(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='No email in JWT token')


class RefreshTokenMissingException(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='Refresh Token missing')


class RefreshTokenNotFoundException(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='Token not found')


class TokenExpiredException(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='Token expired')


class TokenRevokedException(TokenException):
    def __init__(self) -> None:
        super().__init__(detail='Token revoked')


# Logic exceptions.
class LogicException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class UserAlreadyExistsException(LogicException):
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


# Access Forbidden Exceptions.
class AccessForbiddenException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class MealSlotForbiddenException(AccessForbiddenException):
    def __init__(self, meal_slot_id: UUID) -> None:
        super().__init__(detail=f'Meal slot {meal_slot_id} forbidden')


class TokenForbidden(AccessForbiddenException):
    def __init__(self) -> None:
        super().__init__(detail='Token forbidden')


# Validation Exceptions.
class ValidationException(HTTPException):
    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class InvalidEmailException(ValidationException):
    def __init__(self, email: str) -> None:
        super().__init__(detail=f'Invalid email: {email}')


class UnsupportedImageTypeException(ValidationException):
    def __init__(self, image_type: str) -> None:
        super().__init__(detail=f'Unsupported image type: {image_type}')


class ImageTooLargeException(ValidationException):
    def __init__(self, max_size: int) -> None:
        super().__init__(detail=f'Image too large: maximum size is {max_size // (1024 * 1024)}MB')


class ImageContentTypeMissingException(ValidationException):
    def __init__(self) -> None:
        super().__init__(detail='No Content type for the given image')


class RecipeForbiddenException(AccessForbiddenException):
    def __init__(self, recipe_id: UUID) -> None:
        super().__init__(detail=f'Recipe {recipe_id} forbidden')


class WeekForbiddenException(AccessForbiddenException):
    def __init__(self, week_id: UUID) -> None:
        super().__init__(detail=f'Week {week_id} forbidden')


# Auth Exceptions.


class InvalidCredentialsException(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials')
