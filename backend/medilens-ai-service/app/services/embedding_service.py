
import os
from fastembed import TextEmbedding


class EmbeddingService:

    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            model_name = os.getenv(
                "EMBEDDING_MODEL",
                "BAAI/bge-small-en-v1.5"
            )
            cls._model = TextEmbedding(model_name=model_name)

        return cls._model

    @classmethod
    def generate_embedding(cls, text: str) -> list[float]:
        if not text or not text.strip():
            raise ValueError("Text cannot be empty.")

        model = cls.get_model()

        embedding = next(
            model.embed([text.strip()])
        )

        result = [float(value) for value in embedding]

        if len(result) != 384:
            raise ValueError(
                f"Expected 384 dimensions, received {len(result)}."
            )

        return result

    @classmethod
    def generate_embeddings(
        cls,
        texts: list[str]
    ) -> list[list[float]]:

        if not texts:
            return []

        model = cls.get_model()

        embeddings = model.embed(texts)

        results = [
            [float(value) for value in embedding]
            for embedding in embeddings
        ]

        if any(len(item) != 384 for item in results):
            raise ValueError("Embedding dimension mismatch.")

        return results
