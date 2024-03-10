from firebase_rtdb.firebase import FirebaseRTDB
from config.config import Config

firebase = FirebaseRTDB(Config.FIREBASE_RTDB_URL)

async def get_response_stream(data):
    chunks = ""
    for chunk in data.get('response'):
        chunks += chunk.text
        yield chunk.text
    await handle_conversation(chunks, data)

async def handle_conversation(chunks, data):
    if data['history'].get('messages') is None:
        title = data['chat'].prompt
    else:
        title = None
    messages = data['history'].get('messages', [])
    history = firebase.append_history(messages, data['chat'].prompt, chunks)
    if data['chat'].chat_id:
        firebase.save_chat(data['user_id'], data['chat'].chat_id, history, data['token'], title)