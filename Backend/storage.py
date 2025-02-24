# in-memory storage for now - DB will be added later on.
users_db = {}  # {email: {"id": int, "email": str}}

# to add a new user and generate a unique ID.
def add_user(email: str):
    
    user_id = len(users_db) + 1
    users_db[email] = {"id": user_id, "email": email}
    return users_db[email]

# retrieves a user by email.
def get_user(email: str):
    
    return users_db.get(email)
