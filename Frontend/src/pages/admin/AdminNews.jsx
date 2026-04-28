import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Loader, Image as ImageIcon, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Modal from "../../components/admin/Modal";
import { NewsService, NewsCategoryService } from "../../services/apiServices";
import { useToast } from "../../context/store";

const EMPTY_FORM = { title: "", content: "", categoryId: "" };

function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminNews() {
  const [newsList, setNewsList]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [modalType, setModalType]       = useState(""); // 'add' | 'edit' | 'delete'
  const [selected, setSelected]         = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imageFiles, setImageFiles]     = useState([]);
  const [currentPage, setCurrentPage]   = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const PAGE_SIZE = 10;
  const { show } = useToast();

  const fetchNews = useCallback(async (page) => {
    setIsLoading(true);
    try {
      const res  = await NewsService.getAllNews({ pageNum: page + 1, pageSize: PAGE_SIZE });
      const data = res?.data;
      setNewsList(data?.items || data?.content || []);
      setTotalPages(data?.meta?.totalPages || data?.totalPages || 1);
    } catch {
      show("Lỗi khi tải danh sách tin tức");
    } finally {
      setIsLoading(false);
    }
  }, [show]);

  useEffect(() => { fetchNews(currentPage); }, [currentPage, fetchNews]);

  useEffect(() => {
    NewsCategoryService.getAllCategories({ pageNum: 1, pageSize: 100 })
      .then(res => {
        const data = res?.data;
        setCategories(data?.items || data?.content || []);
      }).catch(() => {});
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    if (type === "add") {
      setFormData(EMPTY_FORM);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setImageFiles([]);
    } else if (type === "edit") {
      setFormData({
        title: item.title || "",
        content: item.content || "",
        categoryId: item.category?.id || ""
      });
      setThumbnailFile(null);
      setThumbnailPreview(item.thumbnailUrl || null);
      setImageFiles([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelected(null); };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return show("Vui lòng nhập tiêu đề và nội dung");
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId || null,
        tagIds: []
      };

      let newsId;
      if (modalType === "add") {
        const res = await NewsService.createNews(payload);
        newsId = res?.data?.id || res?.id;
        show("Tạo bài viết thành công!");
      } else {
        newsId = selected.id;
        await NewsService.updateNews(newsId, payload);
        show("Cập nhật bài viết thành công!");
      }

      // Upload thumbnail
      if (thumbnailFile && newsId) {
        const fd = new FormData();
        fd.append("file", thumbnailFile);
        try {
          await NewsService.uploadThumbnail(newsId, fd);
          show("Tải ảnh bìa thành công!");
        } catch {
          show("Đã lưu bài viết, nhưng lỗi khi tải ảnh bìa");
        }
      }

      // Upload images (max 2)
      if (imageFiles.length > 0 && newsId) {
        const fd = new FormData();
        imageFiles.slice(0, 2).forEach(f => fd.append("files", f));
        try {
          await NewsService.uploadImages(newsId, fd);
          show("Tải ảnh minh họa thành công!");
        } catch {
          show("Đã lưu bài viết, nhưng lỗi khi tải ảnh minh họa");
        }
      }

      fetchNews(currentPage);
      closeModal();
    } catch (err) {
      show(err?.response?.data?.message || "Lỗi khi lưu bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await NewsService.deleteNews(selected.id);
      show("Đã xóa bài viết thành công!");
      fetchNews(currentPage);
      closeModal();
    } catch {
      show("Lỗi khi xóa bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = newsList.filter(n =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Quản lý Tin tức / Blog</h1>
        <button className="btn-primary" style={{ padding: "10px 20px" }} onClick={() => openModal("add")}>
          <Plus size={18} /> Thêm bài viết
        </button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {/* Search */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, background: "var(--surface-2)", padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)" }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text" placeholder="Tìm kiếm bài viết..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "left", background: "var(--surface-2)" }}>
                <th style={{ padding: 16, fontWeight: 600, borderRadius: "8px 0 0 8px" }}>Ảnh bìa</th>
                <th style={{ padding: 16, fontWeight: 600 }}>Tiêu đề</th>
                <th style={{ padding: 16, fontWeight: 600 }}>Danh mục</th>
                <th style={{ padding: 16, fontWeight: 600 }}>Tác giả</th>
                <th style={{ padding: 16, fontWeight: 600 }}>Ngày tạo</th>
                <th style={{ padding: 16, fontWeight: 600, textAlign: "center", borderRadius: "0 8px 8px 0" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 48 }}>
                  <Loader size={30} color="var(--pk-pink)" className="spin" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Chưa có bài viết nào</td></tr>
              ) : filtered.map(item => (
                <tr key={item.id}
                  style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: 16 }}>
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" style={{ width: 60, height: 42, borderRadius: 6, objectFit: "cover", border: "1px solid var(--border)" }} />
                    ) : (
                      <div style={{ width: 60, height: 42, borderRadius: 6, background: "var(--pk-pink-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🌸</div>
                    )}
                  </td>
                  <td style={{ padding: 16, fontSize: "0.9rem", fontWeight: 600, maxWidth: 280 }}>
                    <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.title}
                    </div>
                  </td>
                  <td style={{ padding: 16, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {item.category?.name || <span style={{ color: "#ccc" }}>—</span>}
                  </td>
                  <td style={{ padding: 16, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {item.author ? `${item.author.firstName} ${item.author.lastName}` : "—"}
                  </td>
                  <td style={{ padding: 16, fontSize: "0.85rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {formatDate(item.createdAt)}
                  </td>
                  <td style={{ padding: 16, textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <a href={`/news/${item.id}`} target="_blank" rel="noreferrer"
                        style={{ color: "var(--text-muted)", display: "flex", padding: 6, borderRadius: 4, transition: "all 0.2s" }}
                        title="Xem trước"
                      >
                        <Eye size={18} />
                      </a>
                      <button onClick={() => openModal("edit", item)} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 4 }} title="Sửa">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => openModal("delete", item)} style={{ color: "var(--pk-red)", background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 4 }} title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages >= 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Trang {currentPage + 1} / {totalPages}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: currentPage === 0 ? "var(--surface-2)" : "#fff", cursor: currentPage === 0 ? "not-allowed" : "pointer", color: currentPage === 0 ? "var(--text-muted)" : "var(--text)" }}>
                <ChevronLeft size={16} /> Trước
              </button>
              <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: currentPage >= totalPages - 1 ? "var(--surface-2)" : "#fff", cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer", color: currentPage >= totalPages - 1 ? "var(--text-muted)" : "var(--text)" }}>
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen && (modalType === "add" || modalType === "edit")}
        onClose={closeModal}
        title={modalType === "add" ? "Thêm bài viết mới" : "Chỉnh sửa bài viết"}
        maxWidth="680px"
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Title */}
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", fontWeight: 600 }}>Tiêu đề *</label>
            <input required className="input-pk" placeholder="Nhập tiêu đề bài viết..."
              value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", fontWeight: 600 }}>Danh mục</label>
            <select className="input-pk" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
              <option value="">Không có danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Thumbnail */}
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", fontWeight: 600 }}>Ảnh bìa (Thumbnail)</label>
            {thumbnailPreview && (
              <div style={{ marginBottom: 10, borderRadius: 8, overflow: "hidden", maxHeight: 180, border: "1px solid var(--border)" }}>
                <img src={thumbnailPreview} alt="preview" style={{ width: "100%", objectFit: "cover", maxHeight: 180 }} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, border: "2px dashed var(--border)", borderRadius: 8, background: "var(--surface-2)", textAlign: "center" }}>
              <input type="file" accept="image/*" id="thumbnailInput" style={{ display: "none" }} onChange={handleThumbnailChange} />
              <label htmlFor="thumbnailInput" style={{ cursor: "pointer", color: "var(--pk-pink)", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <ImageIcon size={18} /> {thumbnailPreview ? "Thay đổi ảnh bìa" : "Chọn ảnh bìa"}
              </label>
            </div>
          </div>

          {/* Content */}
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", fontWeight: 600 }}>Nội dung *</label>
            <textarea required className="input-pk" rows={10} placeholder="Nhập nội dung bài viết..."
              value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
              style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.7 }} />
          </div>

          {/* Images 1 & 2 */}
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", fontWeight: 600 }}>Ảnh minh họa (tối đa 2)</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, border: "2px dashed var(--border)", borderRadius: 8, background: "var(--surface-2)", textAlign: "center" }}>
              <input type="file" multiple accept="image/*" id="newsImages" style={{ display: "none" }}
                onChange={e => setImageFiles(Array.from(e.target.files).slice(0, 2))} />
              <label htmlFor="newsImages" style={{ cursor: "pointer", color: "var(--pk-pink)", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <ImageIcon size={18} /> Chọn ảnh minh họa (tối đa 2)
              </label>
              {imageFiles.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {imageFiles.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} />
                  ))}
                </div>
              )}
            </div>
            {modalType === "edit" && selected && (selected.imageUrl1 || selected.imageUrl2) && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 6 }}>
                * Tải ảnh mới sẽ thay thế ảnh minh họa cũ.
              </p>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={closeModal} disabled={isSubmitting}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader size={18} className="spin" /> : (modalType === "add" ? "Đăng bài viết" : "Lưu thay đổi")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isModalOpen && modalType === "delete"} onClose={closeModal} title="Xác nhận xóa" maxWidth="400px">
        <p style={{ marginBottom: 24 }}>
          Bạn có chắc muốn xóa bài viết <strong>"{selected?.title}"</strong>? Hành động này không thể hoàn tác.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button className="btn-ghost" onClick={closeModal} disabled={isSubmitting}>Hủy</button>
          <button onClick={handleDelete} disabled={isSubmitting}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--pk-red)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", padding: "11px 26px", borderRadius: 999, border: "none", cursor: "pointer" }}>
            {isSubmitting ? <Loader size={18} className="spin" /> : "Xóa bài viết"}
          </button>
        </div>
      </Modal>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
