import { useState, useEffect, useCallback } from "react";
import { Search, Edit, Trash2, Loader, ChevronLeft, ChevronRight, CheckCircle, XCircle, Star } from "lucide-react";
import Modal from "../../components/admin/Modal";
import { ReviewService, ProductService } from "../../services/apiServices";
import { useToast } from "../../context/store";

// Hàm format ngày tháng theo định dạng Việt Nam
function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Component quản lý đánh giá sản phẩm
export default function AdminReviews() {
  // State lưu trữ danh sách đánh giá và sản phẩm
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  
  // State tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // 'APPROVED', 'PENDING', 'REJECTED'
  const [filterRating, setFilterRating] = useState("");
  
  // State UI loading/submitting
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'view', 'edit', 'delete'
  const [selectedReview, setSelectedReview] = useState(null);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10); // Số bản ghi trên mỗi trang

  // State form: trạng thái duyệt và hiển thị
  const [formData, setFormData] = useState({
    status: "PENDING",
    isVisible: true
  });

  const { show } = useToast();

  // Hàm lấy tất cả đánh giá từ tất cả sản phẩm
  const fetchAllReviews = useCallback(async (page) => {
    setIsLoading(true);
    try {
      // Bước 1: Lấy danh sách tất cả sản phẩm
      const productsRes = await ProductService.getAllProducts({ pageNum: 1, pageSize: 1000 });
      const productsList = productsRes?.data?.items || productsRes?.data?.content || [];
      
      // Bước 2: Lấy đánh giá từ từng sản phẩm
      let allReviews = [];
      for (const product of productsList) {
        try {
          const reviewsRes = await ReviewService.getAllReviewsByProduct(product.id, { pageNum: 1, pageSize: 1000 });
          const reviewsList = reviewsRes?.data?.items || reviewsRes?.data?.content || reviewsRes?.data || [];
          // Gán productId và productName cho mỗi đánh giá
          allReviews = [...allReviews, ...reviewsList.map(r => ({ ...r, productId: product.id, productName: product.name }))];
        } catch (err) {
          // Bỏ qua nếu sản phẩm không có đánh giá
        }
      }
      
      // Bước 3: Áp dụng bộ lọc
      let filtered = allReviews;
      if (searchTerm) {
        filtered = filtered.filter(r => 
          r.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (filterStatus) {
        filtered = filtered.filter(r => r.status === filterStatus);
      }
      if (filterRating) {
        filtered = filtered.filter(r => r.rating == filterRating);
      }
      
      setReviews(filtered);
      setTotalPages(Math.ceil(filtered.length / pageSize));
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
      show("Lỗi khi tải danh sách đánh giá");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterStatus, filterRating, pageSize, show]);

  // Gọi fetchAllReviews khi currentPage thay đổi
  useEffect(() => {
    fetchAllReviews(currentPage);
  }, [currentPage, fetchAllReviews]);

  // Hàm mở modal với các chế độ khác nhau: 'view' để xem/sửa, 'delete' để xóa
  const openModal = (type, review = null) => {
    setModalType(type);
    setSelectedReview(review);
    if (type === 'edit' && review) {
      setFormData({
        status: review.status || "PENDING",
        isVisible: review.isVisible !== false
      });
    }
    setIsModalOpen(true);
  };

  // Hàm đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
    setFormData({ status: "PENDING", isVisible: true });
  };

  // Hàm xóa đánh giá
  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await ReviewService.deleteReview(selectedReview.id);
      show("Xóa đánh giá thành công!");
      fetchAllReviews(currentPage);
      closeModal();
    } catch (err) {
      show("Lỗi khi xóa đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm lưu thay đổi trạng thái đánh giá
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        status: formData.status,
        isVisible: formData.isVisible
      };
      await ReviewService.updateReview(selectedReview.id, payload);
      show("Cập nhật đánh giá thành công!");
      fetchAllReviews(currentPage);
      closeModal();
    } catch (err) {
      show("Lỗi khi cập nhật đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm duyệt đánh giá (đổi trạng thái thành APPROVED)
  const handleApprove = async (review) => {
    setIsSubmitting(true);
    try {
      await ReviewService.updateReview(review.id, { status: "APPROVED", isVisible: true });
      show("Duyệt đánh giá thành công!");
      fetchAllReviews(currentPage);
    } catch (err) {
      show("Lỗi khi duyệt đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm từ chối đánh giá (đổi trạng thái thành REJECTED)
  const handleReject = async (review) => {
    setIsSubmitting(true);
    try {
      await ReviewService.updateReview(review.id, { status: "REJECTED", isVisible: false });
      show("Từ chối đánh giá thành công!");
      fetchAllReviews(currentPage);
    } catch (err) {
      show("Lỗi khi từ chối đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính danh sách đánh giá cho trang hiện tại
  const paginatedReviews = reviews.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Hàm xác định màu badge trạng thái
  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Hàm lấy tên hiển thị của trạng thái
  const getStatusText = (status) => {
    switch(status) {
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'PENDING': return 'Chờ duyệt';
      default: return status;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quản lý Đánh giá Sản phẩm</h1>
        
        {/* Khu vực lọc và tìm kiếm */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Input tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm đánh giá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lọc theo trạng thái */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>

          {/* Lọc theo điểm số */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả điểm số</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách đánh giá */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          // Hiển thị loading spinner
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-blue-500" size={32} />
          </div>
        ) : paginatedReviews.length === 0 ? (
          // Hiển thị khi không có dữ liệu
          <div className="p-6 text-center text-gray-500">Không có đánh giá nào</div>
        ) : (
          // Bảng đánh giá
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Header bảng */}
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Sản phẩm</th>
                  <th className="px-4 py-3 text-left font-semibold">Người đánh giá</th>
                  <th className="px-4 py-3 text-center font-semibold">Điểm</th>
                  <th className="px-4 py-3 text-left font-semibold">Nội dung</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                  <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                </tr>
              </thead>
              {/* Body bảng */}
              <tbody className="divide-y">
                {paginatedReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{review.productName}</td>
                    <td className="px-4 py-3 text-gray-600">{review.user?.name || review.userName || "Ẩn danh"}</td>
                    {/* Hiển thị sao đánh giá */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{review.content}</td>
                    {/* Hiển thị badge trạng thái */}
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {getStatusText(review.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(review.createdAt)}</td>
                    {/* Nút thao tác */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Nút duyệt/từ chối chỉ hiển thị khi chờ duyệt */}
                        {review.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(review)}
                              disabled={isSubmitting}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Duyệt"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(review)}
                              disabled={isSubmitting}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Từ chối"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {/* Nút xem/sửa */}
                        <button
                          onClick={() => openModal('view', review)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Xem"
                        >
                          <Edit size={18} />
                        </button>
                        {/* Nút xóa */}
                        <button
                          onClick={() => openModal('delete', review)}
                          disabled={isSubmitting}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Trang {currentPage + 1} / {totalPages}
            </div>
            <div className="flex gap-2">
              {/* Nút trang trước */}
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0 || isLoading}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              {/* Nút trang sau */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1 || isLoading}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={
          modalType === 'delete' ? 'Xóa đánh giá' :
          modalType === 'view' ? 'Xem & Sửa đánh giá' : ''
        }
        onClose={closeModal}
      >
        {modalType === 'delete' ? (
          // Form xác nhận xóa
          <div className="space-y-4">
            <p>Bạn có chắc muốn xóa đánh giá này?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? <Loader className="animate-spin" size={18} /> : 'Xóa'}
              </button>
            </div>
          </div>
        ) : (
          // Form xem/sửa đánh giá
          <form onSubmit={handleSave} className="space-y-4">
            {/* Hiển thị nội dung đánh giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <p className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{selectedReview?.content}</p>
            </div>

            {/* Hiển thị người đánh giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Người đánh giá</label>
              <p className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{selectedReview?.user?.name || selectedReview?.userName || "Ẩn danh"}</p>
            </div>

            {/* Chọn trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>

            {/* Checkbox hiển thị */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVisible"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">Hiển thị đánh giá</label>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader className="animate-spin" size={18} /> : 'Lưu'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
