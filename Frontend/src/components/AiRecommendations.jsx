import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import { getRecommendations, toProductCard, trackEvent } from "../services/aiClient";

export default function AiRecommendations({
  title = "Gợi ý AI cho bạn",
  currentProductId = null,
  viewedProductIds = [],
  cartProductIds = [],
  wishlistProductIds = [],
  limit = 4,
  context = "default",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const viewedKey = viewedProductIds.map(String).join("|");
  const cartKey = cartProductIds.map(String).join("|");
  const wishlistKey = wishlistProductIds.map(String).join("|");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });

    getRecommendations({
      current_product_id: currentProductId ? String(currentProductId) : null,
      viewed_product_ids: viewedKey ? viewedKey.split("|") : [],
      cart_product_ids: cartKey ? cartKey.split("|") : [],
      wishlist_product_ids: wishlistKey ? wishlistKey.split("|") : [],
      limit,
    })
      .then((data) => {
        if (!cancelled) setItems((data.items || []).map(toProductCard));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentProductId, viewedKey, cartKey, wishlistKey, limit]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="container" style={{ marginTop: 40, marginBottom: 50, padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <Sparkles size={20} color="var(--pk-pink-dark)" />
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>{title}</h2>
      </div>

      {loading ? (
        <div style={{ height: 180 }} className="skeleton" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {items.map((product) => (
            <div
              key={product.id}
              onClick={() =>
                trackEvent({
                  event_type: "recommendation_click",
                  product_id: String(product.id),
                  metadata: { context, score: product.aiScore },
                })
              }
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <ProductCard product={product} />
              {product.aiReason && (
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {product.aiReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
