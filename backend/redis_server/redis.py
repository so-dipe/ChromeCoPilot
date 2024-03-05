import redis

redis_client = redis.Redis(host="localhost", port=6379)

class RedisClient:
    def __init__(self):
        self.redis_client = redis_client

    def get_history(self, user_id, chat_id):
        return self.redis_client.hget(user_id, chat_id)

    def save_history(self, user_id, chat_id, history):
        self.redis_client.hset(user_id, chat_id, history)

    def delete_history(self, user_id, chat_id):
        self.redis_client.hdel(user_id, chat_id)
