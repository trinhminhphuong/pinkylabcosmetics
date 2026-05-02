import { useState, useEffect } from "react";
import { TrendingUp, Users, ShoppingCart, DollarSign, Package, Loader } from "lucide-react";
import { OrderService, ProductService, CategoryService } from "../../services/apiServices";

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [ordRes, prodRes, catRes] = await Promise.all([
          OrderService.getAllOrders({ pageNum: 1, pageSize: 9999 }), // fetch all để tính doanh thu thật
          ProductService.getAllProducts({ pageNum: 1, pageSize: 1 }),
          CategoryService.getAllCategories({ pageNum: 1, pageSize: 1 }),
        ]);

        const allOrders = ordRes?.data?.items || ordRes?.data?.content || [];
        const totalOrders = ordRes?.data?.meta?.totalElement || ordRes?.data?.meta?.totalElements || allOrders.length;
        const totalProducts = prodRes?.data?.meta?.totalElement || prodRes?.data?.meta?.totalElements || 0;
        const totalCategories = catRes?.data?.meta?.totalElement || catRes?.data?.meta?.totalElements || 0;

        // Doanh thu thật = tổng tất cả đơn hàng
        const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // 5 đơn mới nhất: sort theo createdAt/orderDate desc
        const sorted = [...allOrders].sort((a, b) => {
          const ta = new Date(a.createdAt || a.orderDate || 0).getTime();
          const tb = new Date(b.createdAt || b.orderDate || 0).getTime();
          if (tb !== ta) return tb - ta;
          // Fallback: so sánh orderNumber số
          const na = parseInt((a.orderNumber || "").replace(/\D/g, "")) || 0;
          const nb = parseInt((b.orderNumber || "").replace(/\D/g, "")) || 0;
          return nb - na;
        });

        setRecentOrders(sorted.slice(0, 5));
        setStats({ totalRevenue, totalOrders, totalProducts, totalCategories });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusDisplay = (status) => {
    switch (status) {
      case "ORDER_RECEIVED": return { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fef3c7" };
      case "PROCESSING":     return { label: "Đang xử lý",   color: "#f59e0b", bg: "#fef3c7" };
      case "ON_THE_WAY":     return { label: "Đang giao",     color: "#3b82f6", bg: "#eff6ff" };
      case "DELIVERED":      return { label: "Đã giao",       color: "#12c2b0", bg: "#e0f7f4" };
      case "COMPLETED":      return { label: "Hoàn thành",    color: "#12c2b0", bg: "#e0f7f4" };
      case "CANCELLED":      return { label: "Đã hủy",        color: "#ef4444", bg: "#fee2e2" };
      default:               return { label: status || "N/A", color: "var(--text-muted)", bg: "#f3f4f6" };
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try { return new Date(dateStr).toLocaleDateString("vi-VN"); } catch { return dateStr; }
  };

  const statCards = [
    {
      label: "Tổng doanh thu",
      value: isLoading ? "..." : formatCurrency(stats.totalRevenue),
      icon: <DollarSign size={24} />,
      color: "var(--pk-pink)",
      bg: "var(--pk-pink-light)",
    },
    {
      label: "Tổng đơn hàng",
      value: isLoading ? "..." : stats.totalOrders.toLocaleString(),
      icon: <ShoppingCart size={24} />,
      color: "#12c2b0",
      bg: "#e0f7f4",
    },
    {
      label: "Sản phẩm",
      value: isLoading ? "..." : stats.totalProducts.toLocaleString(),
      icon: <Package size={24} />,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      label: "Danh mục",
      value: isLoading ? "..." : stats.totalCategories.toLocaleString(),
      icon: <TrendingUp size={24} />,
      color: "#8b5cf6",
      bg: "#f3e8ff",
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "24px" }}>Dashboard</h1>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {statCards.map((stat, idx) => (
          <div key={idx} className="card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "8px", fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ padding: "24px", overflowX: "auto" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "20px" }}>Đơn hàng gần đây</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontWeight: 500 }}>Mã ĐH</th>
              <th style={{ padding: "12px 16px", fontWeight: 500 }}>Khách hàng</th>
              <th style={{ padding: "12px 16px", fontWeight: 500 }}>Ngày đặt</th>
              <th style={{ padding: "12px 16px", fontWeight: 500 }}>Tổng tiền</th>
              <th style={{ padding: "12px 16px", fontWeight: 500 }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "32px" }}>
                  <Loader size={28} className="spin" color="var(--pk-pink)" />
                </td>
              </tr>
            ) : recentOrders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                  Chưa có đơn hàng nào
                </td>
              </tr>
            ) : recentOrders.map((order, idx) => {
              // API fields: id, orderNumber, status, totalAmount, userFullName, billingAddress, orderDate/createdAt
              const sd = getStatusDisplay(order.status);
              const customerName = order.userFullName && order.userFullName.trim() !== "null null"
                ? order.userFullName
                : (order.billingAddress?.companyName || "Khách hàng");
              return (
                <tr key={order.id || idx} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 500, color: "var(--pk-pink)" }}>
                    {order.orderNumber || `#${order.id?.substring(0, 8).toUpperCase()}`}
                  </td>
                  <td style={{ padding: "16px", fontSize: "0.9rem" }}>{customerName}</td>
                  <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {formatDate(order.orderDate || order.createdAt)}
                  </td>
                  <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 600 }}>
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600, background: sd.bg, color: sd.color }}>
                      {sd.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
