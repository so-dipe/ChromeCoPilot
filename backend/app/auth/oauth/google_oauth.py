import requests
from urllib.parse import urlencode
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse, Response
from config.config import Config
from ..firebase import get_token

router = APIRouter()

def authorization_code_for_token(code):
    url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": Config.WEB_CLIENT_ID,
        "client_secret": Config.WEB_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": Config.REDIRECT_URI
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    try:
        response = requests.post(url, data=payload, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            raise response.status_code
    except Exception as e:
        print(e)

def signin_with_token(token):
    payload = {
        "requestUri": "http://localhost:8000/",
        "postBody": f"id_token={token}&providerId=google.com",
        "returnSecureToken": True,
        "returnIdpCredential": True
    }

    headers = {
        "Content-Type": "application/json"
    }
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key={Config.FIREBASE_API_KEY}"

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            raise response.status_code
    except Exception as e:
        print(e)

@router.get("/signin")
async def signin():
    print(Config.REDIRECT_URI)
    params = {
        "client_id": Config.WEB_CLIENT_ID,
        "redirect_uri": Config.REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join([
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]).strip()
    }

    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)

    return RedirectResponse(url=GOOGLE_AUTH_URL)

@router.get("/callback")
async def callback(request: Request):
    code = request.query_params.get('code')
    response = authorization_code_for_token(code)
    token = response.get('id_token')
    if token:
        resp = Response("LOGIN SUCCESSFUL", status_code=200)
        resp.set_cookie("token", token)
        return resp

@router.get("/get_user")
async def verify(token: str = Depends(get_token)):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key={Config.FIREBASE_API_KEY}"

    payload = {
        "requestUri": "http://localhost:8000/",
        "postBody": f"id_token={token}&providerId=google.com",
        "returnSecureToken": True,
        "returnIdpCredential": True
    }

    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    
    