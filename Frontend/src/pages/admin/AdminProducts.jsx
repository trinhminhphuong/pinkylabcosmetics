import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Filter, Loader, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../../components/admin/Modal";
import { ProductService, CategoryService, BrandService } from "../../services/apiServices";
import { useToast } from "../../context/store";

const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'add', 'edit', 'delete'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Form states
  const [formData, setFormData] = useState({
    name: "", description: "", oldPrice: "", stock: "", sku: "", brandId: "", categoryId: ""
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const { show } = useToast();

  const fetchProducts = useCallback(async (page) => {
    setIsLoading(true);
    try {
      // Backend pageNum is 1-based (it subtracts 1 internally)
      const res = await ProductService.getAllProducts({ pageNum: page + 1, pageSize });
      const data = res?.data;
      setProducts(data?.items || data?.content || []);
      // totalPages is nested inside meta
      setTotalPages(data?.meta?.totalPages || data?.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      show("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, show]);

  const fetchInitialData = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        CategoryService.getAllCategories({ pageNum: 1, pageSize: 100 }),
        BrandService.getAllBrands({ pageNum: 1, pageSize: 100 })
      ]);
      const catData = catRes?.data;
      const brandData = brandRes?.data;
      setCategories(catData?.items || catData?.content || []);
      setBrands(brandData?.items || brandData?.content || []);
    } catch (error) {
      console.error("Lỗi khi tải danh mục/thương hiệu:", error);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  const openModal = (type, product = null) => {
    setModalType(type);
    setSelectedProduct(product);
    if (type === 'add') {
      setFormData({ name: "", description: "", oldPrice: "", stock: "", sku: "", brandId: "", categoryId: "" });
      setSelectedFiles([]);
      setExistingImages([]);
    } else if (type === 'edit') {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        oldPrice: product.oldPrice || product.price || 0,
        stock: product.stock || 0,
        sku: product.sku || "",
        brandId: product.brand?.id || product.brandId || "",
        categoryId: product.category?.id || product.categoryId || ""
      });
      setSelectedFiles([]);
      setExistingImages(product.imageUrl || (product.image ? [product.image] : []));
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await ProductService.deleteProduct(selectedProduct.id);
      show("Xóa sản phẩm thành công!");
      fetchProducts(currentPage);
      closeModal();
    } catch (err) {
      show("Lỗi khi xóa sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      oldPrice: Number(formData.oldPrice),
      stock: Number(formData.stock),
      sku: formData.sku,
      brandId: formData.brandId,
      categoryId: formData.categoryId,
      tagIds: []
    };

    try {
      let productId = null;
      if (modalType === 'add') {
        // ProductService already does .then(res => res.data), so result = { status, data: { id, ... } }
        const createRes = await ProductService.createProduct(payload);
        productId = createRes?.data?.id || createRes?.id;
        show("Thêm sản phẩm thành công!");
      } else {
        productId = selectedProduct.id;
        const updatePayload = { ...payload, imageUrl: existingImages };
        await ProductService.updateProduct(productId, updatePayload);
        show("Cập nhật sản phẩm thành công!");
      }

      // Upload images if any
      if (selectedFiles.length > 0 && productId) {
        const uploadData = new FormData();
        Array.from(selectedFiles).forEach(file => {
          uploadData.append("file", file);
        });
        try {
          console.log("Uploading images to product:", productId, "files:", selectedFiles.length);
          const uploadRes = await ProductService.uploadImages(productId, uploadData);
          console.log("Upload response:", uploadRes);
          show("Tải ảnh lên thành công!");
        } catch (imgErr) {
          console.error("Image upload error:", imgErr?.response?.status, imgErr?.response?.data);
          const errMsg = imgErr?.response?.data?.message || imgErr?.response?.data?.error || imgErr?.message || "Lỗi không xác định";
          show(`Sản phẩm đã lưu, nhưng lỗi tải ảnh: ${errMsg}`);
        }
      }

      fetchProducts(currentPage);
      closeModal();
    } catch (err) {
      console.error(err);
      show(err?.response?.data?.message || "Lỗi khi lưu sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "" || (p.category?.id === filterCategory || p.categoryId === filterCategory);
    return matchesSearch && matchesCategory;
  });

  const getStatus = (stock) => {
    if (stock > 10) return { label: "Còn hàng", bg: "#e0f7f4", color: "#12c2b0" };
    if (stock > 0) return { label: "Sắp hết", bg: "#fef3c7", color: "#f59e0b" };
    return { label: "Hết hàng", bg: "#fee2e2", color: "var(--pk-red)" };
  };

  const resolveImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/40";
    if (url.startsWith("http")) return url;
    return `${BACKEND_ORIGIN}/${url}`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Quản lý Sản phẩm</h1>
        <button className="btn-primary" style={{ padding: "10px 20px" }} onClick={() => openModal('add')}>
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        {/* Filters & Search */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px", display: "flex", alignItems: "center", gap: "12px", background: "var(--surface-2)", padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.9rem" }}
            />
          </div>
          <select className="input-pk" style={{ width: "200px" }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "left", background: "var(--surface-2)" }}>
                <th style={{ padding: "16px", fontWeight: 600, borderRadius: "8px 0 0 8px" }}>Hình ảnh</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Tên sản phẩm</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Danh mục</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Giá</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Tồn kho</th>
                <th style={{ padding: "16px", fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: "16px", fontWeight: 600, textAlign: "center", borderRadius: "0 8px 8px 0" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px" }}><Loader size={30} className="spin" color="var(--pk-pink)" /></td></tr>
              ) : filteredProducts.map((prod) => {
                const status = getStatus(prod.stock);
                // Use the last image in the array so newly uploaded ones appear first
                const lastImgUrl = prod.imageUrl && prod.imageUrl.length > 0 
                  ? prod.imageUrl[prod.imageUrl.length - 1] 
                  : prod.image;
                const displayImg = resolveImageUrl(lastImgUrl);

                return (
                  <tr key={prod.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px" }}>
                      <img 
                        src={displayImg} 
                        alt={prod.name} 
                        style={{ width: 40, height: 40, borderRadius: "4px", objectFit: "cover" }} 
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40?text=No+Image"; }}
                      />
                    </td>
                    <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 600 }}>{prod.name}</td>
                    <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--text-muted)" }}>{prod.category?.name || "N/A"}</td>
                    <td style={{ padding: "16px", fontSize: "0.9rem", fontWeight: 600, color: "var(--pk-pink)" }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.oldPrice || prod.price || 0)}
                    </td>
                    <td style={{ padding: "16px", fontSize: "0.9rem" }}>{prod.stock}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600, background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <button onClick={() => openModal('edit', prod)} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", transition: "all 0.2s" }} title="Sửa">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => openModal('delete', prod)} style={{ color: "var(--pk-red)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", transition: "all 0.2s" }} title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filteredProducts.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>Không có sản phẩm nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages >= 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Trang {currentPage + 1} / {totalPages}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: currentPage === 0 ? "var(--surface-2)" : "#fff", color: currentPage === 0 ? "var(--text-muted)" : "var(--text-main)", cursor: currentPage === 0 ? "not-allowed" : "pointer" }}
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: currentPage >= totalPages - 1 ? "var(--surface-2)" : "#fff", color: currentPage >= totalPages - 1 ? "var(--text-muted)" : "var(--text-main)", cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer" }}
              >
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isModalOpen && (modalType === 'add' || modalType === 'edit')} 
        onClose={closeModal} 
        title={modalType === 'add' ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
        maxWidth="600px"
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Tên sản phẩm *</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-pk" placeholder="Nhập tên sản phẩm..." />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Mã SKU *</label>
              <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="input-pk" placeholder="VD: PK-001" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Giá (VNĐ) *</label>
              <input required type="number" min="0" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="input-pk" placeholder="0" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Tồn kho *</label>
              <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="input-pk" placeholder="0" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Danh mục *</label>
              <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="input-pk">
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Thương hiệu</label>
              <select value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})} className="input-pk">
                <option value="">Chọn thương hiệu</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Hình ảnh</label>
            
            {modalType === 'edit' && selectedProduct && (
              <div style={{ marginBottom: "12px", padding: "10px", background: "#f8f9fa", borderRadius: "6px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>Ảnh hiện tại:</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {existingImages.length === 0 ? (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Chưa có ảnh</span>
                  ) : (
                    existingImages.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={resolveImageUrl(img)} alt={`img-${i}`} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)" }} />
                        <button type="button" onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: -6, right: -6, background: "white", borderRadius: "50%", padding: 2, cursor: "pointer", border: "1px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20 }}>
                          <Trash2 size={12} color="red" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", border: "2px dashed var(--border)", borderRadius: "8px", background: "var(--surface-2)", textAlign: "center" }}>
              <input type="file" multiple accept="image/*" id="productImages" style={{ display: "none" }} onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
              <label htmlFor="productImages" style={{ cursor: "pointer", color: "var(--pk-pink)", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <ImageIcon size={20} /> Chọn ảnh mới (Tải lên nhiều ảnh)
              </label>
              {selectedFiles.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
                  {selectedFiles.map((file, i) => (
                    <div key={i} style={{ position: "relative" }}>
                       <img src={URL.createObjectURL(file)} alt={`preview-${i}`} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)", opacity: 0.9 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>* Chọn ảnh mới sẽ thêm vào danh sách ảnh hiện tại.</p>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 500 }}>Mô tả</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-pk" rows={4} placeholder="Nhập mô tả sản phẩm..." />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
            <button type="button" className="btn-ghost" onClick={closeModal} disabled={isSubmitting}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="spin" size={18} /> : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isModalOpen && modalType === 'delete'} 
        onClose={closeModal} 
        title="Xác nhận xóa"
        maxWidth="400px"
      >
        <p style={{ marginBottom: "24px" }}>
          Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedProduct?.name}</strong> không? Hành động này không thể hoàn tác.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button className="btn-ghost" onClick={closeModal} disabled={isSubmitting}>Hủy</button>
          <button className="btn-primary" style={{ background: "var(--pk-red)", color: "white" }} onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? <Loader className="spin" size={18} /> : "Xóa sản phẩm"}
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
