
import os
import logging
from uuid import UUID

import psycopg2
from psycopg2.extras import RealDictCursor, register_uuid
from pgvector import Vector
from pgvector.psycopg2 import register_vector

from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class RAGService:

    @staticmethod
    def get_connection():
        password = os.getenv("DATABASE_PASSWORD")

        if not password:
            raise RuntimeError("DATABASE_PASSWORD is missing.")

        connection = psycopg2.connect(
            host=os.getenv("DATABASE_HOST", "localhost"),
            port=os.getenv("DATABASE_PORT", "5432"),
            dbname=os.getenv("DATABASE_NAME", "medilens_db"),
            user=os.getenv("DATABASE_USER", "postgres"),
            password=password
        )

        register_uuid(conn_or_curs=connection)
        register_vector(connection)

        return connection

    @staticmethod
    def split_into_chunks(
        text: str,
        chunk_size: int = 1200,
        overlap: int = 200
    ) -> list[str]:

        text = " ".join(text.split())

        if not text:
            return []

        chunks = []
        start = 0

        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk = text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            if end == len(text):
                break

            start = end - overlap

        return chunks

    @classmethod
    def ingest_report(
        cls,
        report_id: UUID,
        user_id: UUID,
        report_text: str
    ) -> dict:

        chunks = cls.split_into_chunks(report_text)

        if not chunks:
            raise ValueError("No valid text found to index.")

        embeddings = EmbeddingService.generate_embeddings(chunks)

        if len(embeddings) != len(chunks):
            raise ValueError(
                "Embedding count does not match the number of chunks."
            )

        connection = cls.get_connection()

        try:
            with connection:
                with connection.cursor() as cursor:

                    # Serialize indexing requests for this report/user pair.
                    # The lock is automatically released when the transaction ends.
                    cursor.execute(
                        """
                        SELECT pg_advisory_xact_lock(
                            hashtext(%s),
                            hashtext(%s)
                        )
                        """,
                        (str(report_id), str(user_id))
                    )

                    # Replace existing chunks only after acquiring the lock.
                    cursor.execute(
                        """
                        DELETE FROM report_chunks
                        WHERE report_id = %s
                          AND user_id = %s
                        """,
                        (report_id, user_id)
                    )

                    for index, (chunk, embedding) in enumerate(
                        zip(chunks, embeddings)
                    ):
                        cursor.execute(
                            """
                            INSERT INTO report_chunks
                            (
                                report_id,
                                user_id,
                                chunk_text,
                                chunk_index,
                                embedding
                            )
                            VALUES (%s, %s, %s, %s, %s)
                            """,
                            (
                                report_id,
                                user_id,
                                chunk,
                                index,
                                Vector(embedding)
                            )
                        )

            logger.info(
                "Report %s indexed successfully with %s chunks.",
                report_id,
                len(chunks)
            )

            return {
                "report_id": str(report_id),
                "chunks_created": len(chunks),
                "message": "Report indexed successfully."
            }

        except Exception:
            logger.exception(
                "Report ingestion failed for report_id=%s",
                report_id
            )
            raise

        finally:
            connection.close()

    @classmethod
    def retrieve_relevant_chunks(
        cls,
        report_id: UUID,
        user_id: UUID,
        question: str,
        limit: int = 5
    ) -> list[dict]:

        query_embedding = EmbeddingService.generate_embedding(question)

        connection = cls.get_connection()

        try:
            with connection.cursor(
                cursor_factory=RealDictCursor
            ) as cursor:

                cursor.execute(
                    """
                    SELECT
                        chunk_text,
                        chunk_index,
                        1 - (embedding <=> %s) AS similarity
                    FROM report_chunks
                    WHERE report_id = %s
                      AND user_id = %s
                      AND embedding IS NOT NULL
                    ORDER BY embedding <=> %s
                    LIMIT %s
                    """,
                    (
                        Vector(query_embedding),
                        report_id,
                        user_id,
                        Vector(query_embedding),
                        limit
                    )
                )

                return [
                    dict(row)
                    for row in cursor.fetchall()
                ]

        finally:
            connection.close()
