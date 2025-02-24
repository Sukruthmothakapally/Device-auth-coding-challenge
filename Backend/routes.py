from fastapi import APIRouter, HTTPException
from models import UserCreate, UserLogin, User 
from storage import add_user, get_user
from utils import is_valid_email, validate_device_token

router = APIRouter()

# endpoint 1: On Register Button
@router.post("/register", response_model=User)
async def register(user: UserCreate):
    if not is_valid_email(user.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    if get_user(user.email):
        raise HTTPException(status_code=400, detail="User already registered")

    new_user = add_user(user.email)
    return new_user

# endpoint 2: On Login Button
@router.post("/login", response_model=User)
async def login(user: UserLogin):
    if not is_valid_email(user.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    user_data = get_user(user.email)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    
    # Validate device authentication (token validation)
    if user.device_id and user.expires:
        token = validate_device_token(user.device_id)
        if not token or token["expires"] < user.expires:
            raise HTTPException(status_code=401, detail="Authentication failed or token expired")

    return user_data