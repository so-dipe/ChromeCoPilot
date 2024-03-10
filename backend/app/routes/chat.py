from fastapi import APIRouter, HTTPException, Request, Depends, Path
from fastapi.responses import JSONResponse
from firebase_rtdb.firebase import FirebaseRTDB
from ..auth.firebase import verify_token, get_uid_and_token
from config.config import Config

router = APIRouter()

firebase = FirebaseRTDB(Config.FIREBASE_RTDB_URL)

@router.get("/c/{chat_id}")
async def retrieve_chat(chat_id: str = Path(...), user: str = Depends(get_uid_and_token)):
    try:
        user_id, token = user
        history = firebase.get_chat(user_id, chat_id, token)
        return JSONResponse(content=history)
    except Exception as e:
        print(f"Error getting chat {chat_id}", e)
        return JSONResponse(content={"messages": []})
    
@router.get("/{user_id}")
async def retrieve_chats(user_id: str, user: str = Depends(get_uid_and_token)):
    try:
        _, token = user
        chats = firebase.get_chats(user_id, token)
        return JSONResponse(content=chats)
    except Exception as e:
        print("error getting all chats", e)
        return JSONResponse(content={})
