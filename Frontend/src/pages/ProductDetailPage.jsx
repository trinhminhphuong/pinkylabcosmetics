import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ShoppingBag, Heart, ArrowLeft, Check, Truck, Shield } from "lucide-react";
import { formatPrice } from "../data/products";
import { useCart, useWishlist, useToast } from "../context/store";
import ProductCard from "../components/ProductCard";
import AiRecommendations from "../components/AiRecommendations";
import { ProductService, PromotionService } from "../services";
import { trackEvent } from "../services/aiClient";

/** Tính giá giảm từ danh sách promotions, trả về { price, originalPrice } */
function applyActivePromotion(basePrice, promotions) {
  const now = new Date();
  const active = (promotions || []).find(p => {
    const isActive = p.active ?? p.isActive ?? false;
    if (!isActive) return false;
    try {
      return new Date(p.startDate) <= now && new Date(p.endDate) >= now;
    } catch { return false; }
  });
  if (!active) return { price: basePrice, originalPrice: null };
  const val = Number(active.discountValue) || 0;
  const discounted = (active.discountType === "PERCENTAGE" || active.discountType === "percent")
    ? Math.round(basePrice * (1 - val / 100))
    : Math.max(0, basePrice - val);
  return { price: discounted, originalPrice: basePrice };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { show } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    setLoading(true);
    ProductService.getProductById(id)
      .then(async res => {
         let raw = res?.data || res || null;
         if (raw && (raw.id || raw.name)) {
           const basePrice = raw.price || raw.oldPrice || 0;
           
           // Fetch promotions và tính giá giảm thực
           let priceInfo = { price: basePrice, originalPrice: null };
           try {
             const promoRes = await PromotionService.getPromotionsByProduct(raw.id);
             const promos = promoRes?.data || promoRes || [];
             priceInfo = applyActivePromotion(basePrice, Array.isArray(promos) ? promos : []);
           } catch { /* không có promotion, giữ giá gốc */ }

           const prod = {
             ...raw,
             price: priceInfo.price,
             originalPrice: priceInfo.originalPrice,
             inStock: (raw.stock ?? 1) > 0,
             images: raw.imageUrl || raw.images || (raw.image ? [raw.image] : []),
             image: (raw.imageUrl && raw.imageUrl[0]) || raw.image || null,
             category: raw.category?.name || raw.category || "",
           };
           setProduct(prod);
         } else {
           setProduct(null);
         }
         // Fetch related products
         ProductService.getAllProducts({ pageNum: 0, pageSize: 4 })
           .then(rel => {
             const data = rel?.data || rel;
             let arr = [];
             if (data?.items) arr = data.items;
             else if (data?.content) arr = data.content;
             else if (data?.elements) arr = data.elements;
             else if (Array.isArray(data)) arr = data;
             
             if (arr.length > 0) {
               arr = arr.map(p => ({
                 ...p,
                 price: p.price || p.oldPrice || 0,
                 originalPrice: (p.price && p.oldPrice && p.price < p.oldPrice) ? p.oldPrice : null,
                 inStock: (p.stock ?? 1) > 0,
                 images: p.imageUrl || p.images || (p.image ? [p.image] : []),
                 image: (p.imageUrl && p.imageUrl[0]) || p.image || null,
                 category: p.category?.name || p.category || "",
               }));
             }
             setRelated(arr);
           });
      })
      .catch(err => {
         console.error(err);
         setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product?.id) return;

    trackEvent({
      event_type: "product_view",
      product_id: String(product.id),
      metadata: { category: product.category, source: "product_detail" },
    });
  }, [product]);

  if (loading) {
    return <main className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>Loading...</main>;
  }

  if (!product) {
    return (
      <main className="page-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>😢</div>
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="btn-primary">Quay lại cửa hàng</Link>
      </main>
    );
  }

  const wishlisted = has(product.id);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    for (let i = 0; i < qty; i++) add(product);
    trackEvent({
      event_type: "add_to_cart",
      product_id: String(product.id),
      metadata: { quantity: qty, source: "product_detail" },
    });
    show(`Đã thêm ${qty} "${product.name}" vào giỏ hàng!`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const handleWishlistToggle = () => {
    toggle(product.id);
    show(wishlisted ? "Đã xoá khỏi yêu thích" : "Đã thêm vào yêu thích!");
    if (!wishlisted) {
      trackEvent({
        event_type: "wishlist_add",
        product_id: String(product.id),
        metadata: { source: "product_detail" },
      });
    }
  };

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <main className="page-content" style={{ paddingBottom: 72 }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ padding: "24px 0 20px", display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "inherit" }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/products" style={{ color: "inherit" }}>Sản phẩm</Link>
          <span>/</span>
          <Link to={`/products?cat=${product.category}`} style={{ color: "inherit" }}>{product.category}</Link>
          <span>/</span>
          <span style={{ color: "var(--text)", fontWeight: 500 }}>{product.name}</span>
        </div>

        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 24, gap: 6 }}>
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* Product grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "flex-start" }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", background: "var(--pk-pink-light)", marginBottom: 14, aspectRatio: "1" }}>
              <img src={(product.images && product.images[activeImg]) || product.image || "https://via.placeholder.com/500"} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {(product.images || [product.image || "https://via.placeholder.com/500"]).map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: 76, height: 76, borderRadius: "var(--radius-md)", overflow: "hidden",
                  border: `2px solid ${i === activeImg ? "var(--pk-pink)" : "var(--border)"}`,
                  cursor: "pointer", background: "none", padding: 0, transition: "border-color 0.2s"
                }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.badge && (
              <span className={`badge badge-${product.badge}`} style={{ marginBottom: 12, display: "inline-block" }}>
                {product.badge === "new" ? "MỚI" : product.badge === "sale" ? "SALE" : "HOT"}
              </span>
            )}

            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{product.brand?.name || product.brand}</p>
            <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 700, lineHeight: 1.25, marginBottom: 16 }}>
              {product.name}
            </h1>

            {/* Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ display: "flex" }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} fill={s <= Math.round(product.rating || 5) ? "var(--pk-gold)" : "none"} color={s <= Math.round(product.rating || 5) ? "var(--pk-gold)" : "#e0c4d0"} />
                ))}
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{product.rating || 5.0}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>({product.reviews || 0} đánh giá)</span>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "Playfair Display,serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--pk-pink)" }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span style={{ fontSize: "1.1rem", color: "var(--text-muted)", textDecoration: "line-through" }}>{formatPrice(product.originalPrice)}</span>
                  <span className="badge badge-sale">-{discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: "0.95rem", lineHeight: 1.75, color: "var(--text-muted)", marginBottom: 28, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
              {product.description?.includes("???") 
                ? "Sản phẩm mỹ phẩm cao cấp với công thức độc quyền từ thiên nhiên. Giúp dưỡng ẩm, làm sáng da, mang lại làn da tươi trẻ rạng ngời và bảo vệ toàn diện suốt 24h. Phù hợp với mọi loại da, kể cả da nhạy cảm."
                : product.description}
            </p>

            {/* Variant Selector */}
            {(() => {
              const variants = product.variants || product.options || [];
              // Build variant groups: if backend provides variant objects, group by type
              // If no variants from backend, hide this section
              if (!variants.length) return null;
              // Group by variantType or just show as flat list
              const grouped = variants.reduce((acc, v) => {
                const type = v.type || v.variantType || "Biến thể";
                if (!acc[type]) acc[type] = [];
                acc[type].push(v.value || v.name || v);
                return acc;
              }, {});
              return (
                <div style={{ marginBottom: 24 }}>
                  {Object.entries(grouped).map(([type, values]) => (
                    <div key={type} style={{ marginBottom: 14 }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 8 }}>
                        {type}:
                        {selectedVariant?.[type] && (
                          <span style={{ fontWeight: 400, color: "var(--pk-pink)", marginLeft: 6 }}>{selectedVariant[type]}</span>
                        )}
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {values.map(val => {
                          const active = selectedVariant?.[type] === val;
                          return (
                            <button
                              key={val}
                              onClick={() => setSelectedVariant(prev => ({ ...prev, [type]: active ? null : val }))}
                              style={{
                                padding: "6px 16px", borderRadius: 999, fontSize: "0.82rem", fontWeight: 600,
                                border: `2px solid ${active ? "var(--pk-pink)" : "var(--border)"}`,
                                background: active ? "var(--pk-pink-light)" : "var(--surface)",
                                color: active ? "var(--pk-pink)" : "var(--text)",
                                cursor: "pointer", transition: "all 0.2s"
                              }}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Stock status */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: "0.875rem" }}>
              <span style={{
                width: 9, height: 9, borderRadius: "50%",
                background: product.inStock ? "#22c55e" : "#ef4444",
                display: "inline-block"
              }} />
              <span style={{ fontWeight: 600, color: product.inStock ? "#22c55e" : "#ef4444" }}>
                {product.inStock ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>

            {/* Qty */}
            {product.inStock && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>Số lượng:</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span style={{ width: 32, textAlign: "center", fontWeight: 700 }}>{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <button onClick={handleAddToCart} disabled={!product.inStock} className="btn-primary" style={{ flex: 1, minWidth: 160, justifyContent: "center" }}>
                {added ? <><Check size={16} /> Đã thêm!</> : <><ShoppingBag size={16} /> Thêm vào giỏ</>}
              </button>
              <button onClick={handleBuyNow} disabled={!product.inStock} className="btn-outline" style={{ flex: 1, minWidth: 120, justifyContent: "center" }}>
                Mua ngay
              </button>
              <button onClick={handleWishlistToggle}
                style={{ width: 46, height: 46, borderRadius: "50%", border: "2px solid var(--border)", background: wishlisted ? "var(--pk-pink-light)" : "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: wishlisted ? "var(--pk-pink)" : "var(--text-muted)", transition: "all 0.2s" }}>
                <Heart size={18} fill={wishlisted ? "var(--pk-pink)" : "none"} />
              </button>
            </div>

            {/* Perks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { Icon: Truck,  text: "Miễn phí vận chuyển cho đơn từ 500.000đ" },
                { Icon: Shield, text: "Hàng chính hãng 100% — cam kết hoàn tiền" },
              ].map(({ Icon, text }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  <Icon size={15} color="var(--pk-pink)" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <AiRecommendations
          title="Gợi ý AI dựa trên sản phẩm này"
          currentProductId={String(product.id)}
          limit={4}
          context="product_detail"
        />

        {/* Related */}
        {related.length > 0 && (
          <section style={{ marginTop: 72 }}>
            <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: 28 }}>Sản phẩm liên quan</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
