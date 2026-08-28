import json
from typing import Annotated

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from fastapi import APIRouter
from sqlalchemy import or_, and_

from app.core.deps import get_current_user  # add to top-level imports properly
from app.core.security import decode_access_token
from app.database import SessionLocal, get_db
from app.models.chat_message import ChatMessage
from app.models.user import User

router = APIRouter(prefix="/ws", tags=["chat"])


class ConnectionManager:
    """Tracks which user_id is connected on which WebSocket, so a message
    from patient->doctor can be pushed to the doctor's live connection if
    they're online, in addition to being saved to the database regardless."""

    def __init__(self):
        self.active: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.active[user_id] = ws

    def disconnect(self, user_id: int):
        self.active.pop(user_id, None)

    async def send_to(self, user_id: int, message: dict):
        ws = self.active.get(user_id)
        if ws:
            await ws.send_json(message)


manager = ConnectionManager()


@router.websocket("/chat")
async def chat_endpoint(websocket: WebSocket, token: str):
    """Token passed as a query param, since WebSocket connections can't
    carry an Authorization header the way normal HTTP requests do."""
    payload = decode_access_token(token)
    if payload is None:
        await websocket.close(code=4001)
        return

    db: Session = SessionLocal()
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user:
        await websocket.close(code=4001)
        db.close()
        return

    await manager.connect(user.id, websocket)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            recipient_id = data["recipient_id"]
            content = data["content"]

            # Persist first — a message must survive even if the recipient
            # is offline right now. Live delivery is a bonus, not the
            # source of truth.
            msg = ChatMessage(sender_id=user.id, recipient_id=recipient_id, content=content)
            db.add(msg)
            db.commit()
            db.refresh(msg)

            payload_out = {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
            }

            # Deliver live if the recipient is connected right now.
            await manager.send_to(recipient_id, payload_out)
            # Echo back to sender so their own UI updates immediately.
            await websocket.send_json(payload_out)

    except WebSocketDisconnect:
        manager.disconnect(user.id)
    finally:
        db.close()


@router.get("/history/{other_user_id}")
def get_history(
    other_user_id: int,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):

    messages = (
        db.query(ChatMessage)
        .filter(
            or_(
                and_(ChatMessage.sender_id == user.id, ChatMessage.recipient_id == other_user_id),
                and_(ChatMessage.sender_id == other_user_id, ChatMessage.recipient_id == user.id),
            )
        )
        .order_by(ChatMessage.created_at)
        .all()
    )
    return [
        {"id": m.id, "sender_id": m.sender_id, "content": m.content, "created_at": m.created_at.isoformat()}
        for m in messages
    ]

@router.get("/contacts")
def get_contacts(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Who this user can message. Patients see doctors they've booked an
    appointment with; doctors see patients who've booked with them.
    Deliberately restrictive — patients shouldn't be able to message
    doctors they have no relationship with."""
    from app.models.appointment import Appointment
    from app.models.user import UserRole

    if user.role == UserRole.PATIENT:
        doctor_ids = (
            db.query(Appointment.doctor_id)
            .filter(Appointment.patient_id == user.id)
            .distinct()
            .all()
        )
        ids = [d[0] for d in doctor_ids]
        contacts = db.query(User).filter(User.id.in_(ids)).all()
    else:
        patient_ids = (
            db.query(Appointment.patient_id)
            .filter(Appointment.doctor_id == user.id)
            .distinct()
            .all()
        )
        ids = [p[0] for p in patient_ids]
        contacts = db.query(User).filter(User.id.in_(ids)).all()

    return [{"id": c.id, "fullname": c.fullname} for c in contacts]