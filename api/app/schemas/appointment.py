from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.appointment import AppointmentStatus


class AppointmentCreate(BaseModel):
    doctor_id: int
    scheduled_for: datetime
    reason: str
    consultation_type: str = "in_person"  # "in_person" | "video"

class AppointmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    doctor_id: int
    scheduled_for: datetime
    reason: str
    status: AppointmentStatus
    created_at: datetime
    consultation_type: str
    video_room_id: str | None = None


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus

