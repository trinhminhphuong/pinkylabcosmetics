import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Loader } from "lucide-react";
import Modal from "../../components/admin/Modal";
import { CategoryService } from "../../services/apiServices";
import { useToast } from "../../context/store";

// Category API fields: id, name, description, totalProducts

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10;

  const { show } = useToast();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Load all categories (they are few, no need to paginate)
      const res = await CategoryService.getAllCategories({ pageNum: 1, pageSize: 100 });
      const data = res?.data;
      setCategories(data?.items || data?.content || []);
    } catch (err) {
      console.error(err);
      show("Lỗi khi tải danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (type, cat = null) => {
    setModalType(type);
    setSelectedCat(cat);
    if (type === "add") {
      setFormData({ name: "", description: "" });
    } else if (type === "edit") {
      setFormData({ name: cat.name || "", description: cat.description || "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCat(null);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await CategoryService.deleteCategory(selectedCat.id);
      show("Xóa danh mục thành công!");
      fetchCategories();
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi khi xóa danh mục";
      show(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { name: formData.name.trim(), description: formData.description.trim() };
      if (modalType === "add") {
        await CategoryService.createCategory(payload);
        show("Thêm danh mục thành công!");
      } else {
        await CategoryService.updateCategory(selectedCat.id, payload);
        show("Cập nhật danh mục thành công!");
      }
      fetchCategories();
      closeModal();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Lỗi khi lưu danh mục";
      show(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = categories.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // Reset trang khi search thay đổi
  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(0); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Quản lý Danh mục</h1>
        <button className="btn-primary" style={{ padding: "10px 20px" }} onClick={() => openModal("add")}>
          <Plus size={18} /> Thêm danh mục
        </button>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center", maxWidth: "400px" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "var(--surface-2)", padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "left", background: "var(--surface-2)" }}>
              <th style={{ padding: "16px", fontWeight: 600, borderRadius: "8px 0 0 8px" }}>Tên danh mục</th>
              <th style={{ padding: "16px", fontWeight: 600 }}>Mô tả</th>
              <th style={{ padding: "16px", fontWeight: 600 }}>Số sản phẩm</th>
              <th style={{ padding: "16px", fontWeight: 600, textAlign: "center", borderRadius: "0 8px 8px 0" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px" }}><Loader size={30} className="spin" color="var(--pk-pink)" /></td></tr>
            ) : paginated.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 600 }}>{cat.name}</td>
                <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--text-muted)" }}>{cat.description || "Không có mô tả"}</td>
                {/* API returns totalProducts directly */}
                <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--pk-pink)", fontWeight: 600 }}>
                  {cat.totalProducts ?? 0} SP
                </td>
                <td style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <button onClick={() => openModal("edit", cat)} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", transition: "all 0.2s" }}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => openModal("delete", cat)} style={{ color: "var(--pk-red)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", transition: "all 0.2s" }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && paginated.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>Không có danh mục nào</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Trang {currentPage + 1} / {totalPages}
              <span style={{ marginLeft: 8, color: "var(--pk-pink)", fontSize: "0.82rem" }}>({filtered.length} danh mục)</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: currentPage === 0 ? "var(--surface-2)" : "#fff", color: currentPage === 0 ? "var(--text-muted)" : "var(--text-main)", cursor: currentPage === 0 ? "not-allowed" : "pointer", fontSize: "0.9rem" }}>
                ‹ Trước
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: currentPage >= totalPages - 1 ? "var(--surface-2)" : "#fff", color: currentPage >= totalPages - 1 ? "var(--text-muted)" : "var(--text-main)", cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer", fontSize: "0.9rem" }}>
                Sau ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen && (modalType === "add" || modalType === "edit")} onClose={closeModal}
        title={modalType === "add" ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Tên danh mục *</label>
            <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-pk" placeholder="Nhập tên danh mục..." />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Mô tả</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-pk" rows="3" placeholder="Nhập mô tả danh mục..." style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button type="button" onClick={closeModal} disabled={isSubmitting} className="btn-ghost">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isSubmitting ? <Loader size={16} className="spin" /> : null} Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isModalOpen && modalType === "delete"} onClose={closeModal} title="Xác nhận xóa" maxWidth="400px">
        <p style={{ marginBottom: "24px", color: "var(--text-muted)" }}>
          Bạn có chắc muốn xóa danh mục <strong>{selectedCat?.name}</strong>? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={closeModal} disabled={isSubmitting} className="btn-ghost">Hủy</button>
          <button onClick={handleDelete} disabled={isSubmitting} className="btn-primary"
            style={{ background: "var(--pk-red)", boxShadow: "none", display: "flex", alignItems: "center", gap: 8 }}>
            {isSubmitting ? <Loader size={16} className="spin" color="#fff" /> : null} Xóa danh mục
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
