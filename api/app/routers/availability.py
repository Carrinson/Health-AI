from datetime import date as date_type, datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.availability import DoctorAvailability
from app.models.user import User, UserRole
from app.schemas.availability import AvailabilityCreate, AvailabilityOut, SlotOut

router = APIRouter(prefix="/availability", tags=["availability"])


@router.post("", response_model=AvailabilityOut, status_code=201)
def set_availability(
    payload: AvailabilityCreate,
    user: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    if payload.start_time >= payload.end_time:
        raise HTTPException(400, "start_time must be before end_time")

    entry = DoctorAvailability(doctor_id=user.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/mine", response_model=list[AvailabilityOut])
def my_availability(
    user: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    return db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == user.id).all()


@router.delete("/{availability_id}", status_code=204)
def delete_availability(
    availability_id: int,
    user: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    entry = db.query(DoctorAvailability).filter(DoctorAvailability.id == availability_id).first()
    if not entry or entry.doctor_id != user.id:
        raise HTTPException(404, "Availability entry not found")
    db.delete(entry)
    db.commit()


@router.get("/{doctor_id}/slots", response_model=list[SlotOut])
def get_available_slots(
    doctor_id: int,
    date: date_type,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Any authenticated patient calls this to see real bookable slots for
    a doctor on a specific date.

    Doctor availability windows (start_time/end_time) are treated as UTC
    clock times — a real product would store a timezone per doctor, but
    for this project, treating everything as UTC consistently is what
    fixes the display-vs-booking mismatch: the time shown to the user and
    the time actually sent back on booking must be the SAME value,
    unambiguously, regardless of the browser's local timezone.
    """
    weekday = date.weekday()
    windows = (
        db.query(DoctorAvailability)
        .filter(DoctorAvailability.doctor_id == doctor_id, DoctorAvailability.day_of_week == weekday)
        .all()
    )
    if not windows:
        return []

    day_start = datetime.combine(date, datetime.min.time())
    day_end = day_start + timedelta(days=1)
    booked = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doctor_id,
            Appointment.scheduled_for >= day_start,
            Appointment.scheduled_for < day_end,
            Appointment.status != AppointmentStatus.CANCELLED,
        )
        .all()
    )
    # Normalise stored (timezone-aware) appointment times to naive UTC for
    # comparison against the naive slot times we build below.
    booked_times = {
        b.scheduled_for.astimezone(timezone.utc).replace(tzinfo=None)
        for b in booked
    }

    slots = []
    for w in windows:
        current = datetime.combine(date, w.start_time)
        window_end = datetime.combine(date, w.end_time)
        step = timedelta(minutes=w.slot_minutes)
        while current + step <= window_end:
            # Explicitly tag as UTC on the way OUT to the client. This is
            # the actual fix: without this, the ISO string has no timezone
            # marker, and the browser was interpreting/re-sending it
            # inconsistently, producing the 1-hour shift.
            slots.append(SlotOut(
                start=current.replace(tzinfo=timezone.utc).isoformat(),
                end=(current + step).replace(tzinfo=timezone.utc).isoformat(),
                available=current not in booked_times,
            ))
            current += step

    return slots