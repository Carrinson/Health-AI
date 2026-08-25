from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi import security
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User, UserRole

# Tells FastAPI where clients get tokens. This is also what makes the
# "Authorize" button appear in /docs.

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        db: Annotated[Session, Depends(get_db)],
) -> User:
    """Any endpoint that declares this as a parameter becomes authenticated —
    FastAPI runs it first and rejects the request if it raises."""

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-AUTHENTICATE": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None or payload.get("sub") is None:
        raise credentials_error

    # We look the user up rather than trusting the token's contents. A token
    # stays valid until it expires, so a user deactivated five minutes ago
    # would still hold a signed token — the DB is the source of truth.

    user = db.query(User).filter (User.email == payload["sub"]).first()
    if user is None or not user.is_active: 
        raise credentials_error

    return user



def require_roles(*allowed: UserRole):
    """Factory that builds a dependency restricting an endpoint to certain roles.

    Usage:  Depends(require_roles(UserRole.DOCTOR, UserRole.PLATFORM_ADMIN))

    Written as a factory because FastAPI dependencies can't take arguments
    directly — so we return a configured function instead."""

    def checker(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user 
    return checker