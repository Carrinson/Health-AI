from datetime import time

from pydantic import BaseModel, ConfigDict


class AvailabilityCreate(BaseModel):
    day_of_week: int  # 0=Monday..6=Sunday
    start_time: time
    end_time: time
    slot_minutes: int = 30


class AvailabilityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    doctor_id: int
    day_of_week: int
    start_time: time
    end_time: time
    slot_minutes: int


class SlotOut(BaseModel):
    """A single bookable slot — computed, not stored."""
    start: str  # ISO datetime
    end: str
    available: bool