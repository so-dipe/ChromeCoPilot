from sentence_transformers import SentenceTransformer

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def create_embeddings(sentences):
    return model.encode(sentences)