from datetime import date as date_type, datetime, timedelta
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
    """A doctor sets ONE recurring weekly window at a time. Calling this
    repeatedly for different days builds up their full week — there's no
    bulk-set endpoint, which is fine for a demo but worth noting as a UX
    gap in a real product."""
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
    a doctor on a specific date — this is what real_appointment scheduling
    actually needs, replacing the old 'book 24h out, no questions asked'
    placeholder.
    """
    weekday = date.weekday()
    windows = (
        db.query(DoctorAvailability)
        .filter(DoctorAvailability.doctor_id == doctor_id, DoctorAvailability.day_of_week == weekday)
        .all()
    )
    if not windows:
        return []

    # Existing bookings that day, so we can mark overlapping slots unavailable.
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
    booked_times = {b.scheduled_for for b in booked}

    slots = []
    for w in windows:
        current = datetime.combine(date, w.start_time)
        window_end = datetime.combine(date, w.end_time)
        step = timedelta(minutes=w.slot_minutes)
        while current + step <= window_end:
            slots.append(SlotOut(
                start=current.isoformat(),
                end=(current + step).isoformat(),
                available=current not in booked_times,
            ))
            current += step

    return slots