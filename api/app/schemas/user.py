from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import UserRole

class UserCreate(BaseModel):
    """What a client may send. Note there is no 'role' field - otherwise anyone 
    could register themselves a platform_admin. Roles are assigned, not chosen."""

    email: EmailStr
    password:str
    fullname: str


class UserOut(BaseModel):
    """What we send back. hashed password is absent by design - Pydantic only 
    serialises fields declared here, so a leak can't happen by accident"""

    model_config = ConfigDict(from_attributes=True) #allows reading from ORM objects

    id: int 
    email:EmailStr
    fullname: str
    role: UserRole
    is_active: bool
    created_at: datetime

class Token(BaseModel):
        access_token: str
        token_type: str = "brearer"