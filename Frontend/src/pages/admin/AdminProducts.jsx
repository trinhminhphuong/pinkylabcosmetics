import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Loader, Image as ImageIcon, ChevronLeft, ChevronRight, Tag, X } from "lucide-react";
import Modal from "../../components/admin/Modal";
import { ProductService, CategoryService, BrandService, PromotionService } from "../../services/apiServices";
import { useToast } from "../../context/store";

const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";

// Ảnh fallback dạng data URI — không bao giờ fail, tránh onError loop
const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='18' fill='%23d1d5db'%3E🖼%3C/text%3E%3C/svg%3E";

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

  // Promotion states
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoTargetProduct, setPromoTargetProduct] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [promoForm, setPromoForm] = useState({
    name: "", discountValue: "", discountType: "PERCENTAGE",
    startDate: "", endDate: ""
  });
  const [isPromoSubmitting, setIsPromoSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [allProducts, setAllProducts] = useState([]); // toàn bộ để filter client-side

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
      const res = await ProductService.getAllProducts({ pageNum: page + 1, pageSize });
      const data = res?.data;
      const items = data?.items || data?.content || [];
      // Sắp xếp mới nhất lên đầu
      const sorted = [...items].sort((a, b) => {
        if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
        return (b.id || "").localeCompare(a.id || "");
      });
      setProducts(sorted);
      setTotalPages(data?.meta?.totalPages || data?.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      show("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, show]);

  // Fetch toàn bộ sản phẩm cho client-side filter
  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await ProductService.getAllProducts({ pageNum: 1, pageSize: 9999 });
      const data = res?.data;
      const items = data?.items || data?.content || [];
      const sorted = [...items].sort((a, b) => {
        if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
        return (b.id || "").localeCompare(a.id || "");
      });
      setAllProducts(sorted);
    } catch (e) {
      console.error("Lỗi fetch all:", e);
    }
  }, []);

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
    fetchAllProducts();
  }, [fetchInitialData, fetchAllProducts]);

  useEffect(() => {
    // Không còn dùng server pagination — luôn dùng allProducts
  }, [currentPage, fetchProducts, filterCategory, searchTerm]);

  // Reset về trang 0 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(0);
  }, [filterCategory, searchTerm]);

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

  const openPromoModal = async (product) => {
    setPromoTargetProduct(product);
    setPromoForm({ name: "", discountValue: "", discountType: "PERCENTAGE", startDate: "", endDate: "" });
    try {
      const res = await PromotionService.getPromotionsByProduct(product.id);
      setPromotions(res?.data || []);
    } catch { setPromotions([]); }
    setIsPromoModalOpen(true);
  };

  const closePromoModal = () => {
    setIsPromoModalOpen(false);
    setPromoTargetProduct(null);
    setPromotions([]);
  };

  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    setIsPromoSubmitting(true);
    try {
      const payload = {
        name: promoForm.name,
        discountValue: Number(promoForm.discountValue),
        discountType: promoForm.discountType,
        startDate: new Date(promoForm.startDate).toISOString().slice(0, 19),
        endDate: new Date(promoForm.endDate).toISOString().slice(0, 19),
      };
      await PromotionService.createPromotion(promoTargetProduct.id, payload);
      show("Tạo khuyến mãi thành công!");
      const res = await PromotionService.getPromotionsByProduct(promoTargetProduct.id);
      setPromotions(res?.data || []);
      setPromoForm({ name: "", discountValue: "", discountType: "PERCENTAGE", startDate: "", endDate: "" });
      fetchAllProducts();
    } catch (err) {
      show(err?.response?.data?.message || "Lỗi khi tạo khuyến mãi");
    } finally {
      setIsPromoSubmitting(false);
    }
  };

  const handleDeletePromotion = async (promoId) => {
    try {
      await PromotionService.deletePromotion(promoId);
      show("Đã xóa khuyến mãi!");
      setPromotions(prev => prev.filter(p => p.id !== promoId));
      fetchAllProducts();
    } catch {
      show("Lỗi khi xóa khuyến mãi");
    }
  };

  const handleTogglePromotion = async (promo) => {
    const currentActive = promo.active ?? promo.isActive ?? false;
    try {
      await PromotionService.updatePromotion(promo.id, { isActive: !currentActive });
      show(currentActive ? "Đã tắt khuyến mãi!" : "Đã bật khuyến mãi!");
      const res = await PromotionService.getPromotionsByProduct(promoTargetProduct.id);
      setPromotions(res?.data || []);
      fetchAllProducts();
    } catch {
      show("Lỗi khi cập nhật khuyến mãi");
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await ProductService.deleteProduct(selectedProduct.id);
      show("Xóa sản phẩm thành công!");
      fetchAllProducts();
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

  // Luôn dùng allProducts (sort mới nhất, fetch toàn bộ) — client-side filter + paginate
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || (p.category?.id === filterCategory || p.categoryId === filterCategory || p.category?.name === filterCategory);
    return matchesSearch && matchesCategory;
  });

  const effectiveTotalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const displayedProducts = filteredProducts.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

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
              ) : displayedProducts.map((prod) => {
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
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
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
                        <button onClick={() => openPromoModal(prod)} style={{ color: "var(--pk-pink)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", transition: "all 0.2s" }} title="Khuyến mãi">
                          <Tag size={18} />
                        </button>
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
              {!isLoading && displayedProducts.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>Không có sản phẩm nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && effectiveTotalPages >= 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Trang {currentPage + 1} / {effectiveTotalPages}
              {(filterCategory || searchTerm) && <span style={{ marginLeft: 8, color: "var(--pk-pink)", fontSize: "0.82rem" }}>({filteredProducts.length} sản phẩm)</span>}
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
                onClick={() => setCurrentPage(p => Math.min(effectiveTotalPages - 1, p + 1))}
                disabled={currentPage >= effectiveTotalPages - 1}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: currentPage >= effectiveTotalPages - 1 ? "var(--surface-2)" : "#fff", color: currentPage >= effectiveTotalPages - 1 ? "var(--text-muted)" : "var(--text-main)", cursor: currentPage >= effectiveTotalPages - 1 ? "not-allowed" : "pointer" }}
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

      <Modal
        isOpen={isPromoModalOpen}
        onClose={closePromoModal}
        title={`Khuyến mãi — ${promoTargetProduct?.name || ""}`}
        maxWidth="620px"
      >
        {/* Danh sách khuyến mãi hiện tại */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontWeight: 600, marginBottom: "10px", fontSize: "0.9rem" }}>Khuyến mãi hiện tại:</p>
          {promotions.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Chưa có khuyến mãi nào.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {promotions.map(p => {
                const isActive = p.active ?? p.isActive ?? false;
                const discVal = p.discountValue != null ? Number(p.discountValue) : 0;
                const unit = (p.discountType === "PERCENTAGE" || p.discountType === "percent") ? "%" : "đ";
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: isActive ? "#fff0f6" : "var(--surface-2)" }}>
                    <div style={{ flex: 1, flexWrap: "wrap", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.name}</span>
                      <span style={{ color: "var(--pk-pink)", fontWeight: 700, background: "#ffe4f0", padding: "2px 8px", borderRadius: 99, fontSize: "0.8rem" }}>
                        -{discVal}{unit}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {new Date(p.startDate).toLocaleDateString("vi-VN")} → {new Date(p.endDate).toLocaleDateString("vi-VN")}
                      </span>
                      <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: isActive ? "#dcfce7" : "#fee2e2", color: isActive ? "#16a34a" : "#dc2626" }}>
                        {isActive ? "Đang bật" : "Đã tắt"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button type="button" onClick={() => handleTogglePromotion(p)} style={{ fontSize: "0.78rem", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border)", cursor: "pointer", background: "white" }}>
                        {isActive ? "Tắt" : "Bật"}
                      </button>
                      <button type="button" onClick={() => handleDeletePromotion(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pk-red)" }}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form tạo khuyến mãi mới */}
        <p style={{ fontWeight: 600, marginBottom: "12px", fontSize: "0.9rem", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>Tạo khuyến mãi mới:</p>
        <form onSubmit={handleCreatePromotion} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Row 1: Tên | Loại giảm | Giá trị giảm */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Tên khuyến mãi *</label>
              <input required className="input-pk" placeholder="VD: Flash Sale tháng 5" value={promoForm.name} onChange={e => setPromoForm({ ...promoForm, name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Loại giảm *</label>
              <select required className="input-pk" value={promoForm.discountType} onChange={e => setPromoForm({ ...promoForm, discountType: e.target.value })}>
                <option value="PERCENTAGE">% Phần trăm</option>
                <option value="FIXED">Cố định (đ)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>
                Giá trị giảm * {promoForm.discountType === "PERCENTAGE" ? "(%)" : "(đ)"}
              </label>
              <input
                required type="number" min="0"
                max={promoForm.discountType === "PERCENTAGE" ? 100 : undefined}
                className="input-pk"
                placeholder={promoForm.discountType === "PERCENTAGE" ? "0-100" : "50000"}
                value={promoForm.discountValue}
                onChange={e => setPromoForm({ ...promoForm, discountValue: e.target.value })}
              />
            </div>
          </div>
          {/* Row 2: Ngày bắt đầu | Ngày kết thúc */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Ngày bắt đầu *</label>
              <input required type="datetime-local" className="input-pk" value={promoForm.startDate} onChange={e => setPromoForm({ ...promoForm, startDate: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Ngày kết thúc *</label>
              <input required type="datetime-local" className="input-pk" value={promoForm.endDate} onChange={e => setPromoForm({ ...promoForm, endDate: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" className="btn-ghost" onClick={closePromoModal}>Đóng</button>
            <button type="submit" className="btn-primary" disabled={isPromoSubmitting}>
              {isPromoSubmitting ? <Loader className="spin" size={18} /> : "Tạo khuyến mãi"}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
