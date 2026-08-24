from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserOut


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Annotated[Session, Depends(get_db)]):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        fullname=payload.fullname,
    )
    db.add(user)
    db.commit()
    db.refresh(user)


@router.post("/login", response_model=Token)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    """0Auth2PasswordRequestForm expects from fields named 'username' and
      'password' the username field carries the email here thats the standard 
      and it's what makes /docs Authorize button work."""

    user = db.query(User). filter(User.email == form.username).first()

    # Sae error whether the email is unknown or the password is wrong - telling 
    # them apart would let an attacker enumerate registered accounts.
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(access_token=create_access_token(user.email, user.role.value))

@router.get("/me", response_model=UserOut)
def me (user: Annotated[User, Depends(get_current_user)]):
    return user
