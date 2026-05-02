import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Zap } from "lucide-react";
import { formatPrice } from "../data/products";
import { useCart, useToast } from "../context/store";
import { trackEvent } from "../services/aiClient";

export default function ChatProductCard({ product }) {
  const { add } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();
  const inStock = product.inStock !== false;
  const image = product.image || product.images?.[0] || "https://placehold.co/160x160/f9d4e2/e75480?text=PinkyLab";

  const addToCart = () => {
    if (!inStock) return;
    add(product);
    trackEvent({ event_type: "add_to_cart", product_id: String(product.id), metadata: { source: "chat" } });
    show(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const buyNow = () => {
    if (!inStock) return;
    add(product);
    trackEvent({ event_type: "add_to_cart", product_id: String(product.id), metadata: { source: "chat_buy_now" } });
    show(`Đã thêm "${product.name}" vào giỏ hàng!`);
    navigate("/cart");
  };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, background: "#fff", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <Link
          to={`/products/${product.id}`}
          onClick={() => trackEvent({ event_type: "recommendation_click", product_id: String(product.id), metadata: { source: "chat", score: product.aiScore } })}
          style={{ flexShrink: 0 }}
        >
          <img
            src={image}
            alt={product.name}
            style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, background: "var(--pk-pink-light)" }}
            onError={(event) => { event.currentTarget.src = "https://placehold.co/160x160/f9d4e2/e75480?text=PinkyLab"; }}
          />
        </Link>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>
            {product.brand || "PinkyLab"} · {product.category || "Mỹ phẩm"}
          </div>
          <Link to={`/products/${product.id}`} style={{ color: "var(--text)", textDecoration: "none" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {product.name}
            </div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
            <span style={{ color: "var(--pk-red)", fontWeight: 900, fontSize: "0.9rem" }}>{formatPrice(product.price || 0)}</span>
            {product.originalPrice && (
              <span style={{ color: "var(--text-muted)", textDecoration: "line-through", fontSize: "0.72rem" }}>{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <div style={{ color: inStock ? "#16a34a" : "#ef4444", fontSize: "0.72rem", fontWeight: 700, marginTop: 4 }}>
            {inStock ? (product.stock ? `Còn ${product.stock} sản phẩm` : "Còn hàng") : "Hết hàng"}
          </div>
        </div>
      </div>

      {product.aiReason && (
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.45, background: "var(--surface-2)", borderRadius: 10, padding: "7px 9px" }}>
          {product.aiReason}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        <Link
          to={`/products/${product.id}`}
          onClick={() => trackEvent({ event_type: "recommendation_click", product_id: String(product.id), metadata: { source: "chat_detail", score: product.aiScore } })}
          style={{ textAlign: "center", border: "1px solid var(--border)", borderRadius: 999, padding: "7px 6px", color: "var(--text)", textDecoration: "none", fontSize: "0.72rem", fontWeight: 800 }}
        >
          Chi tiết
        </Link>
        <button
          onClick={addToCart}
          disabled={!inStock}
          style={{ border: "none", borderRadius: 999, padding: "7px 6px", background: inStock ? "var(--pk-pink-light)" : "#eee", color: inStock ? "var(--pk-pink-dark)" : "var(--text-muted)", fontSize: "0.72rem", fontWeight: 800, cursor: inStock ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          <ShoppingBag size={13} /> Giỏ
        </button>
        <button
          onClick={buyNow}
          disabled={!inStock}
          style={{ border: "none", borderRadius: 999, padding: "7px 6px", background: inStock ? "linear-gradient(135deg, var(--pk-pink), #d44070)" : "#eee", color: inStock ? "#fff" : "var(--text-muted)", fontSize: "0.72rem", fontWeight: 800, cursor: inStock ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          <Zap size={13} /> Mua
        </button>
      </div>
    </div>
  );
}
