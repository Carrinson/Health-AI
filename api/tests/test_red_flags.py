from app.services.red_flags import Urgency, check_red_flags, determine_urgency

def test_cardiac_combination_fires():
    flags = check_red_flags({"chest_pain": 1, "breathlessness": 1})
    assert any(f["rule"] == "possible_cardiac_event" for f in flags)

def test_chest_pain_alone_does_not_fire():
    """Rules require COMBINATIONS. Chest pain alone is common and usually
    benign — firing on it would train users to ignore the warnings."""
    assert check_red_flags({"chest_pain": 1}) == []

def test_red_flag_overrides_high_confidence():
    """The core safety guarantee: no matter how confident the model is in a
    benign diagnosis, a red flag escalates to EMERGENCY."""
    assert determine_urgency(0.99, has_red_flags=True) == Urgency.EMERGENCY

def test_low_confidence_defers_to_doctor():
    """Below 0.30, there isn't enough signal to say anything useful —
    the honest answer is 'insufficient information', not a guess."""
    assert determine_urgency(0.10, has_red_flags=False) == Urgency.INSUFFICIENT_INFO

def test_moderate_confidence_routes_to_doctor():
    assert determine_urgency(0.45, has_red_flags=False) == Urgency.ROUTINE