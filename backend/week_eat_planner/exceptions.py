"""Custom exception classes for the application."""

from uuid import UUID

from fastapi import HTTPException, status


# Not Found exceptions.
class NotFoundException(HTTPException):
    """Base exception for resources not found in the database.

    Uses HTTP 409 responses.
    """

    def __init__(self, detail: str) -> None:
        """Initialize the HTTP 409 error with its response detail.

        Args:
            detail: A description of the error.
        """
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class RecipeNotFoundException(NotFoundException):
    """Exception raised when a recipe cannot be found.

    Uses HTTP 409 responses.
    """

    def __init__(self, recipe_id: str | UUID) -> None:
        """Initialize the HTTP 409 error with its response detail.

        Args:
            recipe_id: The ID of the recipe that was not found.
        """
        super().__init__(detail=f'Recipe {recipe_id} not found')


class ShoppingListNotFoundException(NotFoundException):
    """Exception raised when a shopping list cannot be found.

    Uses HTTP 409 responses.
    """

    def __init__(self, week_id: str | UUID) -> None:
        """Initialize the HTTP 409 error with its response detail.

        Args:
            week_id: The ID of the week that the shopping list belongs to.
        """
        super().__init__(detail=f'Shopping list for week {week_id} not found')


class WeekNotFoundException(NotFoundException):
    """Exception raised when a week cannot be found.

    Uses HTTP 409 responses.
    """

    def __init__(self, week_id: str | UUID) -> None:
        """Initialize the HTTP 409 error with its response detail.

        Args:
            week_id: The ID of the week that was not found.
        """
        super().__init__(detail=f'Week {week_id} not found')


# Session exceptions.
class SessionException(HTTPException):
    """Base exception for authentication session errors.

    Uses HTTP 401 responses.
    """

    def __init__(self, detail: str) -> None:
        """Initialize the HTTP 401 error with its response detail.

        Args:
            detail: A description of the error.
        """
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class SessionNotFoundException(SessionException):
    """Exception raised when a session token is not found in the database.

    Uses HTTP 401 responses.
    """

    def __init__(self) -> None:
        """Initialize the HTTP 401 error with its response detail."""
        super().__init__(detail='Session not found')


class SessionExpiredException(SessionException):
    """Exception raised when a session token has expired.

    Uses HTTP 401 responses.
    """

    def __init__(
        self,
    ) -> None:
        """Initialize the HTTP 401 error with its response detail."""
        super().__init__(detail='Session expired')


# Logic exceptions.
class LogicException(HTTPException):
    """Base exception for business logic errors.

    Uses HTTP 409 responses.
    """

    def __init__(self, detail: str) -> None:
        """Initialize the HTTP 409 error with its response detail.

        Args:
            detail: A description of the error.
        """
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class UserAlreadyExistsException(LogicException):
    """Exception raised when attempting to register an already existing user.

    Uses HTTP 409 responses.
    """

    def __init__(self) -> None:
        """Initialize the HTTP 409 error with its response detail."""
        super().__init__(detail='User already exists')


class UserNotFoundException(LogicException):
    """Exception raised when a user is missing or inactive.

    Uses HTTP 409 responses.
    """

    def __init__(self, user_id: UUID) -> None:
        """Initialize the HTTP 409 error with its response detail.

        Args:
            user_id: The ID of the user that was not found.
        """
        super().__init__(f'User {user_id} was not found!')


class MealSlotAssignException(LogicException):
    """Exception raised when errors occur during meal slot assignment.

    Uses HTTP 409 responses.
    """

    def __init__(self, errors: list[dict]) -> None:
        """Initialize the HTTP 409 error with its response detail.

        Args:
            errors: A list of error details.
        """
        super().__init__(detail=f'Error during assigning meal_slots: {errors}')


class LoginWithAuthException(LogicException):
    """Exception raised when a login request is already authenticated.

    Uses HTTP 409 responses.
    """

    def __init__(self, detail: str | None = None) -> None:
        """Initialize the HTTP 409 error with its response detail.

        Args:
            detail: Custom error text; None or an empty string uses the default message.
        """
        super().__init__(detail=detail or 'Login requests should not be authenticated')


class SignUpWithAuthException(LogicException):
    """Exception raised when a sign-up request is already authenticated.

    Uses HTTP 409 responses.
    """

    def __init__(self) -> None:
        """Initialize the HTTP 409 error with its response detail."""
        super().__init__(detail='Sign up requests should not be authenticated')


class ShoppingListAlreadyExistsException(LogicException):
    """A week already has a shopping list (HTTP 409)."""

    def __init__(self, week_id: UUID) -> None:
        """Initialize the HTTP 409 error with its response detail.

        Args:
            week_id: The ID of the week that already has a shopping list.
        """
        super().__init__(detail=f'Shopping list of the week {week_id} already exists')


