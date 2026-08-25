from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.prediction import (
    RiskRequest, RiskResponse, SymptomRequest, TriageResponse, ConditionPrediction
)
from app.services.predictor import predict_risk, predict_triage
from app.services.red_flags import check_red_flags, determine_urgency

router = APIRouter(prefix="/predict", tags=["predictions"])


@router.post("/triage", response_model=TriageResponse)
def triage(
    payload: SymptomRequest,
    user: Annotated[User, Depends(get_current_user)],
):
    """Symptom checker. Authenticated so every prediction is attributable —
    which is what makes the audit log meaningful later."""
    if not payload.symptoms:
        raise HTTPException(400, "At least one symptom is required")

    predictions = predict_triage(payload.symptoms)

    # Red flags are evaluated on the RAW SYMPTOMS, independently of the model.
    # If the model were the input to this check, a model failure would silently
    # disable the safety net.
    red_flags = check_red_flags(payload.symptoms)

    urgency = determine_urgency(
        top_probability=predictions[0]["probability"],
        has_red_flags=bool(red_flags),
    )

    return TriageResponse(
        predictions=[ConditionPrediction(**p) for p in predictions],
        urgency=urgency.value,
        red_flags=red_flags,
    )


@router.post("/risk/diabetes", response_model=RiskResponse)
def diabetes_risk(
    payload: RiskRequest,
    user: Annotated[User, Depends(get_current_user)],
):
    return RiskResponse(**predict_risk("diabetes_risk", payload.values))


@router.post("/risk/heart", response_model=RiskResponse)
def heart_risk(
    payload: RiskRequest,
    user: Annotated[User, Depends(get_current_user)],
):
    return RiskResponse(**predict_risk("heart_risk", payload.values))