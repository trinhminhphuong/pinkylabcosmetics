from __future__ import annotations

from collections import Counter

from app.schemas import AnalyticsSummary, CategoryMetric, ProductItem, ProductMetric, SearchTermMetric
from app.services.catalog_service import catalog_service
from app.services.event_service import event_service


class AnalyticsService:
    async def summary(self, period_days: int = 30) -> AnalyticsSummary:
        products = await catalog_service.get_products()
        product_map = {product.id: product for product in products}

        views = event_service.all_product_counts("product_view", period_days)
        carts = event_service.all_product_counts("add_to_cart", period_days)
        wishes = event_service.all_product_counts("wishlist_add", period_days)
        clicks = event_service.all_product_counts("recommendation_click", period_days)

        top_viewed = self._product_metrics(event_service.count_by_product("product_view", period_days), product_map)
        top_terms = [SearchTermMetric(query=query, count=count) for query, count in event_service.top_queries(period_days)]
        high_intent = self._high_intent_metrics(products, views, carts, wishes, clicks)
        low_conversion = self._low_conversion_metrics(products, views, carts)
        top_categories = self._category_metrics(products, views)

        return AnalyticsSummary(
            period_days=period_days,
            total_events=event_service.total_events(period_days),
            top_viewed_products=top_viewed,
            top_search_terms=top_terms,
            high_intent_products=high_intent,
            low_conversion_products=low_conversion,
            top_categories=top_categories,
            recommendation_insights=self._insights(top_terms, top_categories, high_intent, low_conversion),
        )

    def _product_metrics(self, counts: list[tuple[str, int]], product_map: dict[str, ProductItem]) -> list[ProductMetric]:
        metrics: list[ProductMetric] = []
        for product_id, count in counts:
            product = product_map.get(product_id)
            metrics.append(
                ProductMetric(
                    product_id=product_id,
                    name=product.name if product else product_id,
                    category=product.category if product else None,
                    count=count,
                )
            )
        return metrics

    def _high_intent_metrics(
        self,
        products: list[ProductItem],
        views: Counter[str],
        carts: Counter[str],
        wishes: Counter[str],
        clicks: Counter[str],
    ) -> list[ProductMetric]:
        metrics: list[ProductMetric] = []
        for product in products:
            score = views[product.id] + carts[product.id] * 5 + wishes[product.id] * 3 + clicks[product.id] * 2
            if score <= 0:
                continue
            metrics.append(
                ProductMetric(
                    product_id=product.id,
                    name=product.name,
                    category=product.category,
                    count=int(score),
                    score=float(score),
                )
            )
        metrics.sort(key=lambda item: item.score or 0, reverse=True)
        return metrics[:10]

    def _low_conversion_metrics(
        self,
        products: list[ProductItem],
        views: Counter[str],
        carts: Counter[str],
    ) -> list[ProductMetric]:
        metrics: list[ProductMetric] = []
        for product in products:
            view_count = views[product.id]
            if view_count < 2:
                continue
            conversion = carts[product.id] / view_count if view_count else 0
            if conversion <= 0.15:
                metrics.append(
                    ProductMetric(
                        product_id=product.id,
                        name=product.name,
                        category=product.category,
                        count=view_count,
                        score=round(conversion, 4),
                    )
                )
        metrics.sort(key=lambda item: (-item.count, item.score or 0))
        return metrics[:10]

    def _category_metrics(self, products: list[ProductItem], views: Counter[str]) -> list[CategoryMetric]:
        product_map = {product.id: product for product in products}
        counts: Counter[str] = Counter()
        for product_id, count in views.items():
            product = product_map.get(product_id)
            if product:
                counts[product.category] += count
        return [CategoryMetric(category=category, count=count) for category, count in counts.most_common(8)]

    def _insights(
        self,
        top_terms: list[SearchTermMetric],
        top_categories: list[CategoryMetric],
        high_intent: list[ProductMetric],
        low_conversion: list[ProductMetric],
    ) -> list[str]:
        insights: list[str] = []
        if top_terms:
            insights.append(f"Từ khóa được quan tâm nhất là '{top_terms[0].query}', nên ưu tiên kết quả liên quan trong search.")
        if top_categories:
            insights.append(f"Nhóm {top_categories[0].category} đang có lượng xem cao nhất, phù hợp để đẩy gợi ý trên trang chủ.")
        if high_intent:
            insights.append(f"Sản phẩm có tín hiệu mua mạnh nhất là {high_intent[0].name}; nên đưa vào block gợi ý.")
        if low_conversion:
            insights.append(f"{low_conversion[0].name} có nhiều lượt xem nhưng chuyển đổi thấp; cần kiểm tra giá, ảnh hoặc mô tả.")
        if not insights:
            insights.append("Chưa đủ dữ liệu hành vi. Hãy để Frontend gửi event search, view và add_to_cart để dashboard có insight tốt hơn.")
        return insights


analytics_service = AnalyticsService()
