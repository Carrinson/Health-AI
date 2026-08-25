"""Rule-based emergency escalation.

This layer exists because the model cannot be trusted with urgency. It was
trained on a dataset with no concept of severity, and a probabilistic model
will occasionally rank a benign condition highest for a genuinely dangerous
symptom combination. A missed emergency is the one failure mode that must not
happen, so a deterministic rule sits ON TOP of the model and overrides it.

Design principle: rules can only ESCALATE, never de-escalate. If no rule fires,
the model's output stands. If any rule fires, urgency becomes EMERGENCY
regardless of what the model said.
"""

from enum import Enum

class Urgency(str, Enum):
    INSUFFICIENT_INFO = "insufficient_info"
    ROUTINE = "see_a_doctor"
    URGENT = "urgent_care"
    EMERGENCY = "emergency"

# Each rule: (name, required symptoms, message). ALL symptoms in the tuple must
# be present for the rule to fire — combinations, not single symptoms, because
# chest pain alone is common and rarely an emergency, while chest pain WITH
# breathlessness is a different matter.

RED_FLAG_RULES: list[tuple[str, tuple[str, ...], str]] = [
    (
        "possible_cardiac_event",
        ("chest_pain", "breathlessness"),
        "Chest pain with difficulty breathing can indicate a heart attack. "
        "Seek emergency care immediately.",
    ),
    (
        "possible_cardiac_event_palpitations",
        ("chest_pain", "sweating", "fast_heart_rate"),
        "Chest pain with sweating and a racing heart requires immediate "
        "assessment. Seek emergency care.",
    ),
    (
        "possible_stroke",
        ("altered_sensorium", "weakness_of_one_body_side"),
        "Sudden confusion with one-sided weakness can indicate a stroke. "
        "Seek emergency care immediately — time is critical.",
    ),
    (
        "possible_stroke_speech",
        ("slurred_speech", "weakness_of_one_body_side"),
        "Slurred speech with one-sided weakness can indicate a stroke. "
        "Seek emergency care immediately — time is critical.",
    ),
    (
        "possible_meningitis",
        ("high_fever", "stiff_neck", "vomiting"),
        "High fever with neck stiffness and vomiting requires urgent "
        "assessment. Seek emergency care.",
    ),
    (
        "reduced_consciousness",
        ("coma",),
        "Loss of consciousness is a medical emergency. Call emergency "
        "services immediately.",
    ),
    (
        "significant_gi_bleeding",
        ("stomach_bleeding", "dizziness"),
        "Internal bleeding with dizziness may indicate significant blood "
        "loss. Seek emergency care.",
    ),
    (
        "possible_gi_bleed",
        ("bloody_stool", "dizziness"),
        "Blood in stool with dizziness may indicate significant blood loss. "
        "Seek emergency care.",
    ),
    (
        "acute_liver_failure",
        ("acute_liver_failure",),
        "Signs of acute liver failure require immediate hospital assessment.",
    ),
    (
        "severe_dehydration",
        ("vomiting", "dehydration", "sunken_eyes"),
        "Persistent vomiting with dehydration can deteriorate quickly, "
        "particularly in children and older adults. Seek urgent care.",
    ),
]

def check_red_flags(symptoms: dict[str, int]) -> list[dict]:
    """Returns every rule that fired. Empty list means nothing triggered."""
    present = {name for name, value in symptoms.items() if value == 1}

    return [
        {"rule": rule_name, "message": message}
        for rule_name, required, message in RED_FLAG_RULES
        if set(required).issubset(present)
    ]

def determine_urgency(top_probability: float, has_red_flags: bool) -> Urgency:
    """
    Confidence measures how CERTAIN the model is, not how SEVERE the
    condition is — this dataset carries no severity signal at all. So
    confidence can only answer one question: is there enough signal to
    say anything at all? It cannot tell self-care apart from routine care,
    and pretending otherwise would be a fabricated distinction.

    Red flags are the only genuine severity signal in this system.
    """
    if has_red_flags:
        return Urgency.EMERGENCY
    if top_probability < 0.30:
        return Urgency.INSUFFICIENT_INFO
    return Urgency.ROUTINE