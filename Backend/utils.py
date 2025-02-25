# helper functions here
import re
from datetime import datetime, timedelta

import logging
import re
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# helper function for basic email validation
def is_valid_email(email: str) -> bool:
    is_valid = bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email))
    logger.debug(f"Email validation for {email}: {is_valid}")
    return is_valid

tokens_db = {}

# helper function to generate a device-bound token
def generate_device_token(user_id: int, device_id: str):
    expires = datetime() + timedelta(minutes=15)
    token = {"user_id": user_id, "device_id": device_id, "expires": expires}
    tokens_db[device_id] = token

    logger.info(f"Generated token for device {device_id} with expiration at {expires}")
    
    return token

# helper function to validate the device token
def validate_device_token(device_id: str):
    token = tokens_db.get(device_id)
    if token:
        logger.debug(f"Token found for device {device_id}: {token}")
        if token["expires"] > datetime():
            logger.debug(f"Token for device {device_id} is valid.")
            return token
        else:
            logger.warning(f"Token for device {device_id} has expired.")
    else:
        logger.warning(f"No token found for device {device_id}.")
    return None
