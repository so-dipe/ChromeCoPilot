from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from ..models.gemini_vertexai import GeminiModelClient
from pydantic import BaseModel
from config.config import Config
from ..auth.firebase import get_uid_and_token

class ChatModel(BaseModel):
    message: str
    history: list = []
    

router = APIRouter()

gemini = GeminiModelClient()
# print(gemini.generate_chat_title("what year was nigeria independent", "H"))

async def get_response_stream(response):
    chunks = ""
    for chunk in response:
        chunks += chunk.text
        yield chunk.text

@router.post("/stream_response")
async def stream_resp(chat: ChatModel, _: str = Depends(get_uid_and_token)):
    try:
        print(chat.history)
        response = gemini.generate_response(chat.message, history=chat.history, stream=True)
        return StreamingResponse(get_response_stream(response))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error, {e}")

@router.get("/get_chat_title")
async def get_chat_title(prompt, response, _: str = Depends(get_uid_and_token)):
    try:
        response = gemini.generate_chat_title(prompt, response)
        return {"text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error, {e}")


# @router.post("/generate_response")
# async def generate_chat_response(chat: ChatModel):
#     try:
#         if chat.chat_id is None:
#             chat.chat_id = str(uuid.uuid4())
#             firebase.create_chat(chat.user_id, str(chat.chat_id))
#         history = firebase.get_chat(chat.user_id, chat.chat_id) if chat.chat_id else []
#         response = gemini.generate_response(chat.prompt, history)
#         history = firebase.append_history(history, chat.prompt, response.text)
#         firebase.save_chat(chat.user_id, chat.chat_id, history)
#         return {"text": response.text, "chat_id": chat.chat_id}
#     except Exception as e:
#         print(e)
#         return {"text": "Error generating response"}
    


