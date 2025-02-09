from fastapi import status, HTTPException


InvalidJwtToken = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Invalid JWT token',
)


NoUserIdInToken = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='No user ID in token',
)


TokenNotFound = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Token not found',
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
