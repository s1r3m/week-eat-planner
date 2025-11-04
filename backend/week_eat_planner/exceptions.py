from fastapi import HTTPException, status

InvalidJwtToken = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Invalid JWT token',
)


NoEmailInToken = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='No email in token',
)


TokenNotFound = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Token not found',
)


RefreshTokenMissing = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Refresh Token missing',
)


InvalidRefreshToken = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Invalid refresh token',
)


TokenExpired = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Token expired',
)


TokenRevoked = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Token revoked',
)


InvalidEmail = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Invalid email',
)


UserNotFound = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='The user was not found',
)


InvalidCredentials = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Could not validate credentials',
)


UserAlreadyExists = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='User with this email already exists',
)

MealSlotNotFound = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Meal slot not found',
)


WeekNotFound = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Week not found',
)


RecipeNotFound = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Recipe not found',
)

AccessForbidden = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail='Access forbidden',
)


MealSlotForbidden = AccessForbidden


TokenForbidden = AccessForbidden


RecipeForbidden = AccessForbidden


WeekForbidden = AccessForbidden
