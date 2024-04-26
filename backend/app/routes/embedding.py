from fastapi import APIRouter, Depends
from ..models.embedding import create_embeddings
from ..auth.firebase import get_uid_and_token
from pydantic import BaseModel
import json

class EmbedModel(BaseModel):
    sentences: list

router = APIRouter()

@router.post('/embed')
async def emded_sentences(embed: EmbedModel, _ = Depends(get_uid_and_token)):
    try:
        sentences = embed.sentences
        embeddings = create_embeddings(sentences=sentences)
        return {"embeddings": json.dumps(embeddings.tolist())}
    except Exception as e:
        print("Could not create embeddings", e)
        return {"error": "Could not create embeddings"}
