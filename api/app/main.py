from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Decision-support demo. Not medical advice Not for clinical use.",
    version="0.1.0",
)

# The browser requests from a different origin unless the server opts in.
# Your Next.js app runs on :3000, this api on :8000 - different origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost: 3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    """Liveness check. Docker, nginx and UptimeRobot all poll this."""
    return {"status": "ok", "app": settings.app_name}

