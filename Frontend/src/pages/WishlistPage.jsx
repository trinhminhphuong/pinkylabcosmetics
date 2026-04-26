import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "../context/store";
import { ProductService } from "../services";
import ProductCard from "../components/ProductCard";

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setLoading(true);
    // Fetch each wishlisted product by ID from the API
    Promise.allSettled(
      ids.map(id => ProductService.getProductById(id))
    )
      .then(results => {
        const prods = results
          .filter(r => r.status === "fulfilled" && r.value)
          .map(r => r.value?.data || r.value)
          .filter(p => p && (p.id || p.name))
          .map(p => ({
             ...p,
             price: p.price || p.oldPrice || 0,
             originalPrice: p.oldPrice ? Math.round(p.oldPrice * 1.2) : null,
             inStock: (p.stock ?? 1) > 0,
             images: p.imageUrl || p.images || (p.image ? [p.image] : []),
             image: (p.imageUrl && p.imageUrl[0]) || p.image || null,
             category: p.category?.name || p.category || "",
          }));
        setWishlistProducts(prods);
      })
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <main className="page-content" style={{ paddingBottom: 72 }}>
      <div className="container">
        <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, padding: "36px 0 28px" }}>
          <Heart size={26} color="var(--pk-pink)" style={{ verticalAlign: "middle", marginRight: 10 }} />
          Sản phẩm yêu thích
          <span style={{ fontFamily: "Inter,sans-serif", fontWeight: 400, fontSize: "1rem", color: "var(--text-muted)", marginLeft: 10 }}>({ids.length})</span>
        </h1>

        {ids.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: 20 }}>💕</div>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Chưa có sản phẩm yêu thích</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Bấm vào biểu tượng ❤️ trên sản phẩm để thêm vào đây</p>
            <Link to="/products" className="btn-primary">Khám phá sản phẩm</Link>
          </div>
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 22 }}>
            {Array.from({ length: ids.length }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: 12 }} />
            ))}
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 22 }}>
            {wishlistProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          // Backend offline fallback: show wishlist count info without products
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>💕</div>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Bạn có {ids.length} sản phẩm yêu thích</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Sản phẩm không còn tồn tại hoặc lỗi kết nối.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => ids.forEach(id => toggle(id))} className="btn-outline" style={{ color: "#ef4444", borderColor: "#ef4444" }}>Xóa danh sách lỗi</button>
              <Link to="/products" className="btn-primary">Tiếp tục mua sắm</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
