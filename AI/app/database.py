from __future__ import annotations

import sqlite3
from pathlib import Path

from app.config import settings


def get_connection(init_schema: bool = True) -> sqlite3.Connection:
    db_path = Path(settings.database_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    if init_schema:
        create_schema(conn)
    return conn


def init_db() -> None:
    with get_connection(init_schema=True):
        return


def create_schema(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            user_id TEXT,
            event_type TEXT NOT NULL,
            product_id TEXT,
            query TEXT,
            metadata TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_events_session_created
        ON events(session_id, created_at)
        """
    )
    conn.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_events_type_created
        ON events(event_type, created_at)
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS product_cache (
            id TEXT PRIMARY KEY,
            payload TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
