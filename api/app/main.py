from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config import get_settings

from app.routers import auth, predictions
from app.routers import appointments, auth, predictions, records
from app.routers import monitoring
from app.routers import availability
from app.routers.chat import router as chat_router, ws_router as chat_ws_router
from app.routers import uploads
from app.routers import admin
from app.routers import assistant

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Decision-support demo. Not medical advice Not for clinical use.",
    version="0.1.0",
)

app.include_router(assistant.router)
app.include_router(admin.router)
app.include_router(chat_router)
app.include_router(chat_ws_router)
app.include_router(availability.router)
app.include_router(monitoring.router)
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(records.router)
app.include_router(appointments.router)
app.include_router(uploads.router)

# The browser requests from a different origin unless the server opts in.
# Your Next.js app runs on :3000, this api on :8000 - different origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://healthai.carrinson.xyz", "https://healthaiweb.carrinson.xyz/login"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    """Liveness check. Docker, nginx and UptimeRobot all poll this."""
    return {"status": "ok", "app": settings.app_name}

