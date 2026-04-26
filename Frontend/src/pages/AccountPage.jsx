import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useWishlist, useCart, useToast } from "../context/store";
import { formatPrice } from "../data/products";
import { LogOut, Heart, ShoppingBag, Package, ChevronRight, Settings, Eye, Camera } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { OrderService, ProductService, UserService } from "../services";

export default function AccountPage() {
  const { user, login, logout } = useAuth(); 
  const { ids } = useWishlist();
  const { count } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [orders, setOrders] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loadingWish, setLoadingWish] = useState(false);

  // Expanded order state
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Forms state
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [billingForm, setBillingForm] = useState({ firstName: "", lastName: "", companyName: "", streetAddress: "", country: "", state: "", zipCode: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || ""
      });
      setBillingForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        companyName: user.address?.companyName === "N/A" ? "" : (user.address?.companyName || ""),
        streetAddress: user.address?.streetAddress === "N/A" ? "" : (user.address?.streetAddress || ""),
        country: user.address?.country || "Vietnam",
        state: user.address?.state === "N/A" ? "" : (user.address?.state || ""),
        zipCode: user.address?.zipCode || "",
        email: user.email || "",
        phone: user.phone || ""
      });
      setPreviewAvatar(user.linkAvatar || null);
    }
  }, [user]);

  // Fetch orders & wishlist
  useEffect(() => {
    if (!user) return;
    OrderService.getMyOrders({ pageNum: 1, pageSize: 20 })
      .then(res => {
        const data = res?.data || res;
        let list = [];
        if (data?.items) list = data.items;
        else if (data?.content) list = data.content;
        else if (data?.elements) list = data.elements;
        else if (Array.isArray(data)) list = data;
        setOrders(list);
      })
      .catch((error) => console.error("Failed to fetch orders", error));
  }, [user]);

  useEffect(() => {
    if (!user || ids.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setLoadingWish(true);
    Promise.allSettled(ids.slice(0, 4).map(id => ProductService.getProductById(id)))
      .then(results => {
        const prods = results.filter(r => r.status === "fulfilled" && r.value).map(r => r.value?.data || r.value)
          .filter(p => p && (p.id || p.name))
          .map(p => ({
             ...p,
             price: p.price || p.oldPrice || 0,
             originalPrice: p.oldPrice ? Math.round(p.oldPrice * 1.2) : null,
             inStock: (p.stock ?? 1) > 0,
             images: p.imageUrl || p.images || (p.image ? [p.image] : []),
             image: (p.imageUrl && p.imageUrl[0]) || p.image || null,
             category: p.category?.name || p.category || "",
          }));
        setWishlistProducts(prods);
      })
      .finally(() => setLoadingWish(false));
  }, [user, ids]);

  const toggleOrderDetails = async (orderId) => {
    if (expandedOrderId === orderId) { setExpandedOrderId(null); return; }
    setExpandedOrderId(orderId);
    if (!orderDetails[orderId]) {
      setLoadingDetails(true);
      try {
        const res = await OrderService.getOrderById(orderId);
        setOrderDetails(prev => ({ ...prev, [orderId]: res?.data || res }));
      } catch (err) {
        show("Không thể tải chi tiết đơn hàng");
      } finally { setLoadingDetails(false); }
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return show("Ảnh không được vượt quá 5MB");
    
    setPreviewAvatar(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await UserService.uploadAvatar(formData);
      if (res && res.data) login(res.data, localStorage.getItem("token"));
      show("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      show("Lỗi khi tải ảnh lên");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = {
        personalInformation: {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone
        }
      };
      const res = await UserService.updateProfile(payload);
      if (res && res.data) login(res.data, localStorage.getItem("token"));
      show("Cập nhật thông tin thành công!");
    } catch (err) {
      show("Cập nhật thất bại. Vui lòng thử lại.");
    } finally { setIsUpdating(false); }
  };

  const handleUpdateBilling = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = {
        companyName: billingForm.companyName,
        streetAddress: billingForm.streetAddress,
        country: billingForm.country,
        state: billingForm.state,
        zipCode: parseInt(billingForm.zipCode) || 0
      };
      const res = await UserService.updateBillingAddress(payload);
      if (res && res.data) login(res.data, localStorage.getItem("token"));
      show("Cập nhật địa chỉ thanh toán thành công!");
    } catch (err) {
      show("Cập nhật thất bại. Vui lòng thử lại.");
    } finally { setIsUpdating(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return show("Mật khẩu xác nhận không khớp!");
    }
    setIsUpdating(true);
    try {
      const payload = {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      };
      await UserService.changePassword(payload);
      show("Đổi mật khẩu thành công!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      show(err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <main className="page-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Vui lòng đăng nhập</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Bạn cần đăng nhập để xem tài khoản</p>
        <Link to="/login" className="btn-primary">Đăng nhập ngay</Link>
      </main>
    );
  }

  const statusColor = (s) => s === "Đã giao" ? "#22c55e" : s === "Đang giao" ? "var(--pk-pink)" : "var(--pk-gold)";
  const formatOrderId = (o) => { const id = o.id || o.orderId || o.code || "#---"; return id.startsWith("#") ? id : "#" + id.substring(0, 8).toUpperCase(); };
  const formatOrderDate = (o) => { if (o.date) return o.date; if (o.createdAt) return new Date(o.createdAt).toLocaleDateString("vi-VN"); if (o.orderDate) return new Date(o.orderDate).toLocaleDateString("vi-VN"); return "---"; };
  const formatOrderStatus = (o) => { const s = o.status || o.orderStatus || "Đang xử lý"; if (s === "DELIVERED" || s === "COMPLETED") return "Đã giao"; if (s === "SHIPPING" || s === "DELIVERING") return "Đang giao"; if (s === "CANCELLED" || s === "CANCELED") return "Đã hủy"; if (s === "PENDING" || s === "ORDER_RECEIVED") return "Chờ xác nhận"; return s; };
  const formatOrderTotal = (o) => o.total || o.totalAmount || o.totalPrice || 0;
  const formatOrderItems = (o) => { if (o.items !== undefined) return o.items; if (Array.isArray(o.orderItems)) return o.orderItems.length; if (Array.isArray(o.items)) return o.items.length; return 0; };

  // Common label style for settings form
  const labelStyle = { display: "block", fontSize: "0.8rem", color: "#333", fontWeight: 600, marginBottom: 6 };
  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "0.9rem", outline: "none", color: "#333", transition: "border-color 0.2s" };

  return (
    <main className="page-content" style={{ paddingBottom: 72 }}>
      <div className="container">
        <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, padding: "36px 0 28px" }}>Tài khoản của tôi</h1>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "flex-start" }}>
          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: previewAvatar ? "transparent" : "linear-gradient(135deg,var(--pk-pink),#d44070)", color: "#fff", fontSize: "1.8rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 6px 20px rgba(232,88,122,0.35)", overflow: "hidden" }}>
                {previewAvatar ? <img src={previewAvatar} alt="avatar" style={{width: "100%", height: "100%", objectFit: "cover"}} /> : (user.firstName || user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{(user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : (user.fullName || user.email.split('@')[0])}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 16 }}>{user.email}</p>
              <span className="badge badge-new">Thành viên Vàng ✨</span>
            </div>

            <div className="card" style={{ padding: 20 }}>
              {[
                { id: "dashboard", Icon: Package, label: "Đơn hàng", value: orders.length, isTab: true },
                { id: "wishlist", Icon: Heart, label: "Yêu thích", value: ids.length, to: "/wishlist" },
                { id: "cart", Icon: ShoppingBag, label: "Giỏ hàng", value: count, to: "/cart" },
                { id: "settings", Icon: Settings, label: "Cài đặt tài khoản", isTab: true },
              ].map(({ id, Icon, label, value, to, isTab }) => (
                <div key={id} onClick={() => isTab ? setActiveTab(id) : navigate(to)} 
                     style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 10px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: activeTab === id ? "var(--pk-pink-light)" : "transparent", borderRadius: activeTab === id ? "8px" : "0", color: activeTab === id ? "var(--pk-pink)" : "inherit", fontWeight: activeTab === id ? 600 : 400 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={16} color={activeTab === id ? "var(--pk-pink)" : "var(--text-muted)"} />
                    <span style={{ fontSize: "0.875rem" }}>{label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {value !== undefined && <span style={{ fontWeight: 700, color: "var(--pk-pink)" }}>{value}</span>}
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={logout} className="btn-outline" style={{ width: "100%", justifyContent: "center", color: "#ef4444", borderColor: "#ef4444" }}>
              <LogOut size={15} /> Đăng xuất
            </button>
          </div>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {activeTab === "dashboard" && (
              <>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><Package size={18} color="var(--pk-pink)" /> Lịch sử đơn hàng</h3>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>📦</div>
                      <p>Bạn chưa có đơn hàng nào.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {orders.map((o, idx) => {
                        const status = formatOrderStatus(o);
                        const isExpanded = expandedOrderId === o.id;
                        const details = orderDetails[o.id];
                        return (
                          <div key={o.id || idx} style={{ background: "var(--surface-2)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", flexWrap: "wrap", gap: 12 }}>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4, color: "var(--pk-pink)" }}>{formatOrderId(o)}</p>
                                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{formatOrderDate(o)} · {formatOrderItems(o)} sản phẩm</p>
                              </div>
                              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 16 }}>
                                <div>
                                  <p style={{ fontWeight: 700, marginBottom: 4 }}>{formatPrice(formatOrderTotal(o))}</p>
                                  <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: `${statusColor(status)}20`, color: statusColor(status) }}>{status}</span>
                                </div>
                                <button onClick={() => toggleOrderDetails(o.id)} className="btn-ghost" style={{ padding: "8px", borderRadius: "50%", background: isExpanded ? "var(--pk-pink-light)" : "transparent", color: isExpanded ? "var(--pk-pink)" : "var(--text-muted)" }}>
                                  <Eye size={18} />
                                </button>
                              </div>
                            </div>
                            {isExpanded && (
                              <div style={{ padding: "16px 18px", background: "#fff", borderTop: "1px solid var(--border)" }}>
                                {loadingDetails && !details ? <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>Đang tải chi tiết...</p> : details ? (
                                  <div>
                                    <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 12 }}>Sản phẩm trong đơn hàng</h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                      {(details.orderItems || details.items || []).map((item, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 10, borderBottom: "1px dashed var(--border)" }}>
                                          <div style={{ width: 50, height: 50, borderRadius: 6, background: "var(--surface-2)", overflow: "hidden" }}>
                                            {item.productImageUrl ? <img src={item.productImageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>Img</div>}
                                          </div>
                                          <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>{item.productName || "Sản phẩm"}</p>
                                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Số lượng: {item.quantity || 1}</p>
                                          </div>
                                          <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{formatPrice(item.price || item.unitPrice || 0)}</div>
                                        </div>
                                      ))}
                                    </div>
                                    <div style={{ marginTop: 16, fontSize: "0.85rem" }}>
                                      <p><strong>Địa chỉ nhận hàng:</strong> {details.shippingAddress ? `${details.shippingAddress.streetAddress || ""}, ${details.shippingAddress.state || ""}`.replace(/(^,\s*)|(,\s*$)/g, '') : "Không có thông tin"}</p>
                                      <p><strong>Ghi chú:</strong> {details.note || "Không có"}</p>
                                    </div>
                                  </div>
                                ) : <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Không tìm thấy thông tin chi tiết.</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {ids.length > 0 && (
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                      <h3 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><Heart size={18} color="var(--pk-pink)" /> Sản phẩm yêu thích</h3>
                      <Link to="/wishlist" style={{ fontSize: "0.82rem", color: "var(--pk-pink)", fontWeight: 600 }}>Xem tất cả</Link>
                    </div>
                    {loadingWish ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16 }}>
                        {Array.from({ length: Math.min(ids.length, 4) }).map((_, i) => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 8 }} />)}
                      </div>
                    ) : wishlistProducts.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16 }}>
                        {wishlistProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
                        <p>Không thể tải sản phẩm yêu thích. <Link to="/wishlist" style={{ color: "var(--pk-pink)" }}>Xem tại đây</Link></p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "settings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                
                {/* 1. Cài Đặt Tài Khoản */}
                <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid #eaeaea" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid #eaeaea" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a" }}>Cài Đặt Tài Khoản</h3>
                  </div>
                  <div style={{ padding: 24 }}>
                    <form onSubmit={handleUpdateProfile} style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Tên</label>
                            <input type="text" style={inputStyle} value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Họ</label>
                            <input type="text" style={inputStyle} value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} />
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>Email</label>
                          <input type="email" style={{ ...inputStyle, background: "#f5f5f5", color: "#888" }} value={profileForm.email} readOnly />
                        </div>
                        <div>
                          <label style={labelStyle}>Số điện thoại</label>
                          <input type="tel" style={inputStyle} value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <button type="submit" disabled={isUpdating} className="btn-primary" style={{ padding: "10px 24px" }}>Lưu thay đổi</button>
                        </div>
                      </div>
                      
                      <div style={{ width: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: "2rem", color: "#64748b" }}>
                          {previewAvatar ? <img src={previewAvatar} alt="avatar" style={{width: "100%", height: "100%", objectFit: "cover"}} /> : (profileForm.firstName || "U").charAt(0).toUpperCase()}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: "none" }} accept="image/*" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ width: "100%", padding: "8px 0", fontSize: "0.85rem", display: "flex", justifyContent: "center", gap: 6 }}>
                          <Camera size={14} /> Chọn ảnh
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* 2. Địa Chỉ Thanh Toán */}
                <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid #eaeaea" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid #eaeaea" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a" }}>Địa Chỉ Thanh Toán</h3>
                  </div>
                  <div style={{ padding: 24 }}>
                    <form onSubmit={handleUpdateBilling} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 150px" }}>
                          <label style={labelStyle}>Tên</label>
                          <input type="text" style={{ ...inputStyle, background: "#f5f5f5", color: "#888" }} value={billingForm.firstName} readOnly />
                        </div>
                        <div style={{ flex: "1 1 150px" }}>
                          <label style={labelStyle}>Họ</label>
                          <input type="text" style={{ ...inputStyle, background: "#f5f5f5", color: "#888" }} value={billingForm.lastName} readOnly />
                        </div>
                        <div style={{ flex: "1 1 150px" }}>
                          <label style={labelStyle}>Tên công ty <span style={{fontWeight: 400, color: "#888"}}>(không bắt buộc)</span></label>
                          <input type="text" style={inputStyle} value={billingForm.companyName} onChange={e => setBillingForm({...billingForm, companyName: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Địa chỉ</label>
                        <input type="text" style={inputStyle} value={billingForm.streetAddress} onChange={e => setBillingForm({...billingForm, streetAddress: e.target.value})} />
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 150px" }}>
                          <label style={labelStyle}>Quốc gia</label>
                          <input type="text" style={inputStyle} value={billingForm.country} onChange={e => setBillingForm({...billingForm, country: e.target.value})} />
                        </div>
                        <div style={{ flex: "1 1 150px" }}>
                          <label style={labelStyle}>Tỉnh/Thành</label>
                          <select style={inputStyle} value={billingForm.state} onChange={e => setBillingForm({...billingForm, state: e.target.value})}>
                            <option value="">-- Chọn tỉnh/thành --</option>
                            {["An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: "1 1 150px" }}>
                          <label style={labelStyle}>Mã bưu điện</label>
                          <input type="text" style={inputStyle} value={billingForm.zipCode} onChange={e => setBillingForm({...billingForm, zipCode: e.target.value})} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 200px" }}>
                          <label style={labelStyle}>Email</label>
                          <input type="email" style={{...inputStyle, background: "#f5f5f5", color: "#888"}} value={billingForm.email} readOnly />
                        </div>
                        <div style={{ flex: "1 1 200px" }}>
                          <label style={labelStyle}>Số điện thoại</label>
                          <input type="tel" style={{...inputStyle, background: "#f5f5f5", color: "#888"}} value={billingForm.phone} readOnly />
                        </div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <button type="submit" disabled={isUpdating} className="btn-primary" style={{ padding: "10px 24px" }}>Lưu thay đổi</button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* 3. Đổi Mật Khẩu */}
                <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid #eaeaea" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid #eaeaea" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a" }}>Đổi Mật Khẩu</h3>
                  </div>
                  <div style={{ padding: 24 }}>
                    <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Mật khẩu hiện tại</label>
                        <input type="password" style={inputStyle} placeholder="Nhập mật khẩu hiện tại" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required />
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Mật khẩu mới</label>
                          <input type="password" style={inputStyle} placeholder="Nhập mật khẩu mới" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required minLength={6} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Xác nhận mật khẩu</label>
                          <input type="password" style={inputStyle} placeholder="Nhập lại mật khẩu mới" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required minLength={6} />
                        </div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <button type="submit" className="btn-primary" style={{ padding: "10px 24px" }}>Đổi mật khẩu</button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
