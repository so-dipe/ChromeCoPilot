import requests
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession
from ..config.config import Config

scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/firebase.database",
]

credentials = service_account.Credentials.from_service_account_file(
    Config.SERVICE_ACCOUNT_PATH, scopes=scopes)

authed_session = AuthorizedSession(credentials)

class FirebaseRTDB:
    def __init__(self, url):
        self.url = url

    def create_chat(self, user_id, chat_id):
        authed_session.put(f"{self.url}/{user_id}/{chat_id}.json", json=[])

    def get_chat(self, user_id, chat_id):
        response = authed_session.get(f"{self.url}/{user_id}/{chat_id}.json")
        if response.json() is None:
            self.create(user_id, chat_id)
            return []
        return response.json()

    def save_chat(self, user_id, chat_id, history):
        authed_session.put(f"{self.url}/{user_id}/{chat_id}.json", json=history)

    def delete_chat(self, user_id, chat_id):
        authed_session.delete(f"{self.url}/{user_id}/{chat_id}.json")

    def append_history(self, history, prompt, response):
        history.extend(
            [
                {"role": "user", "content": prompt},
                {"role": "model", "content": response}
            ]
        )
        return history

    def delete_message(self, user_id, chat_id, message):
        history = self.get_chat(user_id, chat_id)
        idx = next((i for i, item in enumerate(history) if item["content"] == message), None)
        if idx:
            history.pop(idx)
            history.pop(idx)
            self.save_chat(user_id, chat_id, history)