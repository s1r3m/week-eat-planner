"""Custom exception classes for the application."""

from uuid import UUID

from fastapi import HTTPException, status


# Not Found exceptions.
class NotFoundException(HTTPException):
    """Base exception for resources not found in the database.

    Args:
        detail: A description of the error.
    """

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class RecipeNotFoundException(NotFoundException):
    """Exception raised when a recipe cannot be found.

    Args:
        recipe_id: The ID of the recipe that was not found.
    """

    def __init__(self, recipe_id: str | UUID) -> None:
        super().__init__(detail=f'Recipe {recipe_id} not found')


class WeekNotFoundException(NotFoundException):
    """Exception raised when a week cannot be found.

    Args:
        week_id: The ID of the week that was not found.
    """

    def __init__(self, week_id: str | UUID) -> None:
        super().__init__(detail=f'Week {week_id} not found')


# Bad JWT exceptions.
class TokenException(HTTPException):
    """Base exception for authentication token-related errors.

    Args:
        detail: A description of the error.
    """

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class InvalidJwtTokenException(TokenException):
    """Exception raised when a JWT token is invalid."""

    def __init__(self) -> None:
        super().__init__(detail='Invalid JWT token')


class RefreshTokenRevokedException(TokenException):
    """Exception raised when a refresh token has been revoked."""

    def __init__(self) -> None:
        super().__init__(detail='Refresh token revoked')


class NoEmailInTokenException(TokenException):
    """Exception raised when a JWT token does not contain a 'sub' (email) claim."""

    def __init__(self) -> None:
        super().__init__(detail='No email in JWT token')


class RefreshTokenMissingException(TokenException):
    """Exception raised when a refresh token is missing from the request."""

    def __init__(self) -> None:
        super().__init__(detail='Refresh Token missing')


class RefreshTokenNotFoundException(TokenException):
    """Exception raised when a refresh token is not found in the database."""

    def __init__(self) -> None:
        super().__init__(detail='Token not found')


class TokenExpiredException(TokenException):
    """Exception raised when an authentication token has expired."""

    def __init__(self) -> None:
        super().__init__(detail='Token expired')


class TokenRevokedException(TokenException):
    """Exception raised when an authentication token has been revoked."""

    def __init__(self) -> None:
        super().__init__(detail='Token revoked')


# Logic exceptions.
class LogicException(HTTPException):
    """Base exception for business logic errors.

    Args:
        detail: A description of the error.
    """

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class UserAlreadyExistsException(LogicException):
    """Exception raised when attempting to register an already existing user."""

    def __init__(self) -> None:
        super().__init__(detail='User already exists')


class UserRemovedException(LogicException):
    """Exception raised when an operation is attempted on a removed user.

    Args:
        detail: A description of the error.
    """

    def __init__(self, detail: str) -> None:
        super().__init__(detail)


class MealSlotAssignException(LogicException):
    """Exception raised when errors occur during meal slot assignment.

    Args:
        errors: A list of error details.
    """

    def __init__(self, errors: list[dict]) -> None:
        super().__init__(detail=f'Error during assigning meal_slots: {errors}')


class LoginWithAuthException(LogicException):
    """Exception raised when a login request is already authenticated.

    Args:
        detail: An optional custom error message.
    """

    def __init__(self, detail: str | None = None) -> None:
        super().__init__(detail=detail or 'Login requests should not be authenticated')


class SignUpWithAuthException(LogicException):
    """Exception raised when a sign-up request is already authenticated."""

    def __init__(self) -> None:
        super().__init__(detail='Sign up requests should not be authenticated')


# Access Forbidden Exceptions.
class AccessForbiddenException(HTTPException):
    """Base exception for access denial errors.

    Args:
        detail: A description of the error.
    """

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class MealSlotForbiddenException(AccessForbiddenException):
    """Exception raised when a user is denied access to a specific meal slot.

    Args:
        meal_slot_id: The ID of the forbidden meal slot.
    """

    def __init__(self, meal_slot_id: UUID) -> None:
        super().__init__(detail=f'Meal slot {meal_slot_id} forbidden')


class TokenForbidden(AccessForbiddenException):
    """Exception raised when a token is forbidden."""

    def __init__(self) -> None:
        super().__init__(detail='Token forbidden')


# Validation Exceptions.
class ValidationException(HTTPException):
    """Base exception for data validation errors.

    Args:
        detail: A description of the error.
    """

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class InvalidEmailException(ValidationException):
    """Exception raised when an invalid email format is provided."""

    def __init__(self) -> None:
        super().__init__(detail='Invalid email')


class UnsupportedImageTypeException(ValidationException):
    """Exception raised when an unsupported image type is uploaded.

    Args:
        image_type: The MIME type of the unsupported image.
    """

    def __init__(self, image_type: str) -> None:
        super().__init__(detail=f'Unsupported image type: {image_type}')


class ImageTooLargeException(ValidationException):
    """Exception raised when an uploaded image exceeds the maximum allowed size.

    Args:
        max_size: The maximum allowed image size in bytes.
    """

    def __init__(self, max_size: int) -> None:
        super().__init__(detail=f'Image too large: maximum size is {max_size // (1024 * 1024)}MB')


class ImageContentTypeMissingException(ValidationException):
    """Exception raised when an uploaded image has no content type header."""

    def __init__(self) -> None:
        super().__init__(detail='No Content type for the given image')


class RecipeForbiddenException(AccessForbiddenException):
    """Exception raised when a user is denied access to a specific recipe.

    Args:
        recipe_id: The ID of the forbidden recipe.
    """

    def __init__(self, recipe_id: UUID) -> None:
        super().__init__(detail=f'Recipe {recipe_id} forbidden')


class WeekForbiddenException(AccessForbiddenException):
    """Exception raised when a user is denied access to a specific week.

    Args:
        week_id: The ID of the forbidden week.
    """

    def __init__(self, week_id: UUID) -> None:
        super().__init__(detail=f'Week {week_id} forbidden')


# Auth Exceptions.


class InvalidCredentialsException(HTTPException):
    """Exception raised when provided credentials (email or password) are incorrect.

    Args:
        detail: A description of the error.
    """

    def __init__(self, detail: str = 'Could not validate credentials') -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class OAuthAccountException(LogicException):
    """Exception raised when password login is attempted for an account registered via OAuth."""

    def __init__(self) -> None:
        super().__init__(detail='This email is registered via a social login')


class PasswordAccountException(LogicException):
    """Exception raised when OAuth login is attempted for an account registered via password."""

    def __init__(self) -> None:
        super().__init__(detail='This email is registered with a password')


class OAuthInvalidCodeException(ValidationException):
    """Exception raised when an OAuth authorization code is invalid or expired."""

    def __init__(self) -> None:
        super().__init__(detail='Invalid or expired authorization code')


class OAuthProviderException(HTTPException):
    """Exception raised when an error occurs while communicating with an OAuth provider.

    Args:
        detail: A description of the error.
    """

    def __init__(self, detail: str = 'OAuth provider error') -> None:
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)
