from functools import lru_cache
from pathlib import Path

import joblib 
import numpy as np

from app.config import get_settings

settings = get_settings()

MODEL_DIR = Path(settings.ml_model_dir)

@lru_cache
def load_model(name: str) -> dict:
    """Loads a saved model bumdle once and keeps it in memory.
    
    Reading a ..joblib from disk takes -100ms. Doing that per request would
    dominate the response time so cache - the model is stateless, 
    so one instance can safely serve every request
    """

    return joblib.load(MODEL_DIR / f"{name}.joblib")

def predict_triage(symptoms: dict[str, int], top_k: int = 3) -> list[dict]:
    """Symptoms in, ranked conditions out.

    The saved bundle carries `features` — the exact column order used during
    training. We rebuild the input vector in that order, defaulting anything
    the client didn't send to 0 (absent). Getting this order wrong wouldn't
    error; it would silently produce nonsense, which is far worse."""

    bundle = load_model("symptom_triage")
    model, features = bundle["model"], bundle ["features"]

    vector = np.array([[symptoms.get(f,0) for f in features]])
    probabilities = model.predict_proba(vector)[0]

    # argsort ascending, take the last top_k, reverse - highest first 
    top_indices = probabilities.argsort()[-top_k:][::-1]

    return [
        {"condition": model.classes_[i], "probability": round(float(probabilities[i]), 4)}
         for i in top_indices
    ]

def predict_risk(model_name: str, values: dict[str, float]) -> dict:
    """Binary risk model — returns a probability, not a yes/no.

    A screening tool should never assert 'you have diabetes'. It reports a
    likelihood, and the decision about what to do sits with a clinician."""

    bundle = load_model(model_name)
    model, features = bundle["model"], bundle["features"]

    vector = np.array([[values.get(f,0) for f in features]])
    probability = float(model.predict_proba(vector)[0][1])

    return {
        "risk_probability": round(probability, 4),
        # Threshold is 0,35, not the default 0.5. For screening, a missed case
        # is worse than a false alarm — someone wrongly flagged gets a
        # reassuring test, someone wrongly cleared goes home. Lowering the
        # threshold trades precision for recall deliberately.

        "elevated_risk": probability >= 0.35,
        "threshold_used": 0.35,

     }