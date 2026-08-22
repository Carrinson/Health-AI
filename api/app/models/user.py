import enum 
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base 

class UserRole(str, enum.Enum):
    """
    the four roles from the spec. Inheriting from str means it serialises 
    to JSON as 'patient' rather than an opaque enum reference. """

    PATIENT = "patient"
    DOCTOR = "doctor"
    HOSPITAL_ADMIN = "hospital_admin"
    PLATFORM_ADMIN = "platform_admin"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email:Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Never the password itself - only a bcrypt hash. if this datbase leaks,
    # the hashes are useless without an enormous amount of compute.
    hashed_password: Mapped[str] = mapped_column(String(255))

    fullname: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default= UserRole.PATIENT)
    is_active: Mapped[bool] = mapped_column(default=True)

    # server_default means Postgres sets the timestamp, not Python - so it's 
    # correct regardless of which machine inserted the row.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
