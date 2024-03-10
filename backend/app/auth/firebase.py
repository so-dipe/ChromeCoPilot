from fastapi import Header, HTTPException
from config.config import Config
import firebase_admin 
from firebase_admin import auth
from firebase_admin import credentials

cred = credentials.Certificate(Config.SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split("Bearer ")[1]
    return auth.verify_id_token(token).get("uid")

async def get_uid_and_token(authorization: str = Header(None)):
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        token = authorization.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token.get('uid'), token
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=419, detail="Token expired, please refresh")
    except auth.InvalidIdTokenError as e:
        print("invalid", e)
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    return authorization.split("Bearer ")[1]

