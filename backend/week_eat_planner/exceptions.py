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


TokenExpiredException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Token expired',
)


InvalidEmail = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Invalid email',
)


UserNotFound = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Incorrect email or password',
)


UserAlreadyExists = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='User with this email already exists',
)

WeekNotFound = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Week not found',
)

WeekForbidden = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail='Access forbidden',
)
