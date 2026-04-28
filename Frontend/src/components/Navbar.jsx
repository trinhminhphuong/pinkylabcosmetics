import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  ShoppingBag, Search, User, Menu, X, ChevronDown, ChevronRight,
  Smile, Activity, Scissors, Droplets, Brush, Box, HeartPulse, Pill, Crown
} from "lucide-react";
import { useCart, useAuth } from "../context/store";

const MEGA_MENU_DATA = [
  { id: 'face', icon: <Smile size={18} />, label: 'CHĂM SÓC DA MẶT', sub: ['Tẩy Trang', 'Tẩy Tế Bào Chết', 'Serum/Essence', 'Sữa Rửa Mặt', 'Toner/Lotion', 'Kem Dưỡng/Gel Dưỡng', 'Mặt Nạ', 'Sữa Dưỡng Mắt', 'Kem Chống Nắng', 'Xịt Khoáng', 'Lột Mụn'] },
  { id: 'body', icon: <Activity size={18} />, label: 'CHĂM SÓC CƠ THỂ', sub: ['Sữa Tắm', 'Tẩy Da Chết Cơ Thể', 'Dưỡng Thể', 'Khử Mùi', 'Sản Phẩm Chăm Sóc Vùng Kín', 'Kem Chống Nắng Cơ Thể'] },
  { id: 'hair', icon: <Scissors size={18} />, label: 'CHĂM SÓC TÓC', sub: ['Dầu Gội', 'Dầu Xả', 'Tinh Dầu Dưỡng Tóc', 'Kem Ủ Tóc', 'Xịt Dưỡng Tóc', 'Thuốc Nhuộm Tóc'] },
  { id: 'teeth', icon: <Droplets size={18} />, label: 'CHĂM SÓC RĂNG MIỆNG', sub: ['Kem Đánh Răng', 'Nước Súc Miệng', 'Bàn Chải Đánh Răng', 'Chỉ Nha Khoa', 'Xịt Thơm Miệng'] },
  { id: 'makeup', icon: <Brush size={18} />, label: 'TRANG ĐIỂM', sub: ['Kem Nền', 'Son Môi', 'Phấn Phủ', 'Mascara', 'Kẻ Mắt', 'Phấn Má Hồng', 'Che Khuyết Điểm', 'Phấn Mắt'] },
  { id: 'tools', icon: <Box size={18} />, label: 'PHỤ KIỆN/DỤNG CỤ LÀM ĐẸP', sub: ['Mút Trang Điểm', 'Cọ Trang Điểm', 'Nhíp', 'Máy Rửa Mặt', 'Bấm Mi', 'Kẹp Tóc'] },
  { id: 'pharmacy', icon: <HeartPulse size={18} />, label: 'DƯỢC MỸ PHẨM', sub: ['Trị Mụn', 'Phục Hồi Da', 'Chống Nắng Dược Mỹ Phẩm', 'Hỗ Trợ Trị Nám', 'Sản Phẩm Cho Da Nhạy Cảm'] },
  { id: 'functional', icon: <Pill size={18} />, label: 'THỰC PHẨM CHỨC NĂNG', sub: ['Collagen', 'Vitamin C', 'Giảm Cân', 'Viên Uống Trắng Da', 'Bổ Sung Nội Tiết Tố'] },
  { id: 'bestseller', icon: <Crown size={18} />, label: 'BEST SELLER', sub: ['Sản Phẩm Bán Chạy Nhất', 'Sản Phẩm Được Yêu Thích', 'Xu Hướng Làm Đẹp'] },
];

