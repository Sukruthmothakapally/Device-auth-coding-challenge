from fastapi import APIRouter, HTTPException
from models import User
from storage import add_user, get_user
from utils import is_valid_email

router = APIRouter()

# endpoint 1: on register button
@router.post("/register", response_model=User)
async def register(email: str):
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    if get_user(email):
        raise HTTPException(status_code=400, detail="User already registered")

    user = add_user(email)
    return user

# endpoint 2: on login button
@router.post("/login", response_model=User)
async def login(email: str):
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    user = get_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")

    return user
