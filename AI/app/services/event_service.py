from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any

from app.database import get_connection
from app.schemas import EventCreate


class EventService:
    def record(self, event: EventCreate) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO events(session_id, user_id, event_type, product_id, query, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    event.session_id,
                    event.user_id,
                    event.event_type,
                    event.product_id,
                    event.query,
                    json.dumps(event.metadata, ensure_ascii=False),
                    now,
                ),
            )

    def recent_events(self, session_id: str | None, user_id: str | None, limit: int = 100) -> list[dict[str, Any]]:
        clauses: list[str] = []
        params: list[Any] = []
        if session_id:
            clauses.append("session_id = ?")
            params.append(session_id)
        if user_id:
            clauses.append("user_id = ?")
            params.append(user_id)
        if not clauses:
            return []

        query = f"""
            SELECT * FROM events
            WHERE {" OR ".join(clauses)}
            ORDER BY created_at DESC
            LIMIT ?
        """
        params.append(limit)
        with get_connection() as conn:
            rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]

    def total_events(self, days: int) -> int:
        since = self._since(days)
        with get_connection() as conn:
            row = conn.execute("SELECT COUNT(*) AS total FROM events WHERE created_at >= ?", (since,)).fetchone()
        return int(row["total"] or 0)

    def count_by_product(self, event_type: str, days: int, limit: int = 10) -> list[tuple[str, int]]:
        since = self._since(days)
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT product_id, COUNT(*) AS total
                FROM events
                WHERE event_type = ? AND product_id IS NOT NULL AND created_at >= ?
                GROUP BY product_id
                ORDER BY total DESC
                LIMIT ?
                """,
                (event_type, since, limit),
            ).fetchall()
        return [(str(row["product_id"]), int(row["total"])) for row in rows]

    def all_product_counts(self, event_type: str, days: int) -> Counter[str]:
        since = self._since(days)
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT product_id, COUNT(*) AS total
                FROM events
                WHERE event_type = ? AND product_id IS NOT NULL AND created_at >= ?
                GROUP BY product_id
                """,
                (event_type, since),
            ).fetchall()
        return Counter({str(row["product_id"]): int(row["total"]) for row in rows})

    def top_queries(self, days: int, limit: int = 10) -> list[tuple[str, int]]:
        since = self._since(days)
        with get_connection() as conn:
            rows = conn.execute(
                """
                SELECT LOWER(TRIM(query)) AS normalized_query, COUNT(*) AS total
                FROM events
                WHERE event_type = 'search' AND query IS NOT NULL AND TRIM(query) <> '' AND created_at >= ?
                GROUP BY normalized_query
                ORDER BY total DESC
                LIMIT ?
                """,
                (since, limit),
            ).fetchall()
        return [(str(row["normalized_query"]), int(row["total"])) for row in rows]

    def recent_search_queries(self, session_id: str | None, user_id: str | None, limit: int = 5) -> list[str]:
        return [
            str(event["query"])
            for event in self.recent_events(session_id, user_id, limit=60)
            if event.get("event_type") == "search" and event.get("query")
        ][:limit]

    def _since(self, days: int) -> str:
        return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


event_service = EventService()
