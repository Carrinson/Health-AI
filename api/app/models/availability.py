from datetime import time as time_type
from sqlalchemy import ForeignKey, Integer, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    day_of_week: Mapped[int] = mapped_column(Integer)
    start_time: Mapped[time_type] = mapped_column(Time)
    end_time: Mapped[time_type] = mapped_column(Time)
    slot_minutes: Mapped[int] = mapped_column(Integer, default=30)

    doctor = relationship("User")