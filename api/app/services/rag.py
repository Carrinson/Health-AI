"""
RAG retrieval over the curated medical corpus. Embeddings are computed
ONCE at startup and kept in memory — the corpus is small (60 entries),
so there's no need for a real vector database; a simple in-memory cosine
similarity search is fast enough and much simpler to reason about.
"""

from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from app.data.medical_corpus import CORPUS


@lru_cache
def get_embedder() -> SentenceTransformer:
    """Loaded once, cached for the life of the process. This is the
    single biggest one-time cost in the whole chatbot pipeline — a few
    seconds at first use, then free."""
    return SentenceTransformer("all-MiniLM-L6-v2")


@lru_cache
def get_corpus_embeddings() -> np.ndarray:
    """Embeds every corpus entry once. Cached alongside the embedder so
    this only runs the first time it's needed, not on every request."""
    model = get_embedder()
    texts = [entry["text"] for entry in CORPUS]
    return model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)


def retrieve(query: str, top_k: int = 3) -> list[dict]:
    """Returns the top_k most relevant corpus entries for a query, each
    with a similarity score. Since embeddings are normalized, cosine
    similarity is just a dot product — cheap and exact at this scale."""
    model = get_embedder()
    corpus_embeddings = get_corpus_embeddings()

    query_embedding = model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]
    scores = corpus_embeddings @ query_embedding

    top_indices = np.argsort(scores)[-top_k:][::-1]

    return [
        {
            "topic": CORPUS[i]["topic"],
            "text": CORPUS[i]["text"],
            "score": round(float(scores[i]), 4),
        }
        for i in top_indices
    ]