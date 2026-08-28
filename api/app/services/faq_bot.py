# api/app/services/faq_bot.py
"""
Rule-based FAQ matcher — the fallback chatbot if full RAG doesn't land in
time. No LLM, no vector store. Matches user input against a curated
question bank using simple keyword overlap.

Deliberately conservative: if nothing matches well, it says so and defers
to the symptom checker or a real doctor, rather than guessing.
"""

FAQ_BANK = [
    {
        "keywords": ["fever", "temperature", "hot"],
        "answer": "A fever is generally a temperature above 38°C (100.4°F). "
                  "Rest, fluids, and paracetamol can help with mild fevers. "
                  "Seek care if it's above 39.5°C, lasts more than 3 days, "
                  "or comes with a stiff neck, rash, or difficulty breathing.",
    },
    {
        "keywords": ["headache", "migraine"],
        "answer": "Most headaches are manageable with rest, hydration, and "
                  "over-the-counter pain relief. Seek urgent care for a "
                  "sudden, severe headache unlike any before, especially "
                  "with vision changes, confusion, or a stiff neck.",
    },
    # ... 15-25 more entries covering common triage-model conditions
]


def match_faq(message: str) -> dict:
    message_lower = message.lower()
    best_match, best_score = None, 0

    for entry in FAQ_BANK:
        score = sum(1 for kw in entry["keywords"] if kw in message_lower)
        if score > best_score:
            best_match, best_score = entry, score

    if best_match and best_score > 0:
        return {
            "answer": best_match["answer"],
            "matched": True,
        }

    return {
        "answer": "I don't have specific guidance for that. Try the "
                  "Symptom Checker for a structured assessment, or "
                  "consult a doctor for anything you're concerned about.",
        "matched": False,
    }