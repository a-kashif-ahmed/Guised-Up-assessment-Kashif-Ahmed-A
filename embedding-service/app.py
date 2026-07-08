from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import numpy as np
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Model loaded.")

@app.get("/")
def home():
    return {
        "service": "Embedding API",
        "status": "running"
    }


@app.post("/embed")
def embed():

    body = request.get_json()

    if not body:
        return jsonify({
            "error": "Missing JSON body."
        }), 400

    text = body.get("text")

    if not text:

        return jsonify({
            "error": "Missing text."
        }), 400

    embedding = model.encode(
        text,
        normalize_embeddings=True
    )

    return jsonify({

        "embedding": embedding.tolist(),

        "dimensions": len(embedding)

    })


@app.post("/embed/batch")
def batch():

    body = request.get_json()

    texts = body.get("texts", [])

    if len(texts) == 0:

        return jsonify({
            "error": "texts required"
        }), 400

    vectors = model.encode(
        texts,
        normalize_embeddings=True
    )

    return jsonify({

        "embeddings": vectors.tolist(),

        "count": len(texts)

    })


@app.get("/health")
def health():

    return jsonify({

        "status": "healthy",

        "model": "all-MiniLM-L6-v2"

    })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )