from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentOut, AppointmentStatusUpdate

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("", response_model=AppointmentOut, status_code=201)
def book_appointment(
    payload: AppointmentCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    doctor = db.query(User).filter(
        User.id == payload.doctor_id, User.role == UserRole.DOCTOR
    ).first()
    if not doctor:
        raise HTTPException(400, "Selected doctor does not exist")

    # Reject double-booking the exact same slot — the real availability
    # check (is this slot within the doctor's working hours) happens
    # client-side by only offering real slots from /availability/{id}/slots;
    # this is the server-side guard against a race or a stale UI.
    existing = db.query(Appointment).filter(
        Appointment.doctor_id == payload.doctor_id,
        Appointment.scheduled_for == payload.scheduled_for,
        Appointment.status != AppointmentStatus.CANCELLED,
    ).first()
    if existing:
        raise HTTPException(409, "That slot has just been booked by someone else")

    appt = Appointment(patient_id=user.id, **payload.model_dump())
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt

@router.get("", response_model=list[AppointmentOut])
def list_my_appointments(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """A patient sees appointments they booked; a doctor sees appointments
    booked with them. Same endpoint, different filter, based on role — this
    is exactly the kind of branching RBAC is meant to express."""
    q = db.query(Appointment)
    if user.role == UserRole.DOCTOR:
        q = q.filter(Appointment.doctor_id == user.id)
    else:
        q = q.filter(Appointment.patient_id == user.id)
    return q.order_by(Appointment.scheduled_for).all()


@router.patch("/{appointment_id}/status", response_model=AppointmentOut)
def update_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    user: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    """Only a doctor or admin can confirm/cancel/complete — a patient cannot
    mark their own appointment 'completed'."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(404, "Appointment not found")

    appt.status = payload.status
    db.commit()
    db.refresh(appt)
    return appt
@router.get("/doctors")
def list_doctors(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Any authenticated user can see the doctor list — needed to book.
    Returns only public fields, never anything from the auth table beyond
    what's necessary to pick a clinician."""
    doctors = db.query(User).filter(User.role == UserRole.DOCTOR).all()
    return [{"id": d.id, "fullname": d.fullname} for d in doctors]