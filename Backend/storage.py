# in-memory storage for now - DB will be added later on.

import logging

logger = logging.getLogger(__name__)

users_db = {}  # {email: {"id": int, "email": str}}

def add_user(email: str):
    user_id = len(users_db) + 1
    users_db[email] = {"id": user_id, "email": email}
    
    logger.info(f"User added: {users_db[email]}")
    
    return users_db[email]

def get_user(email: str):
    user = users_db.get(email)
    if user:
        logger.info(f"User found: {user}")
    else:
        logger.info(f"No user found for email: {email}")
    return user

