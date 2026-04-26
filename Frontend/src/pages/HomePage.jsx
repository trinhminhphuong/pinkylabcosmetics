import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import AiRecommendations from "../components/AiRecommendations";
import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { ProductService, CategoryService, BrandService } from "../services";

const BANNERS = [
  "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1920&q=80",
  "/banner-30-4.png",
  "https://plus.unsplash.com/premium_photo-1674763813715-457607635894?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=1920&q=80",
  "https://images.unsplash.com/photo-1633793566189-8e9fe6f817fc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=1920&q=80",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1920&q=80",
  "https://plus.unsplash.com/premium_photo-1661769021743-7139c6fc4ab9?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

const BEST_SELLER_TABS = ["SKINCARE", "MAKEUP", "BODY CARE", "FRAGRANCE", "HAIRCARE"];
const CARE_CATS = ["Skincare", "Makeup", "Body Care", "Fragrance", "Haircare"];
const CARE_CAT_LABELS = ["SKINCARE", "MAKE UP", "BODY CARE", "FRAGRANCE", "HAIRCARE"];

export default function HomePage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bestSellerTab, setBestSellerTab] = useState(0);
  const [careTab, setCareTab] = useState(0);
  const [careCat, setCareCat] = useState(0);
  const [hotPage, setHotPage] = useState(0);

  useEffect(() => {
    ProductService.getAllProducts({ pageNum: 0, pageSize: 20 })
      .then(res => {
        const data = res?.data || res;
        let arr = [];
        if (data?.items) arr = data.items;
        else if (data?.content) arr = data.content;
        else if (data?.elements) arr = data.elements;
        else if (Array.isArray(data)) arr = data;

        if (arr.length > 0) {
          arr = arr.map(p => ({
            ...p,
            price: p.oldPrice || p.price || 0,
            originalPrice: p.oldPrice ? p.oldPrice * 1.2 : null,
            inStock: p.stock > 0,
            category: p.category?.name || p.category || ""
          }));
        }
        setProducts(arr);
      })
      .catch(err => console.error("Error fetching products:", err));
      
    CategoryService.getAllCategories()
      .then(res => setCategories(Array.isArray(res?.data) ? res.data : (res?.data?.items || res?.data?.elements || res?.data?.content || [])))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const flashSaleProducts = products.slice(0, 5).map(p => ({ ...p, badge: "sale", inStock: true, originalPrice: p.price * 1.5 }));
  const newProducts = products.slice(5, 10).map(p => ({ ...p, badge: "new" }));
  const hotProducts = products.slice(10, 16);

  const bestSellerTabs = categories.length > 0 
    ? categories.slice(0, 6).map(c => typeof c === 'string' ? c.toUpperCase() : c.name?.toUpperCase() || "") 
    : BEST_SELLER_TABS;

  const getBestSellerProducts = () => {
    const tabName = bestSellerTabs[bestSellerTab] || "";
    let filtered = products.filter(p => {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      return cat.includes(tabName.toLowerCase()) || name.includes(tabName.toLowerCase());
    });
    if (filtered.length < 8) {
      filtered = [...filtered, ...products.filter(p => !filtered.includes(p))];
    }
    return filtered.slice(0, 8);
  };

  const getCareProducts = () => {
    const catName = CARE_CATS[careCat] || "";
    let filtered = products.filter(p => {
      const cat = (p.category || "").toLowerCase();
      return cat.includes(catName.toLowerCase());
    });
    if (filtered.length < 8) {
      filtered = [...filtered, ...products.filter(p => !filtered.includes(p))];
    }
    return filtered.slice(0, 8);
  };

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <main style={{ background: "#fff", minHeight: "100vh" }}>
      
      {/* ── HERO SLIDER ── */}
      <section style={{ position: "relative", overflow: "hidden", background: "#fff", paddingTop: 20, paddingBottom: 20 }}>
        <div style={{
          display: "flex",
          gap: "20px",
          transition: "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)",
          transform: `translateX(calc(10vw - ${slide * 80}vw - ${slide * 20}px))`
        }}>
          {BANNERS.map((b, i) => (
            <div key={i} style={{
              width: "80vw",
              flexShrink: 0,
              opacity: slide === i ? 1 : 0.4,
              transform: slide === i ? "scale(1)" : "scale(0.95)",
              transition: "all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)"
            }}>
              <img src={b} alt={`Banner ${i}`} style={{ width: "100%", height: "auto", aspectRatio: "21/8", objectFit: "cover", borderRadius: 16, display: "block", boxShadow: slide === i ? "0 10px 30px rgba(0,0,0,0.15)" : "none" }} />
            </div>
          ))}
        </div>
        <button onClick={() => setSlide(s => (s - 1 + BANNERS.length) % BANNERS.length)} style={{ position: "absolute", left: "11.5vw", top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
          <ChevronLeft color="#333" />
        </button>
        <button onClick={() => setSlide(s => (s + 1) % BANNERS.length)} style={{ position: "absolute", right: "11.5vw", top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
          <ChevronRight color="#333" />
        </button>
      </section>

      {/* ── FLASH SALE ── */}
      <section className="container" style={{ marginTop: 40, marginBottom: 40, padding: "0 20px" }}>
        <div style={{ background: "var(--pk-pink-dark)", borderRadius: "12px 12px 0 0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1.8rem", margin: 0, fontWeight: 800, fontStyle: "italic" }}>
              Flash <Zap fill="#fff" size={24} /> Sale
            </h2>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.05em" }}>ĐÃ KẾT THÚC</span>
          </div>
          <Link to="/products" style={{ background: "#ffe4e8", color: "var(--pk-pink-dark)", padding: "6px 16px", borderRadius: 99, fontSize: "0.85rem", fontWeight: 700, textDecoration: "none" }}>Xem tất cả &raquo;</Link>
        </div>
        <div style={{ border: "1px solid var(--pk-pink-light)", borderTop: "none", padding: 20, borderRadius: "0 0 12px 12px", background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {flashSaleProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <AiRecommendations title="Dành riêng cho bạn" limit={5} context="home" />

      {/* ── LAM THẢO CÓ GÌ HOT (PinkyLab có gì hot) ── */}
      <section className="container" style={{ marginBottom: 60, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ color: "#1a1a1a", fontSize: "1.6rem", fontWeight: 800, textTransform: "uppercase" }}>PINKYLAB CÓ GÌ HOT ?</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {[1,2,3,4,5,6].map((n, i) => (
              <span key={n} onClick={() => setHotPage(i)} style={{ width: 24, height: 24, borderRadius: "50%", background: hotPage === i ? "var(--pk-pink)" : "#eee", color: hotPage === i ? "#fff" : "#666", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>{n}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Brand 1 */}
          <div>
            <img src="https://plus.unsplash.com/premium_photo-1661769021743-7139c6fc4ab9?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Colorkey" style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 12, display: "block", objectFit: "cover", cursor: "pointer" }} onClick={() => navigate("/products?q=Colorkey")} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Mở Khoá Chất Riêng Cùng Colorkey</h3>
              <Link to="/products?q=Colorkey" style={{ fontSize: "0.8rem", color: "#666", textDecoration: "none" }}>Xem thêm &raquo;</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {products.slice((10 + hotPage * 2) % Math.max(products.length, 1), (10 + hotPage * 2) % Math.max(products.length, 1) + 2).map((p, i) => <ProductCard key={`hot-1-${hotPage}-${p.id || i}`} product={p} />)}
            </div>
          </div>
          {/* Brand 2 */}
          <div>
            <img src="https://images.unsplash.com/photo-1627384113944-4822313913c6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Amortals" style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 12, display: "block", objectFit: "cover", cursor: "pointer" }} onClick={() => navigate("/products?q=Amortals")} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Tán nền mịn như mơ cùng Amortals!</h3>
              <Link to="/products?q=Amortals" style={{ fontSize: "0.8rem", color: "#666", textDecoration: "none" }}>Xem thêm &raquo;</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {products.slice((12 + hotPage * 2) % Math.max(products.length, 1), (12 + hotPage * 2) % Math.max(products.length, 1) + 2).map((p, i) => <ProductCard key={`hot-2-${hotPage}-${p.id || i}`} product={p} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── SẢN PHẨM MỚI ── */}
      <section className="container" style={{ marginBottom: 60, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, borderBottom: "2px solid #eee", paddingBottom: 10 }}>
          <h2 style={{ color: "#1a1a1a", fontSize: "1.6rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>SẢN PHẨM MỚI</h2>
          <Link to="/products" style={{ background: "#ffe4e8", color: "var(--pk-pink-dark)", padding: "6px 16px", borderRadius: 99, fontSize: "0.85rem", fontWeight: 700, textDecoration: "none" }}>Xem tất cả &raquo;</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── TOP SẢN PHẨM BÁN CHẠY ── */}
      <section className="container" style={{ marginBottom: 80, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ color: "#1a1a1a", fontSize: "1.6rem", fontWeight: 800, textTransform: "uppercase" }}>TOP SẢN PHẨM BÁN CHẠY</h2>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 30, marginBottom: 24, borderBottom: "1px solid #eee" }}>
          {bestSellerTabs.map((tab, i) => (
            <div key={`${tab}-${i}`} onClick={() => setBestSellerTab(i)} style={{ padding: "0 0 12px", fontSize: "0.85rem", fontWeight: 700, color: bestSellerTab === i ? "var(--pk-pink-dark)" : "#666", borderBottom: bestSellerTab === i ? "2px solid var(--pk-pink-dark)" : "none", cursor: "pointer", transition: "color 0.2s" }}>
              {tab}
            </div>
          ))}
        </div>
        
        <div style={{ display: "flex", gap: 20 }}>
          {/* Vertical Banner */}
          <div className="hide-mobile" style={{ width: 300, flexShrink: 0, alignSelf: "flex-start", position: "sticky", top: 90 }}>
            <img src="https://images.unsplash.com/photo-1670842207771-3051910966e7?q=80&w=300&h=700&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Top Banner" style={{ width: "100%", height: "auto", borderRadius: 8, display: "block", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
          </div>
          {/* Products Grid */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {getBestSellerProducts().map(p => <ProductCard key={p.id} product={{ ...p, badge: "sale", originalPrice: p.price * 1.3 }} />)}
          </div>
        </div>
      </section>

      {/* ── TOP THƯƠNG HIỆU NỔI BẬT ── */}
      <section style={{ position: "relative", marginBottom: 60, padding: "40px 0", overflow: "hidden" }}>
        <div style={{ textAlign: "center", marginBottom: 10, position: "relative", zIndex: 10 }}>
          <h2 style={{ color: "#1a1a1a", fontSize: "1.6rem", fontWeight: 800, textTransform: "uppercase" }}>TOP THƯƠNG HIỆU NỔI BẬT</h2>
        </div>
        <TopBrandsCarousel />
      </section>

      {/* ── CHĂM SÓC TOÀN DIỆN ── */}
      <section className="container" style={{ marginBottom: 60, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, borderBottom: "2px solid #eee", paddingBottom: 10 }}>
          <h2 style={{ color: "#1a1a1a", fontSize: "1.6rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>CHĂM SÓC TOÀN DIỆN</h2>
          <Link to="/products" style={{ background: "#ffe4e8", color: "var(--pk-pink-dark)", padding: "6px 16px", borderRadius: 99, fontSize: "0.85rem", fontWeight: 700, textDecoration: "none" }}>Xem tất cả &raquo;</Link>
        </div>
        
        <div style={{ display: "flex", gap: 30 }}>
          {/* Left Categories */}
          <div className="hide-mobile" style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {CARE_CAT_LABELS.map((label, i) => (
              <div key={label} onClick={() => setCareCat(i)} style={{ padding: "14px 20px", background: careCat === i ? "var(--pk-pink-light)" : "#f8f9fa", borderRadius: 99, fontWeight: careCat === i ? 700 : 600, fontSize: "0.9rem", color: careCat === i ? "var(--pk-pink-dark)" : "#333", borderLeft: careCat === i ? "4px solid var(--pk-pink-dark)" : "4px solid transparent", cursor: "pointer", transition: "all 0.2s" }}>{label}</div>
            ))}
          </div>
          
          {/* Right Area */}
          <div style={{ flex: 1 }}>
            {/* Top Tabs */}
            <div style={{ display: "flex", gap: 20, marginBottom: 20, overflowX: "auto", whiteSpace: "nowrap" }}>
              {CARE_CAT_LABELS.map((tab, i) => (
                <div key={tab} onClick={() => { setCareTab(i); setCareCat(i); }} style={{ paddingBottom: 8, fontSize: "0.8rem", fontWeight: 700, color: careCat === i ? "var(--pk-pink-dark)" : "#666", borderBottom: careCat === i ? "2px solid var(--pk-pink-dark)" : "none", cursor: "pointer", transition: "color 0.2s", flexShrink: 0 }}>
                  {tab}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {getCareProducts().map(p => <ProductCard key={`comprehensive-${p.id}`} product={p} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── GIÚP BẠN CHỌN ĐÚNG - MUA NHANH ── */}
      <section className="container" style={{ marginBottom: 60, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2 style={{ color: "#1a1a1a", fontSize: "1.6rem", fontWeight: 800, textTransform: "uppercase" }}>GIÚP BẠN CHỌN ĐÚNG - MUA NHANH</h2>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 20 }}>
          {/* Left column (2 products) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
             {products.slice(4, 6).map(p => <ProductCard key={`left-${p.id}`} product={p} />)}
          </div>
          {/* Middle Banner */}
          <div style={{ height: "100%" }}>
             <img src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=500&q=80" alt="Guide Banner" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12, display: "block" }} />
          </div>
          {/* Right column (2 products) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
             {products.slice(6, 8).map(p => <ProductCard key={`right-${p.id}`} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── PINKYLAB SWEETIES (BANNERS) ── */}
      <section className="container" style={{ marginBottom: 40, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ color: "#1a1a1a", fontSize: "1.6rem", fontWeight: 800, textTransform: "uppercase" }}>PINKYLAB SWEETIES</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
           <img src="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&q=80" alt="Banner 1" onClick={() => navigate("/products?cat=Ch%C4%83m%20s%C3%B3c%20da%20m%E1%BA%B7t")} style={{ width: "100%", aspectRatio: "8/3", borderRadius: 12, objectFit: "cover", display: "block", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={e => e.target.style.opacity="0.85"} onMouseLeave={e => e.target.style.opacity="1"} />
           <img src="https://images.unsplash.com/photo-1617897903246-719242758050?w=400&q=80" alt="Banner 2" onClick={() => navigate("/products?cat=Trang%20%C4%91i%E1%BB%83m")} style={{ width: "100%", aspectRatio: "8/3", borderRadius: 12, objectFit: "cover", display: "block", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={e => e.target.style.opacity="0.85"} onMouseLeave={e => e.target.style.opacity="1"} />
           <img src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=400&q=80" alt="Banner 3" onClick={() => navigate("/products?maxPrice=100000")} style={{ width: "100%", aspectRatio: "8/3", borderRadius: 12, objectFit: "cover", display: "block", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={e => e.target.style.opacity="0.85"} onMouseLeave={e => e.target.style.opacity="1"} />
        </div>
      </section>

    </main>
  );
}

function TopBrandsCarousel() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(2);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback images for brands without logo
  const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80",
    "https://images.unsplash.com/photo-1583784561126-c18e59057f3b?w=400&q=80",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80",
    "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&q=80",
  ];

  useEffect(() => {
    BrandService.getAllBrands({ pageNum: 0, pageSize: 10 })
      .then(res => {
        const data = res?.data || res;
        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (data?.items) arr = data.items;
        else if (data?.content) arr = data.content;
        else if (data?.elements) arr = data.elements;
        if (arr.length > 0) {
          setBrands(arr.map((b, i) => ({
            id: b.id,
            name: b.name,
            img: b.logoUrl || b.logo || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
          })));
        }
      })
      .catch(err => console.error('Error loading brands:', err))
      .finally(() => setLoading(false));
  }, []);

  const displayBrands = brands.length > 0 ? brands : [
    { id: null, name: "Estee Lauder", img: FALLBACK_IMAGES[0] },
    { id: null, name: "Clinique",     img: FALLBACK_IMAGES[1] },
    { id: null, name: "MAC Cosmetics",img: FALLBACK_IMAGES[2] },
    { id: null, name: "Sephora",      img: FALLBACK_IMAGES[3] },
    { id: null, name: "LOreal Paris", img: FALLBACK_IMAGES[4] },
  ];

  const nextBrand = () => setActiveIndex(prev => (prev + 1) % displayBrands.length);
  const prevBrand = () => setActiveIndex(prev => (prev - 1 + displayBrands.length) % displayBrands.length);

  const handleBrandClick = (brand) => {
    navigate(`/products?brand=${encodeURIComponent(brand.name)}`);
  };

  return (
    <div style={{ position: "relative", height: 420, display: "flex", justifyContent: "center", alignItems: "center", marginTop: 20 }}>
      {/* Background Gradient */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "150%", background: "radial-gradient(ellipse at center, rgba(255,228,232,0.8) 0%, rgba(200,240,240,0.3) 40%, rgba(255,255,255,0) 70%)", zIndex: 0 }} />

      <button onClick={prevBrand} style={{ position: "absolute", left: "10%", top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "#ccc" }}>
        <ChevronLeft size={40} />
      </button>
      <button onClick={nextBrand} style={{ position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "none", border: "none", cursor: "pointer", color: "#ccc" }}>
        <ChevronRight size={40} />
      </button>

      {displayBrands.map((brand, i) => {
        let offset = i - activeIndex;
        if (offset < -2) offset += displayBrands.length;
        if (offset > 2) offset -= displayBrands.length;

        let tx = 0, ty = 0, rotate = 0, scale = 1, zIndex = 0, opacity = 1;

        if (offset === 0)       { tx = 0;    ty = -20; rotate = 0;   scale = 1.05; zIndex = 5; }
        else if (offset === -1) { tx = -250; ty = 10;  rotate = -10; scale = 0.95; zIndex = 4; }
        else if (offset === -2) { tx = -460; ty = 60;  rotate = -20; scale = 0.85; zIndex = 3; }
        else if (offset === 1)  { tx = 250;  ty = 10;  rotate = 10;  scale = 0.95; zIndex = 4; }
        else if (offset === 2)  { tx = 460;  ty = 60;  rotate = 20;  scale = 0.85; zIndex = 3; }
        else { opacity = 0; zIndex = 0; }

        const isCenter = offset === 0;

        return (
          <div
            key={brand.name}
            onClick={() => handleBrandClick(brand)}
            style={{
              position: "absolute",
              width: 250,
              height: 330,
              transition: "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)",
              transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotate(${rotate}deg) scale(${scale})`,
              top: "50%", left: "50%",
              zIndex, opacity,
              cursor: "pointer",
            }}
          >
            <img
              src={brand.img}
              alt={brand.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 20, display: "block", boxShadow: isCenter ? "0 20px 40px rgba(0,0,0,0.25)" : "0 15px 30px rgba(0,0,0,0.15)", transition: "box-shadow 0.5s" }}
            />
            {/* Hover overlay on center card */}
            {isCenter && (
              <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "rgba(255,100,130,0.08)", transition: "background 0.3s" }} />
            )}
            {/* Brand name badge */}
            <div style={{ position: "absolute", top: -20, right: 10, width: 70, height: 70, borderRadius: "50%", background: isCenter ? "var(--pk-pink-dark)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.65rem", zIndex: 2, boxShadow: "0 4px 10px rgba(0,0,0,0.15)", color: isCenter ? "#fff" : "var(--pk-pink-dark)", textAlign: "center", padding: 6, transition: "all 0.5s", lineHeight: 1.2 }}>
              {brand.name.toUpperCase()}
            </div>
            {isCenter && (
              <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "var(--pk-pink-dark)", color: "#fff", padding: "6px 18px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(255,100,130,0.4)" }}>
                Xem sản phẩm →
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
