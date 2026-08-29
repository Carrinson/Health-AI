from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import require_roles

from app.core.deps import get_current_user
from app.database import get_db
from app.models.audit_log import PredictionAuditLog
from app.models.escalation import AssistantEscalation
from app.models.push_token import PushToken
from app.models.user import User, UserRole
from app.services.llm import generate_answer
from app.services.push import send_push_notification
from app.services.rag import retrieve

router = APIRouter(prefix="/assistant", tags=["assistant"])


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: list[str]
    escalated: bool = False
    disclaimer: str = (
        "This is a demonstration assistant, not medical advice. "
        "For urgent symptoms, use the Symptom Checker or contact a doctor."
    )


@router.post("/ask", response_model=AskResponse)
async def ask_assistant(
    payload: AskRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    context = retrieve(payload.question, top_k=3)
    answer = await generate_answer(payload.question, context)

    # Every AI-generated output gets logged here, same as predictions.
    log = PredictionAuditLog(
        user_id=user.id,
        endpoint="assistant/ask",
        model_name="qwen2.5:3b",
        model_version="rag-v1",
        input_summary=payload.question[:500],
        output_summary=answer[:500],
        red_flag_triggered=False,
        urgency=None,
    )
    db.add(log)

    # Detection is based on which CORPUS ENTRIES were retrieved, not on
    # parsing the model's free-text answer — the model's wording varies,
    # but our own corpus tags are something we fully control and trust.
    is_emergency = any(c.get("emergency") for c in context)

    if is_emergency:
        escalation = AssistantEscalation(
            patient_id=user.id,
            question=payload.question,
            answer=answer,
            matched_topics=", ".join(c["topic"] for c in context),
        )
        db.add(escalation)

        doctor_tokens = (
            db.query(PushToken)
            .join(User, User.id == PushToken.user_id)
            .filter(User.role == UserRole.DOCTOR)
            .all()
        )
        for t in doctor_tokens:
            await send_push_notification(
                t.expo_push_token,
                title="Urgent: patient assistant query",
                body=f"{user.fullname} asked about a possible emergency symptom.",
            )

    db.commit()

    return AskResponse(answer=answer, sources=[c["topic"] for c in context], escalated=is_emergency)


@router.get("/escalations")
def list_escalations(
    doctor: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    rows = (
        db.query(AssistantEscalation)
        .order_by(AssistantEscalation.reviewed, AssistantEscalation.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "question": r.question,
            "answer": r.answer,
            "matched_topics": r.matched_topics,
            "reviewed": r.reviewed,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.patch("/escalations/{escalation_id}/review")
def mark_reviewed(
    escalation_id: int,
    doctor: Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.PLATFORM_ADMIN))],
    db: Annotated[Session, Depends(get_db)],
):
    row = db.query(AssistantEscalation).filter(AssistantEscalation.id == escalation_id).first()
    if row:
        row.reviewed = True
        row.reviewed_by_id = doctor.id
        db.commit()
    return {"status": "ok"}