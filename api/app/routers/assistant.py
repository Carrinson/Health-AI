from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.audit_log import PredictionAuditLog
from app.models.user import User
from app.services.llm import generate_answer
from app.services.rag import retrieve

router = APIRouter(prefix="/assistant", tags=["assistant"])


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: list[str]
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

    # Reuse the SAME audit log as every other AI feature in the app —
    # a chatbot answer is still an AI-generated output and belongs in the
    # same accountability trail as predictions.
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
    db.commit()

    return AskResponse(answer=answer, sources=[c["topic"] for c in context])