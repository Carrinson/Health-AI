from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.push_token import PushToken
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


class TokenRegister(BaseModel):
    expo_push_token: str


@router.post("/register-token", status_code=204)
def register_token(
    payload: TokenRegister,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Called once when the app starts, or whenever the token changes.
    Upsert — a user re-opening the app shouldn't create duplicate rows."""
    existing = db.query(PushToken).filter(PushToken.user_id == user.id).first()
    if existing:
        existing.expo_push_token = payload.expo_push_token
    else:
        db.add(PushToken(user_id=user.id, expo_push_token=payload.expo_push_token))
    db.commit()