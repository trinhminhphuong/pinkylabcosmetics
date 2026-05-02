import { useState, useEffect, useRef } from "react";
import { Plus, Search, Edit, Trash2, Loader, Upload, X } from "lucide-react";
import Modal from "../../components/admin/Modal";
import { BrandService } from "../../services/apiServices";
import { useToast } from "../../context/store";

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const { show } = useToast();
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const res = await BrandService.getAllBrands({ pageNum: 1, pageSize: 100 });
      const data = res?.data;
      setBrands(data?.items || data?.content || []);
    } catch (err) {
      console.error(err);
      show("Lỗi khi tải danh sách thương hiệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openModal = (type, brand = null) => {
    setModalType(type);
    setSelectedBrand(brand);
    
    // Reset form
    setSelectedImage(null);
    setPreviewImage(null);
    
    if (type === "add") {
      setFormData({ name: "", description: "" });
    } else if (type === "edit") {
      setFormData({ name: brand.name || "", description: brand.description || "" });
      if (brand.logoUrl) {
        setPreviewImage(brand.logoUrl);
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        show("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewImage(selectedBrand?.logoUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await BrandService.deleteBrand(selectedBrand.id);
      show("Xóa thương hiệu thành công!");
      fetchBrands();
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi khi xóa thương hiệu";
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
      let brandId;

      if (modalType === "add") {
        const res = await BrandService.createBrand(payload);
        brandId = res?.data?.id;
      } else {
        await BrandService.updateBrand(selectedBrand.id, payload);
        brandId = selectedBrand.id;
      }

      // Upload logo if an image was selected
      if (selectedImage && brandId) {
        const formData = new FormData();
        formData.append("file", selectedImage);
        await BrandService.uploadLogo(brandId, formData);
      }

      show(modalType === "add" ? "Thêm thương hiệu thành công!" : "Cập nhật thương hiệu thành công!");
      fetchBrands();
      closeModal();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Lỗi khi lưu thương hiệu";
      show(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = brands.filter((b) =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handleSearch = (val) => { setSearchTerm(val); setCurrentPage(0); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Quản lý Thương hiệu</h1>
        <button className="btn-primary" style={{ padding: "10px 20px" }} onClick={() => openModal("add")}>
          <Plus size={18} /> Thêm thương hiệu
        </button>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center", maxWidth: "400px" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", background: "var(--surface-2)", padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm kiếm thương hiệu..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "left", background: "var(--surface-2)" }}>
                <th style={{ padding: "16px", fontWeight: 600, borderRadius: "8px 0 0 8px", width: "100px" }}>Logo</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Tên thương hiệu</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Mô tả</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Số sản phẩm</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "center", borderRadius: "0 8px 8px 0", width: "120px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px" }}><Loader size={30} className="spin" color="var(--pk-pink)" /></td></tr>
              ) : paginated.map((brand) => (
                <tr key={brand.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px" }}>
                    {brand.logoUrl ? (
                      <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "#fff", display: "flex", alignItems: "center", justifyItems: "center", border: "1px solid var(--border)", overflow: "hidden" }}>
                        <img src={brand.logoUrl} alt={brand.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    ) : (
                      <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.8rem", border: "1px dashed var(--border)" }}>
                        No logo
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "16px", fontSize: "0.95rem", fontWeight: 600 }}>{brand.name}</td>
                  <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--text-muted)" }}>{brand.description || "Không có mô tả"}</td>
                  <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--pk-pink)", fontWeight: 600 }}>
                    {brand.totalProducts ?? 0} SP
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <button onClick={() => openModal("edit", brand)} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", transition: "all 0.2s" }} title="Sửa">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => openModal("delete", brand)} style={{ color: "var(--pk-red)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", transition: "all 0.2s" }} title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && paginated.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>Không tìm thấy thương hiệu nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Trang {currentPage + 1} / {totalPages}
              <span style={{ marginLeft: 8, color: "var(--pk-pink)", fontSize: "0.82rem" }}>({filtered.length} thương hiệu)</span>
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
        title={modalType === "add" ? "Thêm thương hiệu mới" : "Chỉnh sửa thương hiệu"} maxWidth="500px">
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Logo Upload Section */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Logo thương hiệu</label>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ 
                width: "100px", height: "100px", borderRadius: "12px", border: "1px solid var(--border)", 
                background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", position: "relative"
              }}>
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
                    {selectedImage && (
                      <button type="button" onClick={clearImage} style={{
                        position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.5)", color: "#fff",
                        border: "none", borderRadius: "50%", padding: 2, cursor: "pointer", display: "flex", alignItems: "center"
                      }}>
                        <X size={14} />
                      </button>
                    )}
                  </>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center" }}>Chưa có logo</span>
                )}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  id="brand-logo-upload"
                />
                <label htmlFor="brand-logo-upload" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", justifyContent: "center", padding: "8px 16px" }}>
                  <Upload size={16} /> Chọn ảnh mới
                </label>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                  Định dạng hỗ trợ: JPG, PNG, WEBP.<br/>Kích thước tối đa: 5MB.<br/>
                  (Khuyên dùng ảnh nền trong suốt)
                </p>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Tên thương hiệu *</label>
            <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-pk" placeholder="Nhập tên thương hiệu..." />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Mô tả</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-pk" rows="4" placeholder="Nhập thông tin giới thiệu thương hiệu..." style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" onClick={closeModal} disabled={isSubmitting} className="btn-ghost">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isSubmitting ? <Loader size={16} className="spin" /> : null} Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isModalOpen && modalType === "delete"} onClose={closeModal} title="Xác nhận xóa" maxWidth="400px">
        <p style={{ marginBottom: "24px", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Bạn có chắc muốn xóa thương hiệu <strong>{selectedBrand?.name}</strong>? Các sản phẩm thuộc thương hiệu này có thể bị ảnh hưởng.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={closeModal} disabled={isSubmitting} className="btn-ghost">Hủy</button>
          <button onClick={handleDelete} disabled={isSubmitting} className="btn-primary"
            style={{ background: "var(--pk-red)", boxShadow: "none", display: "flex", alignItems: "center", gap: 8 }}>
            {isSubmitting ? <Loader size={16} className="spin" color="#fff" /> : null} Xóa thương hiệu
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
