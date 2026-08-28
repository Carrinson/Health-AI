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

@router.get("/queue")
def get_queue(
    user: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    """Most recent symptom-check record per patient, newest first.
    Urgency comes from the record's saved content, not a separate column —
    it's parsed out below since we stored the full response as JSON."""
    import json

    from app.models.record import MedicalRecord, RecordType

    records = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.record_type == RecordType.SYMPTOM_CHECK)
        .order_by(MedicalRecord.created_at.desc())
        .limit(50)
        .all()
    )

    queue = []
    for r in records:
        content = json.loads(r.content)
        queue.append({
            "record_id": r.id,
            "patient_id": r.patient_id,
            "title": r.title,
            "urgency": content.get("urgency"),
            "predictions": content.get("predictions", []),
            "red_flags": content.get("red_flags", []),
            "created_at": r.created_at.isoformat(),
        })

    # Sort emergency first, then see_a_doctor, then insufficient_info
    priority = {"emergency": 0, "see_a_doctor": 1, "insufficient_info": 2}
    queue.sort(key=lambda x: priority.get(x["urgency"], 3))

    return queue

@router.get("/patients")
def list_patients(
    user: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    """One row per patient, with their record count and most recent
    symptom-check urgency if they have one. Kept simple — a real system
    would paginate; fine for a demo dataset."""
    import json

    from app.models.record import MedicalRecord, RecordType

    patients = db.query(User).filter(User.role == UserRole.PATIENT).all()

    result = []
    for p in patients:
        record_count = (
            db.query(func.count(MedicalRecord.id))
            .filter(MedicalRecord.patient_id == p.id)
            .scalar()
        )
        latest_check = (
            db.query(MedicalRecord)
            .filter(
                MedicalRecord.patient_id == p.id,
                MedicalRecord.record_type == RecordType.SYMPTOM_CHECK,
            )
            .order_by(MedicalRecord.created_at.desc())
            .first()
        )
        last_urgency = None
        last_date = None
        if latest_check:
            content = json.loads(latest_check.content)
            last_urgency = content.get("urgency")
            last_date = latest_check.created_at.isoformat()

        result.append({
            "id": p.id,
            "fullname": p.fullname,
            "email": p.email,
            "record_count": record_count,
            "last_urgency": last_urgency,
            "last_check_date": last_date,
        })

    return result