from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from ..models.gemini_vertexai import GeminiModelClient
from pydantic import BaseModel
import uuid
from firebase_rtdb.firebase import FirebaseRTDB
from config.config import Config
from ..auth.firebase import get_uid_and_token
from .messaging_utils import get_response_stream

class ChatModel(BaseModel):
    prompt: str
    chat_id: str = None
    

router = APIRouter()

firebase = FirebaseRTDB(Config.FIREBASE_RTDB_URL)
gemini = GeminiModelClient()

@router.post("/stream_response")
async def stream_resp(chat: ChatModel, user: str = Depends(get_uid_and_token)):
    user_id, token = user
    try:
        history = firebase.get_chat(user_id, chat.chat_id, token) if chat.chat_id else {}
        messages = history.get('messages', [])
        response = gemini.generate_response(chat.prompt, history=messages, stream=True)
        data = {
            "response": response,
            "chat": chat,
            "history": history,
            "user_id": user_id,
            "token": token 
        }
        return StreamingResponse(get_response_stream(data))
    except Exception as e:
        print(e)
        return {"text": "Error generating response"}

@router.post("/generate_response")
async def generate_chat_response(chat: ChatModel):
    try:
        if chat.chat_id is None:
            chat.chat_id = str(uuid.uuid4())
            firebase.create_chat(chat.user_id, str(chat.chat_id))
        history = firebase.get_chat(chat.user_id, chat.chat_id) if chat.chat_id else []
        response = gemini.generate_response(chat.prompt, history)
        history = firebase.append_history(history, chat.prompt, response.text)
        firebase.save_chat(chat.user_id, chat.chat_id, history)
        return {"text": response.text, "chat_id": chat.chat_id}
    except Exception as e:
        print(e)
        return {"text": "Error generating response"}
    


