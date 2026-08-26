from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from websockets import Router

from app.core.deps import get_current_user
from app.database import get_db
from app.models.record import MedicalRecord
from app.schemas.record import RecordCreate, RecordOut

from ..models.user import User

router = APIRouter(prefix="/records", tags=["records"])

@router.post("", response_model=RecordOut, status_code=201)
def create_record(
    payload: RecordCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Any authenticated user creates a record for THEMSELVES. There is no
    patient_id in the request body — taking it from the token, not the
    request, is what stops one patient writing records into another's file."""
    record = MedicalRecord(patient_id=user.id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("", response_model=list[RecordOut])
def list_my_records(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return (
        db.query(MedicalRecord)
        .filter(MedicalRecord.patient_id == user.id)
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )


@router.get("/{record_id}", response_model=RecordOut)
def get_record(
    record_id: int,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(404, "Record not found")

    # Ownership check happens HERE, not in the query filter above. Returning
    # 404 for "exists but isn't yours" (rather than 403) avoids confirming to
    # an attacker that a given record ID exists at all.
    if record.patient_id != user.id:
        raise HTTPException(404, "Record not found")

    return record
