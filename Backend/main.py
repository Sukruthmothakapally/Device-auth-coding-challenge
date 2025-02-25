import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

# Setting up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Auth API", description="Biometric verification")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
async def on_startup():
    logger.info("API started successfully.")
