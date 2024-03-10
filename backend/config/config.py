from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    GOOGLE_GEMINI_API_KEY = os.environ.get("GOOGLE_GEMINI_API_KEY")
    FIREBASE_RTDB_URL = os.environ.get("FIREBASE_RTDB_URL")
    SERVICE_ACCOUNT_PATH = os.environ.get("SERVICE_ACCOUNT_PATH")
    FIREBASE_API_KEY = os.environ.get("FIREBASE_API_KEY")
    WEB_CLIENT_ID = os.environ.get("WEB_CLIENT_ID")
    WEB_CLIENT_SECRET = os.environ.get("WEB_CLIENT_SECRET")
    REDIRECT_URI = os.environ.get("REDIRECT_URI")
    NOTHING = os.environ.get("NEW")
