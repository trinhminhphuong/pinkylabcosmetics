import api from './api';

// ==================== AUTH ====================
export const AuthService = {
  login: (data) => api.post('/auth/login', data).then(res => res.data),
  loginWithGoogle: (data) => api.post('/auth/google', data).then(res => res.data),
  register: (data) => api.post('/auth/register', data).then(res => res.data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data).then(res => res.data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data).then(res => res.data),
  verifyOtpToResetPassword: (data) => api.post('/auth/verify-otp-to-reset-password', data).then(res => res.data),
  resetPassword: (data) => api.post('/auth/reset-password', data).then(res => res.data),
  accountRecovery: (data) => api.post('/auth/account-recovery', data).then(res => res.data),
  verifyOtpToRecovery: (data) => api.post('/auth/verify-otp-to-recovery', data).then(res => res.data),
  recoverAccount: (data) => api.post('/auth/recover-account', data).then(res => res.data),
  refreshToken: (data) => api.post('/auth/refresh', data).then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
};

// ==================== USER ====================
export const UserService = {
  getUsers: (params) => api.get('/user', { params }).then(res => res.data),
  getUserById: (userId) => api.get(`/user/${userId}`).then(res => res.data),
  getCurrentUser: () => api.get('/user/current').then(res => res.data),
  fillPersonalInformation: (data) => api.post('/user/personal-information', data).then(res => res.data),
  uploadAvatar: (formData) => api.post('/user/upload-avatar', formData).then(res => res.data),
  deleteMyAccount: () => api.delete('/user/delete-my-account').then(res => res.data),
  getProfile: () => api.get('/user/profile').then(res => res.data),
  updateProfile: (data) => api.put('/user/update-profile', data).then(res => res.data),
  updateBillingAddress: (data) => api.put('/user/billing-address', data).then(res => res.data),
  changePassword: (data) => api.post('/user/change-password', data).then(res => res.data),
};

// ==================== ADMIN ====================
export const AdminService = {
  getUsers: (params) => api.get('/admin/users', { params }).then(res => res.data),
  getUserById: (userId) => api.get(`/admin/users/${userId}`).then(res => res.data),
  createUser: (data) => api.post('/admin/create-user', data).then(res => res.data),
  updateUser: (userId, data) => api.put(`/admin/update-user/${userId}`, data).then(res => res.data),
  deleteUser: (userId) => api.delete(`/admin/delete-user/${userId}`).then(res => res.data),
  searchUserByUsername: (params) => api.get('/admin/search-user-by-username', { params }).then(res => res.data),
  searchUserByEmail: (params) => api.get('/admin/search-user-by-email', { params }).then(res => res.data),
  searchUserByPhone: (params) => api.get('/admin/search-user-by-phone', { params }).then(res => res.data),
  searchTrainingExercise: (params) => api.get('/admin/search-training-exercise', { params }).then(res => res.data),
  lockUser: (userId) => api.post(`/admin/lock-user/${userId}`).then(res => res.data),
  unlockUser: (userId) => api.post(`/admin/unlock-user/${userId}`).then(res => res.data),
  getAllUserCount: () => api.get('/admin/users-count').then(res => res.data),
  getAllExercises: (params) => api.get('/admin/exercises', { params }).then(res => res.data),
  getUserDay: (params) => api.get('/admin/user-day', { params }).then(res => res.data),
  getUserMonth: (params) => api.get('/admin/user-month', { params }).then(res => res.data),
};

