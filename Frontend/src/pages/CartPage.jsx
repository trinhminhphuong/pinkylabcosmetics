import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart } from "../context/store";
import { formatPrice } from "../data/products";
import { useState } from "react";
import AiRecommendations from "../components/AiRecommendations";
import { trackEvent } from "../services/aiClient";

export default function CartPage() {
  const { items, remove, update, total, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "PINKY10") {
      setDiscount(0.1);
      setCouponMsg("✓ Giảm 10% đã được áp dụng!");
    } else {
      setDiscount(0);
      setCouponMsg("Mã không hợp lệ");
    }
  };

  const discountAmount = total * discount;
  const shipping = total >= 500000 ? 0 : 30000;
  const finalTotal = total - discountAmount + shipping;

  if (items.length === 0) {
    return (
      <main className="page-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "0 20px" }}>
        <div style={{ fontSize: "4rem", marginBottom: 20 }}>🛍️</div>
        <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: 12 }}>Giỏ hàng trống</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
        <Link to="/products" className="btn-primary"><ShoppingBag size={16} /> Mua sắm ngay</Link>
      </main>
    );
  }

  return (
    <main className="page-content" style={{ paddingBottom: 72 }}>
      <div className="container">
        <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, padding: "36px 0 28px" }}>
          Giỏ hàng <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif", fontWeight: 400 }}>({items.length} sản phẩm)</span>
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "flex-start" }}>
          {/* Cart items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map(item => (
              <div key={item.id} className="card" style={{ padding: 18, display: "flex", gap: 16, alignItems: "center" }}>
                <Link to={`/products/${item.id}`}>
                  <img 
                    src={(item.imageUrl && item.imageUrl[0]) || (item.images && item.images[0]) || item.image || "https://placehold.co/90x90/f9d4e2/e75480?text=SP"} 
                    alt={item.name} 
                    style={{ width: 90, height: 90, objectFit: "cover", borderRadius: "var(--radius-md)", flexShrink: 0 }} 
                    onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/90x90/f9d4e2/e75480?text=SP"; }}
                  />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {typeof item.brand === 'object' ? (item.brand?.name || '') : (item.brand || '')}
                  </p>
                  <Link to={`/products/${item.id}`}>
                    <h3 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 6, color: "var(--text)" }}>{item.name}</h3>
                  </Link>
                  <p style={{ color: "var(--pk-pink)", fontWeight: 700 }}>{formatPrice(item.price || item.oldPrice || 0)}</p>
                </div>
                {/* Qty */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="qty-btn" onClick={() => update(item.id, item.qty - 1)}>−</button>
                  <span style={{ width: 28, textAlign: "center", fontWeight: 700 }}>{item.qty}</span>
                  <button className="qty-btn" onClick={() => update(item.id, item.qty + 1)}>+</button>
                </div>
                {/* Item total */}
                <div style={{ textAlign: "right", minWidth: 100 }}>
                  <p style={{ fontWeight: 700, color: "var(--text)" }}>{formatPrice((item.price || item.oldPrice || 0) * item.qty)}</p>
                </div>
                {/* Remove */}
                <button onClick={() => remove(item.id)} style={{ padding: 8, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", color: "#ef4444", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={clear} style={{ alignSelf: "flex-start", fontSize: "0.8rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
              Xóa tất cả
            </button>
          </div>

          {/* Order summary */}
          <div className="card" style={{ padding: 24, width: 300, position: "sticky", top: 90 }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 20 }}>Tóm tắt đơn hàng</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20, fontSize: "0.875rem" }}>
              <Row label="Tạm tính" value={formatPrice(total)} />
              {discount > 0 && <Row label={`Giảm giá (${discount * 100}%)`} value={`-${formatPrice(discountAmount)}`} valueColor="#22c55e" />}
              <Row label="Phí vận chuyển" value={shipping === 0 ? "Miễn phí 🎉" : formatPrice(shipping)} valueColor={shipping === 0 ? "#22c55e" : undefined} />
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <Row label="Tổng cộng" value={formatPrice(finalTotal)} bold />
              </div>
            </div>

            {/* Coupon */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Mã giảm giá" className="input-pk" style={{ flex: 1, padding: "9px 12px", fontSize: "0.85rem" }} />
                <button onClick={applyCoupon} className="btn-primary" style={{ padding: "9px 14px", flexShrink: 0 }}>
                  <Tag size={14} />
                </button>
              </div>
              {couponMsg && (
                <p style={{ fontSize: "0.78rem", marginTop: 6, color: discount > 0 ? "#22c55e" : "#ef4444" }}>{couponMsg}</p>
              )}
            </div>

            <Link
              to="/checkout"
              onClick={() => trackEvent({ event_type: "checkout_start", metadata: { total: finalTotal, items: items.length } })}
              className="btn-primary"
              style={{ display: "flex", width: "100%", justifyContent: "center", marginBottom: 10 }}
            >
              Thanh toán <ArrowRight size={15} />
            </Link>
            <Link to="/products" className="btn-ghost" style={{ display: "flex", width: "100%", justifyContent: "center", fontSize: "0.85rem" }}>
              Tiếp tục mua sắm
            </Link>

            {total < 500000 && (
              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 14 }}>
                Mua thêm <strong style={{ color: "var(--pk-pink)" }}>{formatPrice(500000 - total)}</strong> để được miễn phí ship!
              </p>
            )}
          </div>
        </div>

        <AiRecommendations
          title="Có thể bạn cũng cần"
          cartProductIds={items.map(item => String(item.id))}
          limit={4}
          context="cart"
        />
      </div>
    </main>
  );
}

function Row({ label, value, bold, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: valueColor || "var(--text)", fontSize: bold ? "1.05rem" : "inherit" }}>{value}</span>
    </div>
  );
}
