from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.appointment import AppointmentStatus


class AppointmentCreate(BaseModel):
    doctor_id: int
    scheduled_for: datetime
    reason: str


class AppointmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    doctor_id: int
    scheduled_for: datetime
    reason: str
    status: AppointmentStatus
    created_at: datetime


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus