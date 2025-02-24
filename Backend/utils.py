# helper functions here
import re
from datetime import datetime, timedelta

# basic email validation
def is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email))

# In-memory token store
tokens_db = {}

# Helper function to generate a device-bound token
def generate_device_token(user_id: int, device_id: str):
    expires = datetime() + timedelta(minutes=15)  # Token expires in 15 minutes
    token = {"user_id": user_id, "device_id": device_id, "expires": expires}
    tokens_db[device_id] = token
    return token

# Helper function to validate the device token
def validate_device_token(device_id: str):
    token = tokens_db.get(device_id)
    if token and token["expires"] > datetime():
        return token
    return None