// ==================== PRODUCT ====================
export const ProductService = {
  getAllProducts: (params) => api.get('/products', { params }).then(res => res.data),
  getProductById: (id) => api.get(`/products/${id}`).then(res => res.data),
  createProduct: (data) => api.post('/products', data).then(res => res.data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data).then(res => res.data),
  uploadImages: (id, formData) => api.post(`/products/${id}/images`, formData).then(res => res.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then(res => res.data),
  addTagsToProduct: (id, tagIds) => api.post(`/products/${id}/tags`, tagIds).then(res => res.data),
  removeTagFromProduct: (id, tagId) => api.delete(`/products/${id}/tags/${tagId}`).then(res => res.data),
};

// ==================== CATEGORY ====================
export const CategoryService = {
  getAllCategories: (params) => api.get('/categories', { params }).then(res => res.data),
  getCategoryById: (id) => api.get(`/categories/${id}`).then(res => res.data),
  getProductsByCategory: (id, params) => api.get(`/categories/${id}/products`, { params }).then(res => res.data),
  createCategory: (data) => api.post('/categories', data).then(res => res.data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data).then(res => res.data),
  deleteCategory: (id) => api.delete(`/categories/${id}`).then(res => res.data),
};

// ==================== BRAND ====================
export const BrandService = {
  getAllBrands: (params) => api.get('/brands', { params }).then(res => res.data),
  getBrandById: (id) => api.get(`/brands/${id}`).then(res => res.data),
  getProductsByBrand: (id, params) => api.get(`/brands/${id}/products`, { params }).then(res => res.data),
  createBrand: (data) => api.post('/brands', data).then(res => res.data),
  uploadLogo: (id, formData) => api.post(`/brands/${id}/logo`, formData).then(res => res.data),
  updateBrand: (id, data) => api.put(`/brands/${id}`, data).then(res => res.data),
  deleteBrand: (id) => api.delete(`/brands/${id}`).then(res => res.data),
};

// ==================== TAG ====================
export const TagService = {
  getAllTags: (params) => api.get('/tags', { params }).then(res => res.data),
  getTagById: (id) => api.get(`/tags/${id}`).then(res => res.data),
  getProductsByTag: (id, params) => api.get(`/tags/${id}/products`, { params }).then(res => res.data),
  createTag: (data) => api.post('/tags', data).then(res => res.data),
  updateTag: (id, data) => api.put(`/tags/${id}`, data).then(res => res.data),
  deleteTag: (id) => api.delete(`/tags/${id}`).then(res => res.data),
};

// ==================== REVIEW ====================
export const ReviewService = {
  getAllReviewsByProduct: (productId, params) => api.get(`/products/${productId}/reviews`, { params }).then(res => res.data),
  getReviewById: (id) => api.get(`/reviews/${id}`).then(res => res.data),
  createReview: (productId, data) => api.post(`/products/${productId}/reviews`, data).then(res => res.data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data).then(res => res.data),
  deleteReview: (id) => api.delete(`/reviews/${id}`).then(res => res.data),
};

// ==================== PRODUCT ATTRIBUTE ====================
export const ProductAttributeService = {
  getAllAttributesByProduct: (productId, params) => api.get(`/products/${productId}/attributes`, { params }).then(res => res.data),
  getAttributeById: (id) => api.get(`/product-attributes/${id}`).then(res => res.data),
  createAttribute: (productId, data) => api.post(`/products/${productId}/attributes`, data).then(res => res.data),
  updateAttribute: (id, data) => api.put(`/product-attributes/${id}`, data).then(res => res.data),
  deleteAttribute: (id) => api.delete(`/product-attributes/${id}`).then(res => res.data),
};

// ==================== CART ====================
export const CartService = {
  getMyCart: () => api.get('/cart').then(res => res.data),
  addItem: (data) => api.post('/cart/items', data).then(res => res.data),
  updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data).then(res => res.data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`).then(res => res.data),
  clearCart: () => api.delete('/cart/clear').then(res => res.data),
  applyPromotion: (promotionId) => api.put(`/cart/promotion/${promotionId}`).then(res => res.data),
  selectShippingMethod: (shippingMethodId) => api.put(`/cart/shipping-method/${shippingMethodId}`).then(res => res.data),
  selectPaymentMethod: (paymentMethodId) => api.put(`/cart/payment-method/${paymentMethodId}`).then(res => res.data),
};

// ==================== ORDER ====================
export const OrderService = {
  getMyOrders: (params) => api.get('/orders/me', { params }).then(res => res.data),
  getAllOrders: (params) => api.get('/orders', { params }).then(res => res.data),
  getOrderById: (id) => api.get(`/orders/${id}`).then(res => res.data),
  placeOrder: (data) => api.post('/orders', data).then(res => res.data),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data).then(res => res.data),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`).then(res => res.data),
};

// ==================== PAYMENT ====================
export const PaymentService = {
  createPayment: (amount) => api.post('/payment/create-payment', null, { params: { amount } }).then(res => res.data),
  paymentReturn: (params) => api.get('/payment/vnpay/return', { params }).then(res => res.data),
  paymentIpn: (params) => api.get('/payment/vnpay/ipn', { params }).then(res => res.data),
  paymentStatus: (txnRef) => api.get(`/payment/status/${txnRef}`).then(res => res.data),
};

