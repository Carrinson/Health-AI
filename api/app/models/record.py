from datetime import datetime
import enum

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RecordType(str, enum.Enum):
    SYMPTOM_CHECK = "symptom_check"      # a saved triage result
    LAB_REPORT = "lab_report"            # uploaded document, future OCR target
    NOTE = "note"                        # free-text entry
    RISK_ASSESSMENT = "risk_assessment"  # a saved diabetes/heart risk result


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Every record belongs to exactly one patient. ondelete="CASCADE" means
    # deleting a user cleans up their records automatically — relevant since
    # this is a demo and test accounts will get deleted.
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    record_type: Mapped[RecordType] = mapped_column(Enum(RecordType))
    title: Mapped[str] = mapped_column(String(255))

    # JSON-as-text rather than a JSONB column. Records vary wildly in shape
    # (a triage result has predictions+urgency, a note has just text) — a
    # rigid schema per record type would mean a new table for each one.
    # Text keeps this simple for a demo; a real system would use JSONB with
    # per-type validation.
    content: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    patient = relationship("User", backref="records")