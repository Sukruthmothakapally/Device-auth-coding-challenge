from fastapi import FastAPI
from routes import router

app = FastAPI(title="Auth API", description="Biometric verification")

app.include_router(router)
