from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PredictionAuditLog(Base):
    __tablename__ = "prediction_audit_log"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    # SET NULL rather than CASCADE here, deliberately: if a user account is
    # deleted, the fact that a prediction happened should still be
    # auditable — only the identity link is cleared, not the event itself.

    endpoint: Mapped[str] = mapped_column(String(100))       # e.g. "predict/triage"
    model_name: Mapped[str] = mapped_column(String(100))     # e.g. "symptom_triage"
    model_version: Mapped[str] = mapped_column(String(50))   # for now, a static tag —
                                                               # see note below

    input_summary: Mapped[str] = mapped_column(Text)   # JSON string of the request
    output_summary: Mapped[str] = mapped_column(Text)  # JSON string of the response

    red_flag_triggered: Mapped[bool] = mapped_column(default=False)
    urgency: Mapped[str] = mapped_column(String(30), nullable=True)  # null for risk models

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user = relationship("User")