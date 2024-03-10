import requests
from datetime import datetime

class FirebaseRTDB:
    def __init__(self, url):
        self.url = url

    def create_chat(self, user_id, chat_id, token):
        url = f"{self.url}/{user_id}/{chat_id}.json?auth={token}"
        try:
            json = {
                "title": "",
                "messages": [],
                "lastUpdated": datetime.now().isoformat() 
            }
            response = requests.put(url, json=json)
            if response.status_code != 200:
                print(response.json())
            return response.json()
        except Exception as e:
            print(e)

    def get_chat(self, user_id, chat_id, token):
        url = f"{self.url}/{user_id}/{chat_id}.json?auth={token}"
        try:
            response = requests.get(url)
            if response.status_code != 200:
                return response.json()
            if response.json() is None:
                return {}
            return response.json()
        except Exception as e:
            print(e)
            return []

    def save_chat(self, user_id, chat_id, history, token, title=None):
        url = f"{self.url}/{user_id}/{chat_id}.json?auth={token}"
        try:
            json = {
                "messages": history,
                "lastUpdated": datetime.now().isoformat()
            }
            if title:
                json["title"] = title
            response = requests.patch(url, json=json)
            if response.status_code != 200:
                print(response.json())
        except Exception as e:
            print(e)

    def delete_chat(self, user_id, chat_id, token):
        url = f"{self.url}/{user_id}/{chat_id}.json?auth={token}"
        try:
            response = requests.delete(url)
            if response.status_code != 200:
                print(response.json())
        except Exception as e:
            print(e)

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

    def get_chats(self, user_id, token):
        try:
            response = requests.get(f"{self.url}/{user_id}.json?auth={token}")
            if response.status_code != 200:
                print(response.json())
                return []
            if response.json() is None:
                return []
            return response.json()
        except Exception as e:
            print(e)
            return []