from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import require_roles
from app.database import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/admin", tags=["admin"])


class RoleUpdate(BaseModel):
    role: UserRole


@router.get("/users")
def list_all_users(
    user: Annotated[User, Depends(require_roles(UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    """Every user, every role, in one list — this is the ONLY endpoint in
    the whole API that returns users across all roles at once. Restricted
    to platform_admin exclusively; even hospital_admin doesn't get this."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "fullname": u.fullname,
            "email": u.email,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: RoleUpdate,
    admin: Annotated[User, Depends(require_roles(UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    """Replaces the manual SQL UPDATE we've been running by hand all
    night. Note: this doesn't invalidate the target user's existing JWT —
    same limitation as before, they need to log out/in for a role change
    to take effect, since the role is baked into the token at login time."""
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, "User not found")

    target.role = payload.role
    db.commit()
    return {"id": target.id, "role": target.role.value}


class DoctorCreate(BaseModel):
    email: str
    password: str
    fullname: str


@router.post("/doctors", status_code=201)
def create_doctor(
    payload: DoctorCreate,
    admin: Annotated[User, Depends(require_roles(UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    """Admin-created accounts start as DOCTOR directly — this is the
    intended path for onboarding clinical staff, versus the public
    /auth/register endpoint which always creates a PATIENT."""
    from app.core.security import hash_password

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")

    doctor = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        fullname=payload.fullname,
        role=UserRole.DOCTOR,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return {"id": doctor.id, "email": doctor.email, "fullname": doctor.fullname, "role": doctor.role.value}