import vertexai
from vertexai.generative_models import GenerativeModel, Part, Content

vertexai.init(project="interviewguy", location="us-central1")

model = GenerativeModel("gemini-pro")

def generate_response(prompt, history=None):
    if history:
        history = apply_chat_template(history)
        chat = model.start_chat(history=history)
        response = chat.send_message(prompt, stream=True)
    else:
        response = model.generate_content(prompt, stream=True)
    return response

def apply_chat_template(history: list):
    system_prompt = ""
    new_history = []
    for message in history:
        if message["role"] == "system":
            system_prompt += message["content"] + "\n"
        else:
            role = message["role"]
            new_history.append(Content(Part.from_text(message["content"]), role=role))

    return system_prompt, new_history

def save_chat_response(prompt, response, history):
    history.extend(
        [
            {"role": "user", "content": prompt},
            {"role": "model", "content": response}
        ]
    )

class GeminiModelClient:
    def __init__(self):
        self.model = GenerativeModel("gemini-pro")

    def generate_response(self, prompt, history=None, stream=False):
        try:
            if history:
                history, _ = self.apply_chat_template(history)
                chat = self.model.start_chat(history=history)
                response = chat.send_message(prompt, stream=stream)
            else:
                response = self.model.generate_content(prompt, stream=stream)
        except Exception as e:
            response = None
            print("Error generating response:", e)
        return response

    def apply_chat_template(self, history: list):
        system_prompt = ""
        new_history = []
        for message in history:
            if message["role"] == "system":
                system_prompt += message["content"] + "\n"
            else:
                role = message["role"]
                part = Part.from_text(message["content"])
                new_history.append(
                    Content(role=role, parts=[part])
                )

        return new_history, system_prompt
    
    def append(self, prompt, response, history):
        history.extend(
            [
                {"role": "user", "content": prompt},
                {"role": "model", "content": response}
            ]
        )
        return history

    def generate_chat_title(self, prompt, response, history=[]):
        try:        
            system = """
            Your job is to generate a title for the following chat, make sure it
            is short and concise.
            """
            print(prompt, response)
            contents = [
                Content(role="user", parts=[Part.from_text(prompt)]),
                Content(role="model", parts=[Part.from_text(response)]),
                Content(role="user", parts=[Part.from_text(system)])
            ]
            response = self.model.generate_content(contents, stream=False)
            return response.text
        except Exception as e:
            print("Error generating chat title:", e)
            return None

    # def save_history(self, user_id, chat_id, history):
    #     self.redis_client.hset(user_id, chat_id, history)

    # def get_history(self, user_id, chat_id):
    #     return self.redis_client.hget(user_id, chat_id)
