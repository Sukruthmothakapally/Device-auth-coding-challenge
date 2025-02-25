import logging
from fastapi import APIRouter, HTTPException
from models import UserCreate, UserLogin, User 
from storage import add_user, get_user
from utils import is_valid_email, validate_device_token

logger = logging.getLogger(__name__)

router = APIRouter()

# Endpoint 1: On Register Button
@router.post("/register", response_model=User)
async def register(user: UserCreate):
    logger.info(f"Register attempt with email: {user.email}")
    
    if not is_valid_email(user.email):
        logger.warning(f"Invalid email format: {user.email}")
        raise HTTPException(status_code=400, detail="Invalid email format")

    if get_user(user.email):
        logger.warning(f"User already registered with email: {user.email}")
        raise HTTPException(status_code=400, detail="User already registered")

    new_user = add_user(user.email)
    logger.info(f"User registered successfully: {new_user}")
    return new_user

# Endpoint 2: On Login Button
@router.post("/login", response_model=User)
async def login(user: UserLogin):
    logger.info(f"Login attempt with email: {user.email}, device_id: {user.device_id}")

    if not is_valid_email(user.email):
        logger.warning(f"Invalid email format: {user.email}")
        raise HTTPException(status_code=400, detail="Invalid email format")

    user_data = get_user(user.email)
    if not user_data:
        logger.warning(f"User not found: {user.email}")
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    
    if user.device_id and user.expires:
        token = validate_device_token(user.device_id)
        if not token or token["expires"] < user.expires:
            logger.warning(f"Authentication failed or token expired for device_id: {user.device_id}")
            raise HTTPException(status_code=401, detail="Authentication failed or token expired")

    logger.info(f"Login successful for email: {user.email}")
    return user_data
