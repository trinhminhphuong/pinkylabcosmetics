import { useState, useEffect, useCallback } from "react";
import { Search, Eye, Lock, Unlock, Loader, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../../components/admin/Modal";
import { AdminService } from "../../services/apiServices";
import { useToast } from "../../context/store";

// AdminService.getUsers calls GET /admin/users
// User fields: id, fullName, email, phone, role, status/enabled, createdAt, avatarUrl

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedCust, setSelectedCust] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const { show } = useToast();

  const fetchCustomers = useCallback(async (page) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await AdminService.getUsers({ pageNum: page + 1, pageSize });
      const data = res?.data;
      setCustomers(data?.items || data?.content || []);
      setTotalPages(data?.meta?.totalPages || data?.totalPages || 1);
    } catch (err) {
      console.error("AdminCustomers fetch error:", err);
      const status = err?.response?.status;
      if (status === 404 || status === 403) {
        setApiError("Chức năng quản lý khách hàng chưa được kích hoạt. Vui lòng liên hệ nhà phát triển để mở khóa endpoint /admin/users trên backend.");
      } else {
        setApiError("Lỗi khi tải danh sách khách hàng: " + (err?.response?.data?.message || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage, fetchCustomers]);

  const openModal = (type, cust = null) => {
    setModalType(type);
    setSelectedCust(cust);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCust(null);
  };

  const handleLockToggle = async () => {
    if (!selectedCust) return;
    setIsSubmitting(true);
    try {
      const isLocked = !selectedCust.enabled;
      if (isLocked) {
        await AdminService.unlockUser(selectedCust.id);
        show("Mở khóa tài khoản thành công!");
      } else {
        await AdminService.lockUser(selectedCust.id);
        show("Khóa tài khoản thành công!");
      }
      fetchCustomers(currentPage);
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi khi thực hiện thao tác";
      show(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.fullName || c.username || "").toLowerCase().includes(term) ||
      (c.email || "").toLowerCase().includes(term) ||
      (c.phone || "").includes(term)
    );
  });

  const getStatusStyle = (user) => {
    if (user.enabled === false || user.status === "LOCKED") {
      return { label: "Bị khóa", bg: "#fee2e2", color: "#ef4444" };
    }
    return { label: "Hoạt động", bg: "#e0f7f4", color: "#12c2b0" };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try { return new Date(dateStr).toLocaleDateString("vi-VN"); } catch { return dateStr; }
  };

  const getInitial = (user) => {
    const name = user.fullName || user.username || user.email || "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Quản lý Khách hàng</h1>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px", color: "#92400e", fontSize: "0.9rem", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>⚠️</span>
          <div>{apiError}</div>
        </div>
      )}

      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center", maxWidth: "450px" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "var(--surface-2)", padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng, email, sđt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "left", background: "var(--surface-2)" }}>
              <th style={{ padding: "16px", fontWeight: 600, borderRadius: "8px 0 0 8px" }}>Tên khách hàng</th>
              <th style={{ padding: "16px", fontWeight: 600 }}>Liên hệ</th>
              <th style={{ padding: "16px", fontWeight: 600 }}>Vai trò</th>
              <th style={{ padding: "16px", fontWeight: 600 }}>Ngày đăng ký</th>
              <th style={{ padding: "16px", fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: "16px", fontWeight: 600, textAlign: "center", borderRadius: "0 8px 8px 0" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px" }}><Loader size={30} className="spin" color="var(--pk-pink)" /></td></tr>
            ) : filtered.map((cust) => {
              const st = getStatusStyle(cust);
              return (
                <tr key={cust.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "12px" }}>
                    {cust.avatarUrl ? (
                      <img src={cust.avatarUrl} alt={cust.fullName}
                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                        onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--pk-pink-light)", color: "var(--pk-pink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>
                        {getInitial(cust)}
                      </div>
                    )}
                    {cust.fullName || cust.username || "N/A"}
                  </td>
                  <td style={{ padding: "16px", fontSize: "0.85rem" }}>
                    <div>{cust.email}</div>
                    <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>{cust.phone || "Chưa có SĐT"}</div>
                  </td>
                  <td style={{ padding: "16px", fontSize: "0.9rem" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600, background: cust.role === "ADMIN" ? "#f3e8ff" : "#eff6ff", color: cust.role === "ADMIN" ? "#8b5cf6" : "#3b82f6" }}>
                      {cust.role || "USER"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {formatDate(cust.createdAt)}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <button onClick={() => openModal("view", cust)} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px" }} title="Chi tiết">
                        <Eye size={18} />
                      </button>
                      {cust.role !== "ADMIN" && (
                        <button onClick={() => openModal("lock", cust)}
                          style={{ color: cust.enabled === false ? "#12c2b0" : "#f59e0b", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px" }}
                          title={cust.enabled === false ? "Mở khóa" : "Khóa tài khoản"}>
                          {cust.enabled === false ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!isLoading && filtered.length === 0 && !apiError && (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>Không tìm thấy khách hàng</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && !apiError && totalPages >= 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Trang {currentPage + 1} / {totalPages}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: currentPage === 0 ? "var(--surface-2)" : "#fff", color: currentPage === 0 ? "var(--text-muted)" : "var(--text-main)", cursor: currentPage === 0 ? "not-allowed" : "pointer" }}>
                <ChevronLeft size={16} /> Trước
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: currentPage >= totalPages - 1 ? "var(--surface-2)" : "#fff", color: currentPage >= totalPages - 1 ? "var(--text-muted)" : "var(--text-main)", cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer" }}>
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      <Modal isOpen={isModalOpen && modalType === "view"} onClose={closeModal} title="Thông tin khách hàng">
        {selectedCust && (
          <div style={{ fontSize: "0.9rem", lineHeight: "1.8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              {selectedCust.avatarUrl ? (
                <img src={selectedCust.avatarUrl} alt={selectedCust.fullName}
                  style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--pk-pink-light)", color: "var(--pk-pink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
                  {getInitial(selectedCust)}
                </div>
              )}
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{selectedCust.fullName || selectedCust.username}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{selectedCust.email}</div>
              </div>
            </div>
            <p><strong>ID:</strong> <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{selectedCust.id}</span></p>
            <p><strong>Số điện thoại:</strong> {selectedCust.phone || "Chưa cung cấp"}</p>
            <p><strong>Vai trò:</strong> {selectedCust.role || "USER"}</p>
            <p><strong>Ngày đăng ký:</strong> {formatDate(selectedCust.createdAt)}</p>
            <p><strong>Trạng thái:</strong> {getStatusStyle(selectedCust).label}</p>
          </div>
        )}
      </Modal>

      {/* Lock/Unlock Modal */}
      <Modal isOpen={isModalOpen && modalType === "lock"} onClose={closeModal} title="Xác nhận thao tác" maxWidth="400px">
        <p style={{ marginBottom: "24px", color: "var(--text-muted)" }}>
          Bạn có chắc muốn <strong>{selectedCust?.enabled === false ? "mở khóa" : "khóa"}</strong> tài khoản của{" "}
          <strong>{selectedCust?.fullName || selectedCust?.email}</strong>?
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={closeModal} disabled={isSubmitting} className="btn-ghost">Hủy</button>
          <button onClick={handleLockToggle} disabled={isSubmitting} className="btn-primary"
            style={{ background: selectedCust?.enabled === false ? "#12c2b0" : "#f59e0b", boxShadow: "none", display: "flex", alignItems: "center", gap: 8 }}>
            {isSubmitting ? <Loader size={16} className="spin" color="#fff" /> : null}
            {selectedCust?.enabled === false ? "Mở khóa" : "Khóa tài khoản"}
          </button>
        </div>
      </Modal>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
