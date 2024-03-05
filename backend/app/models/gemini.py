import google.generativeai as google_genai
from ...config.config import Config

google_genai.configure(api_key=Config.GOOGLE_GEMINI_API_KEY, )

model = google_genai.GenerativeModel("gemini-pro")

def generate_response(prompt, chat_history=None):
    if chat_history:
        chat = model.start_chat(history=chat_history)
        response = chat.send_message(prompt, stream=True)
    else:
        response = model.generate_content(prompt, stream=True)

    return response