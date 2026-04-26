import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Truck, Gift, FileText, PenTool, RefreshCw } from "lucide-react";

// Inline SVG social icons
const IgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);
const FbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const YtIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
);

export default function Footer() {
  return (
    <footer style={{ background: "var(--pk-pink-light)", color: "#333", marginTop: 40, borderTop: "1px solid #f0d6e0" }}>
      <div className="container" style={{ padding: "40px 20px" }}>
        
        {/* Badges Section */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 50, paddingBottom: 40, borderBottom: "1px solid rgba(232,88,122,0.2)" }}>
          {[
            { Icon: Truck, title: "GIAO HÀNG", sub: "MIỄN PHÍ", desc: "Hỗ trợ giao nhanh" },
            { Icon: Gift, title: "GÓI QUÀ", sub: "MIỄN PHÍ" },
            { Icon: FileText, title: "XUẤT", sub: "FULL VAT", desc: "Trong 24h" },
            { Icon: PenTool, title: "KHẮC SON", sub: "MIỄN PHÍ" },
            { Icon: RefreshCw, title: "HỖ TRỢ", sub: "ĐỔI/TRẢ", desc: "Trong 2 ngày" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 120 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pk-pink-dark)", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                <item.Icon size={30} />
              </div>
              <div style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.2 }}>
                <div>{item.title}</div>
                <div style={{ color: "var(--pk-pink-dark)" }}>{item.sub}</div>
                {item.desc && <div style={{ fontSize: "0.65rem", color: "#666", fontWeight: 500, marginTop: 4 }}>{item.desc}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Links & Info */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          
          {/* Brand & Address */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pk-pink)", fontWeight: 800, fontSize: "1.2rem", fontFamily: "Playfair Display,serif", border: "1px solid var(--pk-pink-light)" }}>P</div>
              <div>
                <div style={{ fontFamily: "Playfair Display,serif", fontWeight: 700, fontSize: "1.2rem", color: "#1a1a1a" }}>PinkyLab</div>
                <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", color: "#666" }}>COSMETICS</div>
              </div>
            </div>
            
            {/* Socials */}
            <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
              {[IgIcon, FbIcon, YtIcon].map((Icon, i) => (
                <a key={i} href="#" style={{ color: "var(--pk-pink-dark)", transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = 0.7} onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* CHĂM SÓC KHÁCH HÀNG */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>CHĂM SÓC KHÁCH HÀNG</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Chính sách đổi trả","Chính sách bảo mật","Chính sách thanh toán","Điều khoản dịch vụ","Hướng dẫn mua hàng","Hướng dẫn thanh toán VNPAY","Hóa Đơn GTGT"].map(label => (
                <Link key={label} to="#" style={{ fontSize: "0.85rem", color: "#555", textDecoration: "none" }}>{label}</Link>
              ))}
            </div>
          </div>

          {/* GÓP Ý */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>GÓP Ý - KHIẾU NẠI</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.85rem", color: "#555" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} /> 1800 6868 - 0288 889 9913</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} /> cskh@pinkylab.vn</div>
            </div>
          </div>

          {/* VỀ PINKYLAB */}
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>VỀ PINKYLAB</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Giới thiệu","Liên hệ góp ý","Liên hệ hợp tác","Giấy chứng nhận đại lý","Tuyển dụng"].map(label => (
                <Link key={label} to="#" style={{ fontSize: "0.85rem", color: "#555", textDecoration: "none" }}>{label}</Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
