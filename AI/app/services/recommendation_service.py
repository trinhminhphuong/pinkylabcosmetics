from __future__ import annotations

from collections import Counter

from app.schemas import ProductItem, ProductResult, RecommendationRequest, RecommendationResponse
from app.services.catalog_service import catalog_service
from app.services.event_service import event_service
from app.services.text_processing import (
    build_idf,
    cosine_similarity,
    expand_query,
    normalize_text,
    product_document,
    tokenize,
    vectorize,
)


class RecommendationService:
    async def recommend(self, request: RecommendationRequest) -> RecommendationResponse:
        products = await catalog_service.get_products()
        product_map = {product.id: product for product in products}

        recent_events = event_service.recent_events(request.session_id, request.user_id, limit=120)
        recent_product_ids = [str(event["product_id"]) for event in recent_events if event.get("product_id")]
        recent_queries = event_service.recent_search_queries(request.session_id, request.user_id)

        seed_ids = self._ordered_unique(
            [
                request.current_product_id,
                *request.cart_product_ids,
                *request.wishlist_product_ids,
                *request.viewed_product_ids,
                *recent_product_ids,
            ]
        )
        seed_products = [product_map[product_id] for product_id in seed_ids if product_id in product_map]
        excluded_ids = set(seed_ids)

        documents = [tokenize(expand_query(product_document(product))) for product in products]
        idf = build_idf(documents)
        doc_vectors = {product.id: vectorize(tokens, idf) for product, tokens in zip(products, documents)}

        query_vector = vectorize(tokenize(expand_query(" ".join(recent_queries))), idf)
        popularity = self._popularity_scores()

        results: list[ProductResult] = []
        for product in products:
            if product.id in excluded_ids or not product.in_stock:
                continue

            score = 0.05
            reason_parts: list[str] = []

            for seed in seed_products:
                if normalize_text(product.category) == normalize_text(seed.category):
                    score += 0.22
                    reason_parts.append(f"Cùng nhóm {product.category}")
                if normalize_text(product.brand) == normalize_text(seed.brand):
                    score += 0.08
                similarity = cosine_similarity(doc_vectors.get(product.id, {}), doc_vectors.get(seed.id, {}))
                score += similarity * 0.22

            if query_vector:
                query_similarity = cosine_similarity(query_vector, doc_vectors.get(product.id, {}))
                score += query_similarity * 0.25
                if query_similarity > 0.08:
                    reason_parts.append("Phù hợp với từ khóa bạn đã tìm")

            score += min(popularity.get(product.id, 0) / 20, 0.12)
            score += self._product_quality_boost(product)

            if not seed_products and not recent_queries:
                reason_parts.append("Sản phẩm nổi bật đang được ưu tiên")
            elif not reason_parts:
                reason_parts.append("Tương đồng với hành vi mua sắm gần đây")

            results.append(
                ProductResult(
                    **product.model_dump(),
                    score=round(float(score), 4),
                    reason=", ".join(self._ordered_unique(reason_parts))[:180],
                )
            )

        results.sort(key=lambda item: item.score, reverse=True)
        return RecommendationResponse(items=results[: request.limit])

    def _popularity_scores(self) -> Counter[str]:
        views = event_service.all_product_counts("product_view", days=30)
        carts = event_service.all_product_counts("add_to_cart", days=30)
        wishes = event_service.all_product_counts("wishlist_add", days=30)
        clicks = event_service.all_product_counts("recommendation_click", days=30)
        score = Counter()
        for product_id, count in views.items():
            score[product_id] += count
        for product_id, count in carts.items():
            score[product_id] += count * 4
        for product_id, count in wishes.items():
            score[product_id] += count * 3
        for product_id, count in clicks.items():
            score[product_id] += count * 2
        return score

    def _product_quality_boost(self, product: ProductItem) -> float:
        boost = 0.0
        if product.badge == "hot":
            boost += 0.08
        elif product.badge in {"sale", "new"}:
            boost += 0.05
        if product.rating:
            boost += min(product.rating / 5, 1) * 0.04
        if product.reviews:
            boost += min(product.reviews / 500, 1) * 0.04
        return boost

    def _ordered_unique(self, values: list[str | None]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for value in values:
            if not value:
                continue
            value = str(value)
            if value in seen:
                continue
            seen.add(value)
            result.append(value)
        return result


recommendation_service = RecommendationService()
