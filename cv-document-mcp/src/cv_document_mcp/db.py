import json
import os
from typing import Any

import asyncpg

from cv_document_mcp.schemas import EMPTY_CV_DOCUMENT


def decode_jsonb(value: Any) -> dict[str, Any]:
    if isinstance(value, str):
        parsed = json.loads(value)
        if not isinstance(parsed, dict):
            raise ValueError("Expected JSONB document to decode to an object")
        return parsed
    if isinstance(value, dict):
        return value
    raise TypeError(f"Unsupported JSONB value type: {type(value).__name__}")


class Database:
    def __init__(self) -> None:
        self._pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        if self._pool is not None:
            return
        database_url = os.getenv(
            "DATABASE_URL",
            "postgres://admin:securepassword@database:5432/offers_db",
        )
        self._pool = await asyncpg.create_pool(database_url)

    async def close(self) -> None:
        if self._pool is None:
            return
        await self._pool.close()
        self._pool = None

    @property
    def pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise RuntimeError("Database pool is not initialized")
        return self._pool

    async def list_users(self) -> list[dict[str, Any]]:
        rows = await self.pool.fetch("SELECT id, email FROM users ORDER BY id ASC")
        return [dict(row) for row in rows]

    async def get_cv_document(self, user_id: int) -> dict[str, Any]:
        row = await self.pool.fetchrow(
            """
            INSERT INTO cv_documents (user_id, data)
            VALUES ($1, $2::jsonb)
            ON CONFLICT (user_id) DO UPDATE
              SET user_id = EXCLUDED.user_id
            RETURNING id, user_id, data, created_at, updated_at
            """,
            user_id,
            json.dumps(EMPTY_CV_DOCUMENT),
        )
        if row is None:
            raise RuntimeError("Unable to fetch cv_document")
        return {
            "id": row["id"],
            "user_id": row["user_id"],
            "data": decode_jsonb(row["data"]),
            "created_at": row["created_at"].isoformat(),
            "updated_at": row["updated_at"].isoformat(),
        }

    async def save_cv_document(self, user_id: int, data: dict[str, Any]) -> dict[str, Any]:
        row = await self.pool.fetchrow(
            """
            INSERT INTO cv_documents (user_id, data)
            VALUES ($1, $2::jsonb)
            ON CONFLICT (user_id) DO UPDATE
              SET data = EXCLUDED.data,
                  updated_at = CURRENT_TIMESTAMP
            RETURNING id, user_id, data, created_at, updated_at
            """,
            user_id,
            json.dumps(data),
        )
        if row is None:
            raise RuntimeError("Unable to save cv_document")
        return {
            "id": row["id"],
            "user_id": row["user_id"],
            "data": decode_jsonb(row["data"]),
            "created_at": row["created_at"].isoformat(),
            "updated_at": row["updated_at"].isoformat(),
        }