// ==================== PAYMENT & SHIPPING METHODS ====================
export const PaymentMethodService = {
  getAllPaymentMethods: (params) => api.get('/payment-methods', { params }).then(res => res.data),
  getPaymentMethodById: (id) => api.get(`/payment-methods/${id}`).then(res => res.data),
  createPaymentMethod: (data) => api.post('/payment-methods', data).then(res => res.data),
  updatePaymentMethod: (id, data) => api.put(`/payment-methods/${id}`, data).then(res => res.data),
  deletePaymentMethod: (id) => api.delete(`/payment-methods/${id}`).then(res => res.data),
};

export const ShippingMethodService = {
  getAllShippingMethods: (params) => api.get('/shipping-methods', { params }).then(res => res.data),
  getShippingMethodById: (id) => api.get(`/shipping-methods/${id}`).then(res => res.data),
  createShippingMethod: (data) => api.post('/shipping-methods', data).then(res => res.data),
  updateShippingMethod: (id, data) => api.put(`/shipping-methods/${id}`, data).then(res => res.data),
  deleteShippingMethod: (id) => api.delete(`/shipping-methods/${id}`).then(res => res.data),
};

// ==================== NEWS & POSTS ====================
export const NewsService = {
  getAllNews: (params) => api.get('/news', { params }).then(res => res.data),
  getNewsById: (id) => api.get(`/news/${id}`).then(res => res.data),
  createNews: (data) => api.post('/news', data).then(res => res.data),
  updateNews: (id, data) => api.put(`/news/${id}`, data).then(res => res.data),
  uploadThumbnail: (id, formData) => api.post(`/news/${id}/thumbnail`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  uploadImages: (id, formData) => api.post(`/news/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  deleteNews: (id) => api.delete(`/news/${id}`).then(res => res.data),
  addTagsToNews: (id, tagIds) => api.post(`/news/${id}/tags`, tagIds).then(res => res.data),
  removeTagFromNews: (id, tagId) => api.delete(`/news/${id}/tags/${tagId}`).then(res => res.data),
};

export const NewsCategoryService = {
  getAllCategories: (params) => api.get('/news-categories', { params }).then(res => res.data),
  getCategoryById: (id) => api.get(`/news-categories/${id}`).then(res => res.data),
  getCategoryCounts: () => api.get('/news/category-counts').then(res => res.data),
  createCategory: (data) => api.post('/news-categories', data).then(res => res.data),
  updateCategory: (id, data) => api.put(`/news-categories/${id}`, data).then(res => res.data),
  deleteCategory: (id) => api.delete(`/news-categories/${id}`).then(res => res.data),
};

export const NewsTagService = {
  getAllTags: (params) => api.get('/news-tags', { params }).then(res => res.data),
  getTagById: (id) => api.get(`/news-tags/${id}`).then(res => res.data),
  createTag: (data) => api.post('/news-tags', data).then(res => res.data),
  updateTag: (id, data) => api.put(`/news-tags/${id}`, data).then(res => res.data),
  deleteTag: (id) => api.delete(`/news-tags/${id}`).then(res => res.data),
};

export const NewsCommentService = {
  getAllComments: (newsId, params) => api.get(`/news/${newsId}/comments`, { params }).then(res => res.data),
  getCommentById: (id) => api.get(`/news-comments/${id}`).then(res => res.data),
  createComment: (newsId, data) => api.post(`/news/${newsId}/comments`, data).then(res => res.data),
  updateComment: (id, data) => api.put(`/news-comments/${id}`, data).then(res => res.data),
  deleteComment: (id) => api.delete(`/news-comments/${id}`).then(res => res.data),
};

// ==================== WEB INFORMATION & TESTIMONIALS ====================
export const WebInformationService = {
  getWebInformation: () => api.get('/web-information').then(res => res.data),
  updateWebInformation: (data) => api.put('/web-information', data).then(res => res.data),
  updateWebLogo: (formData) => api.post('/web-information/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
};

export const ClientTestimonialService = {
  getAllTestimonials: (params) => api.get('/client-testimonials', { params }).then(res => res.data),
  getTestimonialById: (id) => api.get(`/client-testimonials/${id}`).then(res => res.data),
  createTestimonial: (data) => api.post('/client-testimonials', data).then(res => res.data),
  updateTestimonial: (id, data) => api.put(`/client-testimonials/${id}`, data).then(res => res.data),
  updateTestimonialAvatar: (id, formData) => api.post(`/client-testimonials/${id}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  deleteTestimonial: (id) => api.delete(`/client-testimonials/${id}`).then(res => res.data),
};