export default function Navbar() {
  const { count } = useCart();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const navigate = useNavigate();

  // Mega Menu State
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(MEGA_MENU_DATA[0].id);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      const query = searchVal.trim();
      navigate(`/products?q=${encodeURIComponent(query)}`);
      setSearchVal("");
      setMenuOpen(false);
    }
  };

  return (
    <nav className="navbar" style={{ position: 'sticky', background: '#fff', borderBottom: 'none', padding: 0 }}>
      {/* Top Announcement Bar */}
      <div style={{ background: "var(--pk-teal)", color: "#fff", fontSize: "0.8rem", fontWeight: 600, textAlign: "center", padding: "8px 20px" }}>
        FREESHIP30K - GIẢM NGAY 30K CHO ĐƠN HÀNG 199K &nbsp;&nbsp;|&nbsp;&nbsp; NHẬP MÃ T04FREESHIP25K - GIẢM NGAY 25K CHO ĐƠN HÀNG 99K
      </div>

      {/* Main Header Container */}
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 85, padding: "0 20px", gap: 30 }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <div style={{ fontFamily: "Playfair Display, serif", color: "#1a1a1a", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>
            Pinky<span style={{ color: "var(--pk-pink)" }}>Lab</span>
          </div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--text-muted)", marginTop: 4 }}>COSMETICS</div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hide-mobile" style={{
          display: "flex", alignItems: "center", flex: 1, maxWidth: 600,
          background: "var(--pk-pink-light)", borderRadius: 999, overflow: "hidden", height: 42
        }}>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Bạn cần tìm ..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              padding: "0 20px", fontSize: "0.9rem", color: "var(--text)"
            }}
          />
          <button type="submit" style={{
            background: "var(--pk-pink)", color: "#fff", padding: "0 24px",
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", border: "none", cursor: "pointer"
          }}>
            <Search size={18} />
          </button>
        </form>

        {/* Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link to={user ? "/account" : "/login"} style={{ color: "var(--text)", display: "flex", alignItems: "center" }}>
             <User size={24} />
          </Link>

          <Link to="/cart" style={{ color: "var(--text)", position: "relative", display: "flex", alignItems: "center" }}>
            <ShoppingBag size={24} />
            {count > 0 && <span className="cart-badge" style={{
              background: "#000", color: "#fff", top: -6, right: -8, width: 18, height: 18, fontSize: "0.7rem", border: "none"
            }}>{count}</span>}
          </Link>

          {/* Mobile Menu Toggle */}
          <button className="hide-desktop btn-ghost" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Main Menu Bar (Pink) */}
      <div className="hide-mobile" style={{ background: "var(--pk-pink)", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center", gap: 32, position: "relative" }}>
          
          {/* Danh mục sản phẩm (Has Mega Menu) */}
          <div 
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
            style={{ display: "flex" }}
          >
            <Link to="/products" style={{
              color: "#fff", fontWeight: 600, fontSize: "0.85rem",
              display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
              padding: "16px 0", cursor: "pointer"
            }}>
              <Menu size={16} /> DANH MỤC SẢN PHẨM
            </Link>

            {/* Mega Menu Dropdown */}
            {megaMenuOpen && (
              <div style={{
                position: "absolute", top: "100%", left: 0,
                width: 900, background: "#fff", color: "var(--text)",
                boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
                display: "flex", borderTop: "3px solid var(--pk-pink)", zIndex: 999,
                minHeight: 450, borderRadius: "0 0 8px 8px", overflow: "hidden"
              }}>
                {/* Left Sidebar */}
                <div style={{ width: 280, borderRight: "1px solid var(--border)", padding: "16px 0", background: "#fcfcfc" }}>
                   {MEGA_MENU_DATA.map(cat => (
                     <div key={cat.id} 
                          onMouseEnter={() => setActiveCategory(cat.id)}
                          onClick={() => {
                             navigate(`/products?q=${encodeURIComponent(cat.label)}`);
                             setMegaMenuOpen(false);
                          }}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 20px", cursor: "pointer",
                            background: activeCategory === cat.id ? "#fff" : "transparent",
                            color: activeCategory === cat.id ? "var(--pk-pink)" : "var(--text)",
                            fontWeight: activeCategory === cat.id ? 700 : 500,
                            borderLeft: `3px solid ${activeCategory === cat.id ? "var(--pk-pink)" : "transparent"}`,
                            fontSize: "0.85rem", transition: "all 0.2s ease"
                          }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {cat.icon} {cat.label}
                        </div>
                        <ChevronRight size={16} color={activeCategory === cat.id ? "var(--pk-pink)" : "#ccc"}/>
                     </div>
                   ))}
                </div>
                {/* Right Content */}
                <div style={{ flex: 1, padding: 32, background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
                    {MEGA_MENU_DATA.find(c => c.id === activeCategory)?.sub.map(subItem => (
                      <Link to={`/products?q=${encodeURIComponent(subItem)}`} key={subItem} 
                            onClick={() => setMegaMenuOpen(false)}
                            style={{ 
                              fontSize: "0.95rem", color: "var(--text)", textDecoration: "none", 
                              padding: "6px 0", transition: "all 0.2s", fontWeight: 500
                            }}
                            onMouseEnter={e => {
                               e.target.style.color = "var(--pk-pink)";
                               e.target.style.transform = "translateX(4px)";
                            }}
                            onMouseLeave={e => {
                               e.target.style.color = "var(--text)";
                               e.target.style.transform = "translateX(0)";
                            }}>
                         {subItem}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other menu links */}
          {[
            { label: "SẢN PHẨM MỚI", link: "/products?cat=SẢN PHẨM MỚI" },
            { label: "❤️ DEAL HOT DƯỚI 100K ❤️", link: "/products?maxPrice=100000" },
            { label: "SKIN CARE", link: "/products?cat=Skincare" },
            // { label: "MAKE UP", link: "/products?cat=Makeup" },
            // { label: "AI INSIGHTS", link: "/ai-analytics" },
            { label: "TRA CỨU ĐƠN HÀNG", link: "/account" },
          ].map(item => (
            <Link key={item.label} to={item.link} 
              style={{
                color: "#fff", fontWeight: 600, fontSize: "0.85rem",
                display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
                padding: "16px 0", transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                e.target.style.color = "#ffe0e9";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={e => {
                e.target.style.color = "#fff";
                e.target.style.transform = "scale(1)";
              }}
            >
              {item.label} {item.hasDrop && <ChevronDown size={14} style={{ pointerEvents: "none" }} />}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="hide-desktop" style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "#fff", borderTop: "1px solid var(--border)",
          padding: 20, display: "flex", flexDirection: "column", gap: 16,
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)", zIndex: 100
        }}>
          <form onSubmit={handleSearch} style={{
            display: "flex", alignItems: "center", background: "var(--pk-pink-light)",
            borderRadius: 999, overflow: "hidden"
          }}>
            <input
               value={searchVal} onChange={e => setSearchVal(e.target.value)}
               placeholder="Bạn cần tìm..." style={{ flex: 1, background: "none", border: "none", outline: "none", padding: "12px 16px" }}
            />
            <button type="submit" style={{ background: "var(--pk-pink)", color: "#fff", padding: "0 20px", border: "none" }}><Search size={16}/></button>
          </form>
          <Link to="/products" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, color: "var(--text)", padding: "4px 0" }}>DANH MỤC SẢN PHẨM</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, color: "var(--text)", padding: "4px 0" }}>SẢN PHẨM MỚI</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, color: "var(--text)", padding: "4px 0" }}>DEAL HOT DƯỚI 100K</Link>
          <Link to="/ai-analytics" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, color: "var(--text)", padding: "4px 0" }}>AI INSIGHTS</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, color: "var(--text)", padding: "4px 0" }}>TRA CỨU ĐƠN HÀNG</Link>
        </div>
      )}
    </nav>
  );
}
