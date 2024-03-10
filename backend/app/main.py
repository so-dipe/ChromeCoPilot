from fastapi import FastAPI, Request, HTTPException, Form
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from .routes.messaging import router as messaging_router
from .auth.login import router as login_router
from .auth.oauth.google_oauth import router as google_oauth_router
from .routes.chat import router as chat_router
from config.config import Config
import requests
from pydantic import BaseModel
from typing import Annotated

app = FastAPI()

app.include_router(messaging_router, prefix='/api/v1/messaging')
app.include_router(login_router, prefix='/auth')
app.include_router(google_oauth_router, prefix='/auth/oauth/google')
app.include_router(chat_router, prefix='/api/v1/chat')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"text": "Welcome to the Chrome CoPilot"}

@app.get("/callback")
async def callback(request: Request):
    try:
        code = request.query_params.get('code')
        return RedirectResponse(f"/auth/oauth/google/callback?code={code}")
    except Exception as e:
        print(e)

@app.post("/refresh_token")
async def refresh_token(refresh_token: Annotated[str, Form()]):
    url = f"https://securetoken.googleapis.com/v1/token?key={Config.FIREBASE_API_KEY}"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }
    try:
        response = requests.post(url, data=payload, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to refresh token")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")