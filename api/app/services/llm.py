"""
Thin client for the locally-running Ollama instance. Ollama listens on
localhost:11434 by default — since it runs directly on the VPS host (not
in Docker), the API container needs to reach it via the host, not via a
Docker service name.
"""

import httpx

OLLAMA_URL = "http://host.docker.internal:11434/api/generate"
# NOTE: host.docker.internal works on Docker Desktop (Mac/Windows) but is
# NOT reliable on Linux hosts — which is exactly what the VPS is. On
# Linux, containers reach the host via the bridge gateway IP instead.
# Confirmed gateway from earlier tonight: 172.17.0.1
OLLAMA_URL_LINUX = "http://172.17.0.1:11434/api/generate"

SYSTEM_PROMPT = """You are a health information assistant for a demonstration app.

STRICT RULES, never break these:
- You are NOT a doctor and must never provide a diagnosis.
- NEVER suggest specific medication dosages or drug combinations.
- NEVER tell someone what condition they definitely have.
- If the retrieved context mentions emergency care is needed, say so clearly and firmly.
- Base your answer ONLY on the provided context below. If the context doesn't cover the question, say you don't have enough information and suggest the Symptom Checker or a doctor.
- Keep answers short and clear — two to four sentences.
- Always end by reminding the user this is not medical advice.
"""


async def generate_answer(question: str, context: list[dict]) -> str:
    context_text = "\n\n".join(f"[{c['topic']}] {c['text']}" for c in context)

    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"Context:\n{context_text}\n\n"
        f"Question: {question}\n\n"
        f"Answer:"
    )

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            OLLAMA_URL_LINUX,
            json={"model": "qwen2.5:3b", "prompt": prompt, "stream": False},
        )
        response.raise_for_status()
        return response.json()["response"].strip()