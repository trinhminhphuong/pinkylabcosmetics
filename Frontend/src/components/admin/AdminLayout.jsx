import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Users, 
  LogOut,
  Bell,
  Search,
  Menu,
  Award,
  Newspaper
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/store";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Assuming there's a logout function in useAuth
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/products", label: "Sản phẩm", icon: <Package size={20} /> },
    { path: "/admin/categories", label: "Danh mục", icon: <Layers size={20} /> },
    { path: "/admin/brands", label: "Thương hiệu", icon: <Award size={20} /> },
    { path: "/admin/orders", label: "Đơn hàng", icon: <ShoppingCart size={20} /> },
    { path: "/admin/customers", label: "Khách hàng", icon: <Users size={20} /> },
    { path: "/admin/news", label: "Tin tức / Blog", icon: <Newspaper size={20} /> },
  ];

  const handleLogout = () => {
    if (logout) logout();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa", fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 80,
        background: "#fff",
        borderRight: "1px solid var(--border)",
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ 
          height: 70, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: sidebarOpen ? "space-between" : "center",
          padding: sidebarOpen ? "0 24px" : "0",
          borderBottom: "1px solid var(--border)"
        }}>
          {sidebarOpen && (
            <Link to="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>
                Pinky<span style={{ color: "var(--pk-pink)" }}>Admin</span>
              </div>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
            <Menu size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  color: isActive ? "var(--pk-pink)" : "var(--text)",
                  background: isActive ? "var(--pk-pink-light)" : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.2s ease",
                  justifyContent: sidebarOpen ? "flex-start" : "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "var(--pk-pink)" : "var(--text-muted)" }}>
                  {item.icon}
                </div>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: "16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Back to storefront */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              color: "var(--pk-pink)",
              background: "var(--pk-pink-light)",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.875rem",
              transition: "all 0.2s ease",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              marginBottom: 4
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--pk-pink)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--pk-pink-light)"; e.currentTarget.style.color = "var(--pk-pink)"; }}
          >
            <span style={{ display: "flex", alignItems: "center", flexShrink: 0, fontSize: "1.1rem" }}>🏠</span>
            {sidebarOpen && <span>Về trang chủ</span>}
          </Link>

          <button 
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              color: "var(--pk-red)",
              background: "transparent",
              fontWeight: 500,
              width: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease",
              justifyContent: sidebarOpen ? "flex-start" : "center"
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: 70,
          background: "#fff",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 5
        }}>
          {/* Spacer for layout */}
          <div></div>

          {/* Profile & Notifications */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <button style={{ position: "relative", color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" }}>
              <Bell size={20} />
              <span style={{
                position: "absolute", top: -2, right: -2, width: 8, height: 8,
                background: "var(--pk-red)", borderRadius: "50%"
              }}></span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user?.name || "Admin User"}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Quản trị viên</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--pk-pink-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pk-pink)", fontWeight: "bold" }}>
                {user?.name ? user.name.charAt(0) : "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: "32px", flex: 1, overflowY: "auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