# Access Forbidden Exceptions.
class AccessForbiddenException(HTTPException):
    """Base exception for access denial errors.

    Uses HTTP 403 responses.
    """

    def __init__(self, detail: str) -> None:
        """Initialize the HTTP 403 error with its response detail.

        Args:
            detail: A description of the error.
        """
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class MealSlotForbiddenException(AccessForbiddenException):
    """Exception raised when a user is denied access to a specific meal slot.

    Uses HTTP 403 responses.
    """

    def __init__(self, meal_slot_id: UUID) -> None:
        """Initialize the HTTP 403 error with its response detail.

        Args:
            meal_slot_id: The ID of the forbidden meal slot.
        """
        super().__init__(detail=f'Meal slot {meal_slot_id} forbidden')


# Validation Exceptions.
class ValidationException(HTTPException):
    """Base exception for data validation errors.

    Uses HTTP 400 responses.
    """

    def __init__(self, detail: str) -> None:
        """Initialize the HTTP 400 error with its response detail.

        Args:
            detail: A description of the error.
        """
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class InvalidEmailException(ValidationException):
    """Exception raised when an invalid email format is provided.

    Uses HTTP 400 responses.
    """

    def __init__(self) -> None:
        """Initialize the HTTP 400 error with its response detail."""
        super().__init__(detail='Invalid email')


class UnsupportedImageTypeException(ValidationException):
    """Exception raised when an unsupported image type is uploaded.

    Uses HTTP 400 responses.
    """

    def __init__(self, image_type: str) -> None:
        """Initialize the HTTP 400 error with its response detail.

        Args:
            image_type: The MIME type of the unsupported image.
        """
        super().__init__(detail=f'Unsupported image type: {image_type}')


class ImageTooLargeException(ValidationException):
    """Exception raised when an uploaded image exceeds the maximum allowed size.

    Uses HTTP 400 responses.
    """

    def __init__(self, max_size: int) -> None:
        """Initialize the HTTP 400 error with its response detail.

        Args:
            max_size: The maximum allowed image size in bytes.
        """
        super().__init__(detail=f'Image too large: maximum size is {max_size // (1024 * 1024)}MB')


class ImageContentTypeMissingException(ValidationException):
    """Exception raised when an uploaded image has no content type header.

    Uses HTTP 400 responses.
    """

    def __init__(self) -> None:
        """Initialize the HTTP 400 error with its response detail."""
        super().__init__(detail='No Content type for the given image')


class RecipeForbiddenException(AccessForbiddenException):
    """Exception raised when a user is denied access to a specific recipe.

    Uses HTTP 403 responses.
    """

    def __init__(self, recipe_id: UUID) -> None:
        """Initialize the HTTP 403 error with its response detail.

        Args:
            recipe_id: The ID of the forbidden recipe.
        """
        super().__init__(detail=f'Recipe {recipe_id} forbidden')


class WeekForbiddenException(AccessForbiddenException):
    """Exception raised when a user is denied access to a specific week.

    Uses HTTP 403 responses.
    """

    def __init__(self, week_id: UUID) -> None:
        """Initialize the HTTP 403 error with its response detail.

        Args:
            week_id: The ID of the forbidden week.
        """
        super().__init__(detail=f'Week {week_id} forbidden')


# Auth Exceptions.


class InvalidCredentialsException(HTTPException):
    """Exception raised when provided credentials (email or password) are incorrect.

    Uses HTTP 401 responses.
    """

    def __init__(self, detail: str = 'Could not validate credentials') -> None:
        """Initialize the HTTP 401 error with its response detail.

        Args:
            detail: Error text, defaulting to "Could not validate credentials".
        """
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class NoSessionTokenException(HTTPException):
    """A request requires authentication but has no valid session (HTTP 401)."""

    def __init__(self) -> None:
        """Initialize the HTTP 401 error with its response detail."""
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail='No session token in request')


class OAuthAccountException(LogicException):
    """Exception raised when an OAuth-only account conflicts with the requested login method or provider.

    Uses HTTP 409 responses.
    """

    def __init__(self) -> None:
        """Initialize the HTTP 409 error with its response detail."""
        super().__init__(detail='This email is registered via a social login')


class PasswordAccountException(LogicException):
    """Exception raised when OAuth login is attempted for an account registered via password.

    Uses HTTP 409 responses.
    """

    def __init__(self) -> None:
        """Initialize the HTTP 409 error with its response detail."""
        super().__init__(detail='This email is registered with a password')


class OAuthInvalidCodeException(ValidationException):
    """Exception raised when an OAuth authorization code is invalid or expired.

    Uses HTTP 400 responses.
    """

    def __init__(self) -> None:
        """Initialize the HTTP 400 error with its response detail."""
        super().__init__(detail='Invalid or expired authorization code')


class OAuthProviderException(HTTPException):
    """OAuth provider communication or identity verification failed (HTTP 502)."""

    def __init__(self, detail: str = 'OAuth provider error') -> None:
        """Initialize the HTTP 502 error with its response detail.

        Args:
            detail: Error text, defaulting to "OAuth provider error".
        """
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)
