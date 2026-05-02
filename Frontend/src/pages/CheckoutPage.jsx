import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart, useAuth, useToast } from "../context/store";
import { formatPrice } from "../data/products";
import { Check, CreditCard, Truck, Banknote, ShoppingBag } from "lucide-react";
import { ShippingMethodService, PaymentMethodService, CartService, OrderService, PaymentService } from "../services/apiServices";

const STEPS = ["Thông tin", "Thanh toán", "Xác nhận"];
const PROVINCES = ["An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"];

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  const [shippingMethods, setShippingMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  // Hardcoded 2 payment options
  const PAY_OPTIONS = [
    { id: "COD",   label: "Thanh toán khi nhận hàng (COD)",   desc: "Thanh toán bằng tiền mặt khi nhận hàng" },
    { id: "VNPAY", label: "Thanh toán online qua VNPay",       desc: "Thẻ ATM, thẻ tín dụng, QR Pay — Sandbox" },
  ];

  const [shipMethod, setShipMethod] = useState("");
  const [payMethod, setPayMethod] = useState("COD"); // default COD
  
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", note: "" });
  const [errors, setErrors] = useState({});
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (user) {
      const matchCity = PROVINCES.find(p => p.toLowerCase() === (user.address?.state || "").trim().toLowerCase()) || "";
      const rawName = [user.firstName, user.lastName].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      // Lọc bỏ prefix mặc định "Khách" hoặc "admin"
      const SKIP = ["khách", "admin", "guest", "user"];
      const cleanName = SKIP.some(s => rawName.toLowerCase() === s || rawName.toLowerCase().startsWith(s + " "))
        ? (user.fullName && !SKIP.some(s => user.fullName.toLowerCase() === s) ? user.fullName : "")
        : (rawName || user.fullName || "");
      setForm(prev => ({
        ...prev,
        name: prev.name || cleanName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address?.streetAddress || "",
        city: prev.city || matchCity
      }));
    }
  }, [user]);

  useEffect(() => {
    ShippingMethodService.getAllShippingMethods().then(res => {
      const data = res?.data?.items || res?.data || res || [];
      setShippingMethods(Array.isArray(data) ? data : []);
      if (data && data.length > 0) setShipMethod(data[0].id);
    }).catch(console.error);

    // Fetch payment methods from DB to get real UUIDs for selectPaymentMethod
    PaymentMethodService.getAllPaymentMethods().then(res => {
      const data = res?.data?.items || res?.data || res || [];
      setPaymentMethods(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, []);

  const shipping = total >= 500000 ? 0 : 30000;
  const finalTotal = total + shipping;

  // Guard: redirect to cart if cart is empty
  if (items.length === 0 && !ordered) {
    return (
      <main className="page-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "0 20px" }}>
        <div style={{ fontSize: "4rem", marginBottom: 20 }}>🛍️</div>
        <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: 12 }}>Giỏ hàng trống</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán!</p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/products" className="btn-primary"><ShoppingBag size={16} /> Mua sắm ngay</Link>
          <Link to="/cart" className="btn-outline">Xem giỏ hàng</Link>
        </div>
      </main>
    );
  }

  if (!isAuthenticated && !ordered) {
    return (
      <main className="page-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "0 20px" }}>
        <div style={{ fontSize: "4rem", marginBottom: 20 }}>🔒</div>
        <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: 12 }}>Yêu cầu đăng nhập</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.</p>
        <button onClick={() => navigate("/login")} className="btn-primary">Đăng nhập ngay</button>
      </main>
    );
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name = "Vui lòng nhập họ tên";
    if (!form.email.includes("@")) e.email = "Email không hợp lệ";
    if (form.phone.length < 9) e.phone = "Số điện thoại không hợp lệ";
    if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ";
    if (!form.city.trim())    e.city = "Vui lòng chọn tỉnh/thành";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 0 && !validate()) return;
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };


  const handleOrder = async () => {
    setLoading(true);
    try {
      // 1. Sync cart to backend — clear then re-add from local state
      try { await CartService.clearCart(); } catch(e) { /* ignore */ }
      for (const item of items) {
        await CartService.addItem({ productId: item.id, quantity: item.qty });
      }

      // 2. Select shipping method on cart (real UUID from API)
      if (shipMethod) await CartService.selectShippingMethod(shipMethod);

      // 3. Resolve payment method UUID from DB and select on cart
      // Fetch fresh (don't rely on possibly-stale state)
      const isVNPay = payMethod === "VNPAY";
      let pmList = paymentMethods;
      if (pmList.length === 0) {
        try {
          const pmRes = await PaymentMethodService.getAllPaymentMethods();
          pmList = pmRes?.data?.items || pmRes?.data || pmRes || [];
        } catch (e) { /* ignore */ }
      }

      const pmKeywords = isVNPay
        ? ["vnpay", "vn pay", "online"]
        : ["cod", "tiền mặt", "cash", "nhận hàng"];

      const dbPayMethod = pmList.find(m => {
        const name = (m.name || m.code || "").toLowerCase();
        return pmKeywords.some(k => name.includes(k));
      }) || pmList[isVNPay ? 1 : 0];

      console.log("[Checkout] payMethod:", payMethod, "| isVNPay:", isVNPay, "| dbPayMethod:", dbPayMethod, "| pmList:", pmList);

      if (!dbPayMethod?.id) {
        throw new Error(`Không tìm thấy phương thức thanh toán "${payMethod}" trong hệ thống. Vui lòng liên hệ quản trị.`);
      }
      await CartService.selectPaymentMethod(dbPayMethod.id);

      // 4. Payment flow: VNPay → redirect to sandbox; COD → place order directly

      if (isVNPay) {
        // VNPay flow: call create-payment to get redirect URL, then redirect browser
        const amountVND = Math.round(finalTotal); // amount in VND
        const res = await PaymentService.createPayment(amountVND);
        // Backend trả về { status, data: "https://sandbox.vnpayment.vn/..." }
        const vnpayUrl = res?.data || res;
        if (!vnpayUrl || typeof vnpayUrl !== "string") {
          throw new Error("Không nhận được URL thanh toán VNPay");
        }
        // Save full order info to localStorage so VNPay return page can resync cart & place order
        localStorage.setItem("pk_pending_order", JSON.stringify({
          form,
          shipMethod,                         // shipping UUID (already selected)
          payMethodId: dbPayMethod?.id || null, // real UUID (already selected)
          items: items.map(i => ({ id: i.id, qty: i.qty })),
        }));
        // Redirect browser to VNPay sandbox
        window.location.href = vnpayUrl;
        return; // VNPay will redirect back to /payment/vnpay/return
      } else {
        // COD / other non-VNPay: place order directly
        const orderData = {
          billingAddress: {
            companyName: form.name,
            streetAddress: form.address,
            country: "Việt Nam",
            state: form.city,
            zipCode: 700000,
          },
          shippingAddress: {
            companyName: form.name,
            streetAddress: form.address,
            country: "Việt Nam",
            state: form.city,
            zipCode: 700000,
          },
          note: form.note,
        };
        await OrderService.placeOrder(orderData);
        clear();
        setOrdered(true);
        show("Đặt hàng thành công!");
      }
    } catch (err) {
      console.error("Order failed", err);
      show(err?.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <main className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div className="card" style={{ textAlign: "center", padding: "56px 40px", maxWidth: 440 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,var(--pk-pink),#d44070)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 28px rgba(232,88,122,0.4)" }}>
            <Check size={32} color="#fff" />
          </div>
          <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.8rem", fontWeight: 700, marginBottom: 12 }}>Đặt hàng thành công!</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
            Cảm ơn <strong>{form.name}</strong>! Đơn hàng của bạn đang được xử lý.<br />
            Chúng tôi sẽ gửi email xác nhận đến <strong>{form.email}</strong>.
          </p>
          <button onClick={() => navigate("/")} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Về trang chủ
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content" style={{ paddingBottom: 72 }}>
      <div className="container">
        <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, padding: "36px 0 32px" }}>
          Thanh toán
        </h1>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40, maxWidth: 540 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: i <= step ? "linear-gradient(135deg,var(--pk-pink),#d44070)" : "var(--border)",
                  color: i <= step ? "#fff" : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.82rem", transition: "all 0.3s"
                }}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: i === step ? 700 : 400, color: i === step ? "var(--pk-pink)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? "var(--pk-pink)" : "var(--border)", margin: "0 6px", marginBottom: 20, transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "flex-start" }}>
          {/* Form */}
          <div className="card" style={{ padding: 28 }}>
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Thông tin liên hệ</h3>
                <Field label="Họ và tên *" error={errors.name}>
                  <input className="input-pk" placeholder="Trịnh Minh Phương" value={form.name} onChange={e => set("name", e.target.value)} />
                </Field>
                <Field label="Email *" error={errors.email}>
                  <input className="input-pk" type="email" placeholder="email@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </Field>
                <Field label="Số điện thoại *" error={errors.phone}>
                  <input className="input-pk" placeholder="0866772011" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </Field>
                <Field label="Địa chỉ giao hàng *" error={errors.address}>
                  <input className="input-pk" placeholder="Số nhà, đường, phường, quận..." value={form.address} onChange={e => set("address", e.target.value)} />
                </Field>
                <Field label="Tỉnh / Thành phố *" error={errors.city}>
                  <select className="input-pk" value={form.city} onChange={e => set("city", e.target.value)}>
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {PROVINCES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Ghi chú (không bắt buộc)">
                  <textarea className="input-pk" rows={3} placeholder="Ghi chú thêm cho đơn hàng..." value={form.note} onChange={e => set("note", e.target.value)} style={{ resize: "vertical" }} />
                </Field>

                {/* Vận chuyển ghép vào step 1 */}
                {shippingMethods.length > 0 && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>Phương thức vận chuyển *</label>
                    {shippingMethods.map(opt => (
                      <label key={opt.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: "var(--radius-md)", border: `2px solid ${shipMethod === opt.id ? "var(--pk-pink)" : "var(--border)"}`, marginBottom: 10, cursor: "pointer", background: shipMethod === opt.id ? "var(--pk-pink-light)" : "var(--surface)", transition: "all 0.2s" }}>
                        <input type="radio" name="ship" value={opt.id} checked={shipMethod === opt.id} onChange={() => setShipMethod(opt.id)} style={{ accentColor: "var(--pk-pink)" }} />
                        <Truck size={16} color="var(--pk-pink)" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{opt.name.replace(/chu\?n/gi, "chuẩn").replace(/\?\?\?/g, "")}</div>
                          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{opt.description || "Giao hàng tận nơi"} · {formatPrice(opt.price)}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Phương thức thanh toán</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {PAY_OPTIONS.map(opt => (
                    <label key={opt.id} onClick={() => setPayMethod(opt.id)} style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "18px 20px", borderRadius: "var(--radius-md)",
                      border: `2px solid ${payMethod === opt.id ? "var(--pk-pink)" : "var(--border)"}`,
                      cursor: "pointer",
                      background: payMethod === opt.id ? "var(--pk-pink-light)" : "var(--surface)",
                      transition: "all 0.2s",
                    }}>
                      <input type="radio" name="pay" checked={payMethod === opt.id} onChange={() => setPayMethod(opt.id)}
                        style={{ accentColor: "var(--pk-pink)", width: 18, height: 18, flexShrink: 0 }} />
                      {opt.id === "COD" ? (
                        <Banknote size={28} color={payMethod === opt.id ? "var(--pk-pink)" : "var(--text-muted)"} style={{ flexShrink: 0 }} />
                      ) : (
                        <span style={{ fontWeight: 900, fontSize: "1rem", color: payMethod === opt.id ? "#0066CC" : "var(--text-muted)", fontFamily: "Arial,sans-serif", flexShrink: 0, minWidth: 28, textAlign: "center" }}>₫</span>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 3 }}>{opt.label}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{opt.desc}</div>
                        {opt.id === "VNPAY" && (
                          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            {["ATM","Visa","Mastercard","QR"].map(t => (
                              <span key={t} style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 999, background: "#e8f4ff", color: "#0066CC", fontWeight: 600 }}>{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {payMethod === opt.id && (
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--pk-pink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Check size={13} color="#fff" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Xác nhận đơn hàng</h3>
                {[
                  ["Họ tên", form.name], ["Email", form.email], ["SĐT", form.phone],
                  ["Địa chỉ", form.address], ["Tỉnh/TP", form.city],
                  ["Vận chuyển", shippingMethods.find(m => m.id === shipMethod)?.name || "Chưa chọn"],
                  ["Thanh toán", PAY_OPTIONS.find(o => o.id === payMethod)?.label || payMethod],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 12, paddingBlock: 8, borderBottom: "1px solid var(--border)", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--text-muted)", width: 90, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-outline">Quay lại</button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={handleNext} className="btn-primary">Tiếp theo</button>
              ) : (
                <button onClick={handleOrder} className="btn-primary" disabled={loading}>
                  {loading ? "Đang xử lý..." : <><Check size={16} /> Thanh toán {formatPrice(finalTotal)}</>}
                </button>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="card" style={{ padding: 22, width: 280, position: "sticky", top: 90 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.95rem" }}>Đơn hàng ({items.length})</h4>
            <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img src={item.image} alt={item.name} style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>x{item.qty} · {formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-muted)" }}>Tạm tính</span><span>{formatPrice(total)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--text-muted)" }}>Vận chuyển</span><span style={{ color: shipping === 0 ? "#22c55e" : undefined }}>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <span>Tổng</span><span style={{ color: "var(--pk-pink)" }}>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children, error }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{error}</p>}
    </div>
  );
}
