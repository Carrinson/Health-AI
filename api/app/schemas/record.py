from datetime import datetime
from email import contentmanager
from unittest.mock import Base 

from pydantic import BaseModel, ConfigDict
from pytest import Config

from app.models.record import RecordType

class RecordCreate(BaseModel):
    record_type: RecordType
    title: str
    content: str #JSON-as-string; caller is responsible for the shape 

class RecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    record_type: RecordType
    title: str
    content: str
    created_at: datetime

