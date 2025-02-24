from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str

class User(BaseModel):
    id: int
    email: str

class UserLogin(BaseModel):
    email: str
    device_id: Optional[str] = None 
    expires: Optional[datetime] = None
