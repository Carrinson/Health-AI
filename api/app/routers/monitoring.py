from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import require_roles
from app.database import get_db
from app.models.audit_log import PredictionAuditLog
from app.models.user import User, UserRole

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/stats")
def get_stats(
    user: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    """Staff-only — patients have no reason to see aggregate prediction stats."""
    total = db.query(func.count(PredictionAuditLog.id)).scalar()
    red_flags = db.query(func.count(PredictionAuditLog.id)).filter(
        PredictionAuditLog.red_flag_triggered == True  # noqa: E712
    ).scalar()

    by_model = (
        db.query(PredictionAuditLog.model_name, func.count(PredictionAuditLog.id))
        .group_by(PredictionAuditLog.model_name)
        .all()
    )

    return {
        "total_predictions": total,
        "red_flag_count": red_flags,
        "red_flag_rate": round(red_flags / total, 4) if total else 0,
        "by_model": [{"model": m, "count": c} for m, c in by_model],
    }


@router.get("/recent")
def get_recent(
    user: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
    limit: int = 20,
):
    rows = (
        db.query(PredictionAuditLog)
        .order_by(PredictionAuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "endpoint": r.endpoint,
            "model_name": r.model_name,
            "red_flag_triggered": r.red_flag_triggered,
            "urgency": r.urgency,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]