from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from app.database import get_connection
from app.schemas import ProductItem
from app.services.backend_client import BackendClient


SEED_PATH = Path(__file__).resolve().parents[1] / "data" / "seed_products.json"


class CatalogService:
    def __init__(self) -> None:
        self._client = BackendClient()
        self._memory_cache: list[ProductItem] | None = None

    async def get_products(self, force_refresh: bool = False) -> list[ProductItem]:
        if self._memory_cache is not None and not force_refresh:
            return self._memory_cache

        backend_products = await self._try_backend_products()
        if backend_products:
            self._cache_products(backend_products)
            self._memory_cache = backend_products
            return backend_products

        cached = self._load_cached_products()
        if cached:
            self._memory_cache = cached
            return cached

        seed = self._load_seed_products()
        self._cache_products(seed)
        self._memory_cache = seed
        return seed

    async def sync_products(self) -> dict[str, int | str]:
        products = await self._try_backend_products()
        if not products:
            products = self._load_seed_products()
            source = "seed"
        else:
            source = "backend"
        self._cache_products(products)
        self._memory_cache = products
        return {"count": len(products), "source": source}

    async def _try_backend_products(self) -> list[ProductItem]:
        try:
            raw_products = await self._client.fetch_products()
        except Exception:
            return []
        return [self._normalize_backend_product(item) for item in raw_products]

    def _load_seed_products(self) -> list[ProductItem]:
        with SEED_PATH.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        return [ProductItem(**item) for item in payload]

    def _load_cached_products(self) -> list[ProductItem]:
        with get_connection() as conn:
            rows = conn.execute("SELECT payload FROM product_cache ORDER BY updated_at DESC").fetchall()
        products: list[ProductItem] = []
        for row in rows:
            try:
                products.append(ProductItem(**json.loads(row["payload"])))
            except Exception:
                continue
        return products

    def _cache_products(self, products: list[ProductItem]) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with get_connection() as conn:
            conn.executemany(
                """
                INSERT INTO product_cache(id, payload, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
                """,
                [(product.id, product.model_dump_json(), now) for product in products],
            )

    def _normalize_backend_product(self, raw: dict) -> ProductItem:
        image_urls = raw.get("imageUrl") or raw.get("images") or []
        if isinstance(image_urls, str):
            image_urls = [image_urls]

        brand = raw.get("brand") or {}
        category = raw.get("category") or {}
        tags = raw.get("tags") or []
        attributes = raw.get("additionalInfo") or []
        promotion = raw.get("promotion") or {}

        original_price = float(raw.get("oldPrice") or raw.get("originalPrice") or raw.get("price") or 0)
        price = original_price
        discount_value = float(promotion.get("discountValue") or 0) if isinstance(promotion, dict) else 0
        discount_type = str(promotion.get("discountType") or "").upper() if isinstance(promotion, dict) else ""
        if promotion and promotion.get("isActive", promotion.get("active", False)) and discount_value > 0:
            if discount_type == "PERCENTAGE":
                price = max(0, original_price * (1 - discount_value / 100))
            else:
                price = max(0, original_price - discount_value)

        tag_names = [str(tag.get("name")) for tag in tags if isinstance(tag, dict) and tag.get("name")]
        attr_map = {
            str(attr.get("attributeKey")): str(attr.get("attributeValue"))
            for attr in attributes
            if isinstance(attr, dict) and attr.get("attributeKey") and attr.get("attributeValue")
        }

        return ProductItem(
            id=str(raw.get("id")),
            name=str(raw.get("name") or ""),
            brand=str(brand.get("name") if isinstance(brand, dict) else brand or "PinkyLab"),
            category=str(category.get("name") if isinstance(category, dict) else category or "Khac"),
            price=price,
            original_price=original_price if price < original_price else None,
            rating=float(raw.get("rating") or 0),
            reviews=int(raw.get("reviews") or 0),
            image=image_urls[0] if image_urls else None,
            description=str(raw.get("description") or ""),
            in_stock=int(raw.get("stock") or 0) > 0,
            badge="sale" if price < original_price else None,
            tags=tag_names,
            attributes=attr_map,
        )


catalog_service = CatalogService()
