import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.audit_log import PredictionAuditLog
from app.models.record import MedicalRecord, RecordType
from app.models.user import User
from app.schemas.prediction import (
    ConditionPrediction, RiskRequest, RiskResponse, SymptomRequest, TriageResponse,
)
from app.services.predictor import predict_risk, predict_triage
from app.services.red_flags import check_red_flags, determine_urgency

router = APIRouter(prefix="/predict", tags=["predictions"])
MODEL_VERSION = "v1-2026-08"


def _save_record(db: Session, user: User, record_type: RecordType, title: str, payload: dict) -> None:
    record = MedicalRecord(
        patient_id=user.id, record_type=record_type, title=title,
        content=json.dumps(payload),
    )
    db.add(record)
    db.commit()


def _audit_prediction(
    db: Session, user: User, endpoint: str, model_name: str,
    input_data: dict, output_data: dict,
    red_flag_triggered: bool = False, urgency: str | None = None,
) -> None:
    log = PredictionAuditLog(
        user_id=user.id, endpoint=endpoint, model_name=model_name,
        model_version=MODEL_VERSION,
        input_summary=json.dumps(input_data),
        output_summary=json.dumps(output_data),
        red_flag_triggered=red_flag_triggered, urgency=urgency,
    )
    db.add(log)
    db.commit()


@router.post("/triage", response_model=TriageResponse)
def triage(
    payload: SymptomRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not payload.symptoms:
        raise HTTPException(400, "At least one symptom is required")

    predictions = predict_triage(payload.symptoms)
    red_flags = check_red_flags(payload.symptoms)
    urgency = determine_urgency(
        top_probability=predictions[0]["probability"],
        has_red_flags=bool(red_flags),
    )

    response = TriageResponse(
        predictions=[ConditionPrediction(**p) for p in predictions],
        urgency=urgency.value,
        red_flags=red_flags,
    )

    _save_record(
        db, user, RecordType.SYMPTOM_CHECK,
        title=f"Symptom check - {predictions[0]['condition']}",
        payload=response.model_dump(),
    )
    _audit_prediction(
        db, user, "predict/triage", "symptom_triage",
        input_data=payload.model_dump(), output_data=response.model_dump(),
        red_flag_triggered=bool(red_flags), urgency=urgency.value,
    )

    return response


@router.post("/risk/diabetes", response_model=RiskResponse)
def diabetes_risk(
    payload: RiskRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    response = RiskResponse(**predict_risk("diabetes_risk", payload.values))

    _save_record(
        db, user, RecordType.RISK_ASSESSMENT,
        title="Diabetes risk screening", payload=response.model_dump(),
    )
    _audit_prediction(
        db, user, "predict/risk/diabetes", "diabetes_risk",
        input_data=payload.model_dump(), output_data=response.model_dump(),
    )

    return response


@router.post("/risk/heart", response_model=RiskResponse)
def heart_risk(
    payload: RiskRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    response = RiskResponse(**predict_risk("heart_risk", payload.values))

    _save_record(
        db, user, RecordType.RISK_ASSESSMENT,
        title="Heart disease risk screening", payload=response.model_dump(),
    )
    _audit_prediction(
        db, user, "predict/risk/heart", "heart_risk",
        input_data=payload.model_dump(), output_data=response.model_dump(),
    )

    return response