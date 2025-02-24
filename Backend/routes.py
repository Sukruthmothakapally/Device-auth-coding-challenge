from fastapi import APIRouter, HTTPException
from models import UserCreate, UserLogin, User 
from storage import add_user, get_user
from utils import is_valid_email

router = APIRouter()

# endpoint 1: on register button
@router.post("/register", response_model=User) 
async def register(user: UserCreate):
    if not is_valid_email(user.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    if get_user(user.email):
        raise HTTPException(status_code=400, detail="User already registered")

    new_user = add_user(user.email)
    return new_user  


# endpoint 2: on login button
@router.post("/login", response_model=User) 
async def login(user: UserLogin):
    if not is_valid_email(user.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    user_data = get_user(user.email)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")

    return user_data