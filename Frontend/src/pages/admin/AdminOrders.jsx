import { useState, useEffect, useCallback } from "react";
import { Search, Edit, Eye, Loader, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../../components/admin/Modal";
import { OrderService } from "../../services/apiServices";
import { useToast } from "../../context/store";

// API order fields: id, orderNumber, status, totalAmount, userFullName,
//   billingAddress { companyName, streetAddress, state, country, zipCode },
//   shippingAddress, orderItems [ { id, productName, productImageUrl, quantity, price, subtotal } ],
//   paymentMethodName, orderDate, createdAt, note, subtotal, shippingFee, discountPercentage

export default function AdminOrders() {
  const [allOrders, setAllOrders] = useState([]);   // toàn bộ đơn hàng
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const { show } = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await OrderService.getAllOrders({ pageNum: 1, pageSize: 9999 });
      const data = res?.data;
      const items = data?.items || data?.content || [];
      // Sắp xếp mới nhất lên đầu
      const sorted = [...items].sort((a, b) => {
        const ta = a.createdAt || a.orderDate || "";
        const tb = b.createdAt || b.orderDate || "";
        return tb.localeCompare(ta);
      });
      setAllOrders(sorted);
    } catch (err) {
      console.error(err);
      show("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  }, [show]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset về trang 0 khi thay đổi filter/search
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter]);


  const openModal = (type, order) => {
    setModalType(type);
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newStatus = e.target.status.value;
    try {
      await OrderService.updateOrderStatus(selectedOrder.id, { status: newStatus });
      show("Cập nhật trạng thái thành công!");
      fetchOrders();
      closeModal();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Lỗi khi cập nhật trạng thái";
      show(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getCustomerName = (order) => {
    if (order.userFullName && order.userFullName.trim() !== "null null") return order.userFullName;
    return order.billingAddress?.companyName || order.shippingAddress?.companyName || "Khách hàng";
  };

  // Filter toàn bộ (search + status) rồi client-side paginate
  const filteredOrders = allOrders.filter((o) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term && !statusFilter) return true;

    const matchStatus = !statusFilter || o.status === statusFilter;
    if (!term) return matchStatus;

    const addr = o.shippingAddress || o.billingAddress || {};
    const productNames = (o.orderItems || []).map(i => (i.productName || "").toLowerCase()).join(" ");

    const matchSearch = [
      o.orderNumber || "",                            // Mã đơn
      o.id || "",                                     // ID đơn
      getCustomerName(o),                             // Tên khách
      addr.phone || addr.phoneNumber || "",           // SĐT
      addr.streetAddress || "",                       // Địa chỉ
      addr.state || "",                               // Tỉnh/thành
      addr.country || "",                             // Quốc gia
      o.paymentMethodName || "",                      // Phương thức TT
      productNames,                                   // Tên sản phẩm trong đơn
      o.note || "",                                   // Ghi chú
    ].some(field => field.toLowerCase().includes(term));

    return matchSearch && matchStatus;
  });

  const effectiveTotalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const displayedOrders = filteredOrders.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Quản lý Đơn hàng</h1>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px", display: "flex", alignItems: "center", gap: "12px", background: "var(--surface-2)", padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách, SĐT, địa chỉ, sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.9rem" }}
            />
          </div>
          <select className="input-pk" style={{ width: "200px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="ORDER_RECEIVED">Chờ xác nhận</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="ON_THE_WAY">Đang giao hàng</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "left", background: "var(--surface-2)" }}>
                <th style={{ padding: "16px", fontWeight: 600, borderRadius: "8px 0 0 8px" }}>Mã ĐH</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Khách hàng</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Ngày đặt</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Tổng tiền</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "center", borderRadius: "0 8px 8px 0" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px" }}><Loader size={30} className="spin" color="var(--pk-pink)" /></td></tr>
              ) : displayedOrders.map((order) => {
                const sd = getStatusDisplay(order.status);
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 600, color: "var(--pk-pink)" }}>
                      {order.orderNumber || `#${order.id.substring(0, 8).toUpperCase()}`}
                    </td>
                    <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 500 }}>{getCustomerName(order)}</td>
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
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <button onClick={() => openModal("view", order)} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px" }} title="Xem chi tiết">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => openModal("edit", order)} style={{ color: "var(--pk-pink)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px" }} title="Cập nhật trạng thái">
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && displayedOrders.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>Không tìm thấy đơn hàng</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && effectiveTotalPages >= 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Trang {currentPage + 1} / {effectiveTotalPages}
              {(searchTerm || statusFilter) && <span style={{ marginLeft: 8, color: "var(--pk-pink)", fontSize: "0.82rem" }}>({filteredOrders.length} đơn)</span>}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: currentPage === 0 ? "var(--surface-2)" : "#fff", color: currentPage === 0 ? "var(--text-muted)" : "var(--text-main)", cursor: currentPage === 0 ? "not-allowed" : "pointer" }}>
                <ChevronLeft size={16} /> Trước
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(effectiveTotalPages - 1, p + 1))} disabled={currentPage >= effectiveTotalPages - 1}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: currentPage >= effectiveTotalPages - 1 ? "var(--surface-2)" : "#fff", color: currentPage >= effectiveTotalPages - 1 ? "var(--text-muted)" : "var(--text-main)", cursor: currentPage >= effectiveTotalPages - 1 ? "not-allowed" : "pointer" }}>
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      <Modal isOpen={isModalOpen && modalType === "edit"} onClose={closeModal}
        title={`Cập nhật trạng thái - ${selectedOrder?.orderNumber || "#" + selectedOrder?.id?.substring(0, 8).toUpperCase()}`}
        maxWidth="400px">
        <form onSubmit={handleUpdateStatus} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Trạng thái đơn hàng</label>
            <select name="status" required defaultValue={selectedOrder?.status} className="input-pk">
              <option value="ORDER_RECEIVED">Chờ xác nhận</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="ON_THE_WAY">Đang giao hàng</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button type="button" onClick={closeModal} disabled={isSubmitting} className="btn-ghost">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isSubmitting ? <Loader size={16} className="spin" /> : null} Lưu
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isModalOpen && modalType === "view"} onClose={closeModal}
        title={`Chi tiết đơn hàng - ${selectedOrder?.orderNumber || "#" + selectedOrder?.id?.substring(0, 8).toUpperCase()}`}>
        {selectedOrder && (
          <div style={{ fontSize: "0.9rem", lineHeight: "1.8" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginBottom: "16px" }}>
              <p><strong>Khách hàng:</strong><br />{getCustomerName(selectedOrder)}</p>
              <p><strong>Ngày đặt:</strong><br />{formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}</p>
              <p><strong>Địa chỉ:</strong><br />
                {selectedOrder.shippingAddress
                  ? `${selectedOrder.shippingAddress.streetAddress || ""}, ${selectedOrder.shippingAddress.state || ""}, ${selectedOrder.shippingAddress.country || ""}`
                  : "N/A"}
              </p>
              <p><strong>Thanh toán:</strong><br />{selectedOrder.paymentMethodName || "N/A"}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px", background: "var(--surface-2)", padding: "12px", borderRadius: "8px" }}>
              <div><div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Tạm tính</div><div style={{ fontWeight: 600 }}>{formatCurrency(selectedOrder.subtotal)}</div></div>
              <div><div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Phí ship</div><div style={{ fontWeight: 600 }}>{formatCurrency(selectedOrder.shippingFee)}</div></div>
              <div><div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Tổng cộng</div><div style={{ fontWeight: 700, color: "var(--pk-pink)", fontSize: "1.1rem" }}>{formatCurrency(selectedOrder.totalAmount)}</div></div>
            </div>

            <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid var(--border)" }} />
            <p style={{ fontWeight: 600, marginBottom: "8px" }}>Sản phẩm ({selectedOrder.orderItems?.length || 0}):</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(selectedOrder.orderItems || []).map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", background: "var(--surface-2)", borderRadius: "8px" }}>
                  {item.productImageUrl && (
                    <img src={item.productImageUrl} alt={item.productName}
                      style={{ width: 40, height: 40, borderRadius: "4px", objectFit: "cover" }}
                      onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.productName || "Sản phẩm"}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>SL: {item.quantity} × {formatCurrency(item.price)}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
