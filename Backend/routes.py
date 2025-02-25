import logging
from fastapi import APIRouter, HTTPException
from models import UserCreate, UserLogin, User 
from storage import add_user, get_user
from utils import is_valid_email
from datetime import datetime, timezone

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
        # Pydantic already parses the ISO date string into a datetime object.
        client_expires = user.expires
        now = datetime.now(timezone.utc)
        if client_expires < now:
            logger.warning(f"Token expired: device_id {user.device_id} with expiration {client_expires}")
            raise HTTPException(status_code=401, detail="Authentication failed or token expired")
    else:
        logger.warning("Missing device token information")
        raise HTTPException(status_code=400, detail="Missing device token information")
    
    logger.info(f"Login successful for email: {user.email}")
    return user_data
