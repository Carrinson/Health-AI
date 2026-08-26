from pydantic import BaseModel, Field

DISCLAIMER = (
    "This is a demonstration system. It does not provide medical advice, "
    "diagnosis, or treatment. Always consult a qualified clinician."
)


class SymptomRequest(BaseModel):
    # A dict of symptom_name -> 1 (present). Unlisted symptoms default to 0
    # in the predictor, so clients only send what's present.
    symptoms: dict[str, int] = Field(
        examples=[{"chest_pain": 1, "breathlessness": 1, "sweating": 1}]
    )


class ConditionPrediction(BaseModel):
    condition: str
    probability: float


class TriageResponse(BaseModel):
    predictions: list[ConditionPrediction]
    urgency: str
    red_flags: list[dict]
    disclaimer: str = DISCLAIMER


class RiskRequest(BaseModel):
    values: dict[str, float] = Field(
        examples=[{"glucose": 145, "bmi": 31.2, "age": 52, "pregnancies": 2,
                   "bp": 80, "skin": 25, "insulin": 130, "pedigree": 0.5}]
    )


class RiskResponse(BaseModel):
    risk_probability: float
    elevated_risk: bool
    threshold_used: float
    disclaimer: str = DISCLAIMER
    top_factors: list[dict]