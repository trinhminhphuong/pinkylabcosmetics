from __future__ import annotations

import httpx

from app.config import settings


class BackendClient:
    async def fetch_products(self, page_size: int = 200) -> list[dict]:
        if not settings.backend_base_url:
            return []

        url = f"{settings.backend_base_url}/products"
        params = {"pageNum": 1, "pageSize": page_size}
        async with httpx.AsyncClient(timeout=settings.backend_timeout_seconds) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()

        data = payload.get("data") if isinstance(payload, dict) else None
        if isinstance(data, dict) and isinstance(data.get("items"), list):
            return data["items"]
        if isinstance(data, list):
            return data
        return []
