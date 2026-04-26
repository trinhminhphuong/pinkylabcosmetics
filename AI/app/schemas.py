from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ProductItem(BaseModel):
    id: str
    name: str
    brand: str = "PinkyLab"
    category: str = "Khac"
    price: float = 0
    original_price: float | None = None
    rating: float = 0
    reviews: int = 0
    image: str | None = None
    description: str = ""
    in_stock: bool = True
    badge: str | None = None
    tags: list[str] = Field(default_factory=list)
    attributes: dict[str, str] = Field(default_factory=dict)


class ProductResult(ProductItem):
    score: float
    reason: str | None = None
    matched_reason: str | None = None


class EventCreate(BaseModel):
    session_id: str = Field(min_length=3)
    user_id: str | None = None
    event_type: Literal[
        "product_view",
        "search",
        "recommendation_click",
        "add_to_cart",
        "wishlist_add",
        "checkout_start",
    ]
    product_id: str | None = None
    query: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class EventResponse(BaseModel):
    ok: bool = True


class RecommendationRequest(BaseModel):
    session_id: str | None = None
    user_id: str | None = None
    current_product_id: str | None = None
    viewed_product_ids: list[str] = Field(default_factory=list)
    cart_product_ids: list[str] = Field(default_factory=list)
    wishlist_product_ids: list[str] = Field(default_factory=list)
    limit: int = Field(default=8, ge=1, le=30)


class RecommendationResponse(BaseModel):
    items: list[ProductResult]


class ProductMetric(BaseModel):
    product_id: str
    name: str
    category: str | None = None
    count: int
    score: float | None = None


class SearchTermMetric(BaseModel):
    query: str
    count: int


class CategoryMetric(BaseModel):
    category: str
    count: int


class AnalyticsSummary(BaseModel):
    period_days: int
    total_events: int
    top_viewed_products: list[ProductMetric]
    top_search_terms: list[SearchTermMetric]
    high_intent_products: list[ProductMetric]
    low_conversion_products: list[ProductMetric]
    top_categories: list[CategoryMetric]
    recommendation_insights: list[str]
