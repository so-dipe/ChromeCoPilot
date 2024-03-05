from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.messaging import router as messaging_router

app = FastAPI()

app.include_router(messaging_router, prefix='/api/v1/chat')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.get("/")
def index():
    return {"Welcome to the Chrome CoPilot"}