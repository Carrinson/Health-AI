from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AssistantEscalation(Base):
    __tablename__ = "assistant_escalations"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    matched_topics: Mapped[str] = mapped_column(String(500))  # comma-separated, for quick display

    # Whether a doctor has looked at this — the review workflow, not just
    # the notification. A doctor marking this reviewed is a deliberate
    # action, distinct from the push notification simply having been sent.
    reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    reviewed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("User", foreign_keys=[patient_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])