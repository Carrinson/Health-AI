import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.record import MedicalRecord, RecordType
from app.models.user import User

router = APIRouter(prefix="/uploads", tags=["uploads"])

# Files land on the VPS's own disk, in a volume-mounted folder so they
# survive container restarts. A real product would use object storage
# (S3-compatible) instead — fine for a demo given the file count involved.
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/document", status_code=201)
async def upload_document(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
):
    """Stores the raw image and creates a placeholder record. OCR
    extraction happens as a follow-up step, not inline here — keeping
    upload fast and decoupled from processing."""
    ext = Path(file.filename or "upload.jpg").suffix or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = UPLOAD_DIR / filename

    contents = await file.read()
    filepath.write_bytes(contents)

    record = MedicalRecord(
        patient_id=user.id,
        record_type=RecordType.LAB_REPORT,
        title="Uploaded document (pending review)",
        content=f'{{"filename": "{filename}", "status": "uploaded"}}',
    )
    db.add(record)
    db.commit()

    return {"filename": filename, "status": "uploaded"}