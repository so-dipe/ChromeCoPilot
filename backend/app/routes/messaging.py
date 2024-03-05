from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ..models.gemini_vertexai import GeminiModelClient
from pydantic import BaseModel
import uuid
from ...firebase_rtdb.firebase import FirebaseRTDB
from ...config.config import Config

class ChatModel(BaseModel):
    prompt: str
    user_id: str
    chat_id: str = None

router = APIRouter()

firebase = FirebaseRTDB(Config.FIREBASE_RTDB_URL)
gemini = GeminiModelClient()

@router.post("/stream_response")
async def stream_response(chat: ChatModel):
    if chat.chat_id is None:
        chat.chat_id = str(uuid.uuid4())
        firebase.create_chat(chat.user_id, str(chat.chat_id))

    history = firebase.get_chat(chat.user_id, chat.chat_id) if chat.chat_id else []
    response = gemini.generate_response(chat.prompt, history=history, stream=True)
    print(response)
    return StreamingResponse(get_response_stream(response, chat, history))

async def get_response_stream(response, chat, history):
    chunks = ""
    for chunk in response:
        chunks += chunk.text
        yield chunk.text
    history = firebase.append_history(history, chat.prompt, chunks)
    firebase.save_chat(chat.user_id, chat.chat_id, history)

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
    
@router.get("/get_chat")
async def get_chat(user_id: str, chat_id: str):
    try:
        history = firebase.get_chat(user_id, chat_id)
        return {"history": history}
    except Exception as e:
        print(e)
        return {"history": []}

@router.delete("/delete_chat")
async def delete_chat(user_id: str, chat_id: str):
    try:
        firebase.delete_chat(user_id, chat_id)
        return {"message": "Chat deleted"}
    except Exception as e:
        print(e)
        return {"message": "Error deleting chat"}


