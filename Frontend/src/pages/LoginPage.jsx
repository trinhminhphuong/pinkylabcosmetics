import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth, useToast } from "../context/store";
import { AuthService, UserService } from "../services";

export default function LoginPage() {
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  
  // Tabs: "login", "register", "forgot", "verify-otp", "reset-password"
  const [tab, setTab] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPw: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const validateLogin = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = "Email không hợp lệ";
    if (form.password.length < 6) e.password = "Mật khẩu phải có ít nhất 6 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e = {};
    if (!form.name.trim())         e.name = "Vui lòng nhập họ tên";
    if (!form.email.includes("@")) e.email = "Email không hợp lệ";
    if (form.password.length < 6)  e.password = "Mật khẩu phải có ít nhất 6 ký tự";
    if (form.password !== form.confirmPw) e.confirmPw = "Mật khẩu không khớp";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const res = await AuthService.login({ email: form.email, password: form.password });
      // apiServices.js already does .then(res => res.data), so res is the response body
      // Backend returns: { token, user, ... } or { data: { token, user, ... } }
      const token = res?.token || res?.data?.token || res?.accessToken || res?.data?.accessToken;
      const userData = res?.user || res?.data?.user || res?.data || res;
      if (token) {
        localStorage.setItem("token", token);
        let fullUser = userData;
        try {
          const profileRes = await UserService.getProfile();
          if (profileRes && profileRes.data) fullUser = { ...fullUser, ...profileRes.data };
          else if (profileRes) fullUser = { ...fullUser, ...profileRes };
        } catch (e) {
          console.error("Lỗi tải thông tin user:", e);
        }
        
        const finalName = fullUser?.firstName && fullUser?.lastName 
          ? `${fullUser.firstName} ${fullUser.lastName}` 
          : (fullUser?.fullName || fullUser?.username || form.email.split("@")[0]);

        login({ name: finalName, email: form.email, ...fullUser }, token);
        show("Đăng nhập thành công!");
        
        let isAdmin = false;
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const roles = payload.scope || payload.roles || payload.authorities || "";
          isAdmin = typeof roles === "string" ? roles.includes("ADMIN") : Array.isArray(roles) && roles.some(r => r.includes("ADMIN"));
          if (!isAdmin && payload.sub === "admin@minhphuong.com") isAdmin = true;
        } catch (e) {}

        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setErrors({ email: "Đăng nhập thất bại, vui lòng thử lại" });
      }
    } catch (error) {
      console.error(error);
      const backendMsg = error?.response?.data?.message || error?.response?.data?.error || "";
      // Translate backend error codes to user-friendly Vietnamese messages
      let friendlyMsg = "Sai tài khoản hoặc mật khẩu";
      if (backendMsg.includes("email.or.password.wrong") || backendMsg.includes("wrong")) {
        friendlyMsg = "Email hoặc mật khẩu không đúng";
      } else if (backendMsg.includes("locked") || backendMsg.includes("disabled")) {
        friendlyMsg = "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ";
      } else if (backendMsg.includes("not.found") || backendMsg.includes("not found")) {
        friendlyMsg = "Tài khoản không tồn tại";
      } else if (backendMsg && !backendMsg.includes("exception.")) {
        friendlyMsg = backendMsg; // Show real message if it's not a code
      }
      setErrors({ email: friendlyMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setLoading(true);
    try {
      const nameParts = form.name.trim().split(" ");
      let lastName = form.name.trim();
      let firstName = "Khách";
      if (nameParts.length > 1) {
        lastName = nameParts.pop();
        firstName = nameParts.join(" ");
      }
      
      const res = await AuthService.register({ firstName, lastName, email: form.email, password: form.password });
      show("Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP.");
      setTab("verify-otp-register");
      setForm({ ...form, password: "", confirmPw: "" });
    } catch (error) {
      console.error(error);
      setErrors({ email: "Đăng ký thất bại, email có thể đã tồn tại" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpRegister = async (e) => {
    e.preventDefault();
    if (!form.otp.trim()) return setErrors({ otp: "Vui lòng nhập mã OTP" });
    setLoading(true);
    try {
      await AuthService.verifyOtp({ email: form.email, otp: form.otp });
      show("Xác thực tài khoản thành công! Vui lòng đăng nhập.");
      setTab("login");
      setForm({ name:"", email: form.email, password:"", confirmPw:"", otp:"" });
    } catch (err) {
      setErrors({ otp: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    } finally {
      setLoading(false);
    }
  };

  // ----- FORGOT PASSWORD FLOW -----
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email.includes("@")) return setErrors({ email: "Email không hợp lệ" });
    setLoading(true);
    try {
      await AuthService.forgotPassword({ email: form.email });
      show("Mã xác thực đã được gửi đến email của bạn.");
      setTab("verify-otp");
    } catch (err) {
      setErrors({ email: "Email không tồn tại hoặc lỗi hệ thống" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!form.otp.trim()) return setErrors({ otp: "Vui lòng nhập mã OTP" });
    setLoading(true);
    try {
      await AuthService.verifyOtpToResetPassword({ email: form.email, otp: form.otp });
      show("Xác thực thành công. Vui lòng đặt mật khẩu mới.");
      setTab("reset-password");
    } catch (err) {
      setErrors({ otp: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=\S+$).{8,}$/;
    if (!regex.test(form.password)) {
      return setErrors({ password: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số, không có khoảng trắng" });
    }
    if (form.password !== form.confirmPw) return setErrors({ confirmPw: "Mật khẩu không khớp" });
    
    setLoading(true);
    try {
      await AuthService.resetPassword({ 
        email: form.email, 
        newPassword: form.password,
        reEnterPassword: form.confirmPw
      });
      show("Đổi mật khẩu thành công! Bạn có thể đăng nhập.");
      setTab("login");
      setForm({ ...form, password: "", confirmPw: "", otp: "" });
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setErrors({ password: "Mật khẩu mới không được trùng với mật khẩu cũ" });
      } else {
        setErrors({ confirmPw: "Lỗi đổi mật khẩu, vui lòng thử lại sau" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-content hero-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "90vh", padding: "40px 20px" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "40px 36px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontFamily: "Playfair Display,serif", fontWeight: 700, fontSize: "1.8rem", color: "var(--pk-pink)" }}>PinkyLab</span>
        </div>

        {/* Tabs for Login / Register */}
        {(tab === "login" || tab === "register") && (
          <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 999, padding: 4, marginBottom: 28 }}>
            {["login","register"].map(t => (
              <button key={t} onClick={() => { setTab(t); setErrors({}); setForm({ name:"",email:"",password:"",confirmPw:"",otp:"" }); }}
                style={{ flex: 1, padding: "9px 0", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", transition: "all 0.25s",
                  background: tab === t ? "linear-gradient(135deg,var(--pk-pink),#d44070)" : "transparent",
                  color: tab === t ? "#fff" : "var(--text-muted)"
                }}>
                {t === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>
        )}

        {/* Login form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Email" error={errors.email}>
              <input className="input-pk" type="email" placeholder="email@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            </Field>
            <Field label="Mật khẩu" error={errors.password}>
              <div style={{ position: "relative" }}>
                <input className="input-pk" type={showPw ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <div style={{ textAlign: "right" }}>
              <button type="button" onClick={() => setTab("forgot")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "var(--pk-pink)", fontWeight: 500 }}>Quên mật khẩu?</button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

          </form>
        )}

        {/* Register form */}
        {tab === "register" && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Họ và tên" error={errors.name}>
              <input className="input-pk" placeholder="Trịnh Minh Phương" value={form.name} onChange={e => set("name", e.target.value)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input className="input-pk" type="email" placeholder="email@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            </Field>
            <Field label="Mật khẩu" error={errors.password}>
              <div style={{ position: "relative" }}>
                <input className="input-pk" type={showPw ? "text" : "password"} placeholder="Ít nhất 6 ký tự" value={form.password} onChange={e => set("password", e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Xác nhận mật khẩu" error={errors.confirmPw}>
              <input className="input-pk" type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPw} onChange={e => set("confirmPw", e.target.value)} />
            </Field>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </form>
        )}

        {/* Forgot Password Flow */}
        {tab === "forgot" && (
          <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: 700 }}>Quên Mật Khẩu</h3>
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Vui lòng nhập email đăng ký để nhận mã OTP.</p>
            <Field label="Email" error={errors.email}>
              <input className="input-pk" type="email" placeholder="email@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            </Field>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              {loading ? "Đang xử lý..." : "Gửi mã OTP"}
            </button>
            <button type="button" onClick={() => setTab("login")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}>Quay lại đăng nhập</button>
          </form>
        )}

        {tab === "verify-otp" && (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: 700 }}>Xác Thực OTP</h3>
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Mã gồm 6 chữ số đã được gửi tới <strong>{form.email}</strong></p>
            <Field label="Mã OTP" error={errors.otp}>
              <input className="input-pk" placeholder="Nhập mã OTP" value={form.otp} onChange={e => set("otp", e.target.value)} />
            </Field>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              {loading ? "Đang kiểm tra..." : "Xác nhận OTP"}
            </button>
          </form>
        )}

        {tab === "verify-otp-register" && (
          <form onSubmit={handleVerifyOtpRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: 700 }}>Xác Thực Tài Khoản</h3>
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Mã gồm 6 chữ số đã được gửi tới <strong>{form.email}</strong></p>
            <Field label="Mã OTP" error={errors.otp}>
              <input className="input-pk" placeholder="Nhập mã OTP" value={form.otp} onChange={e => set("otp", e.target.value)} />
            </Field>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              {loading ? "Đang kiểm tra..." : "Xác nhận tài khoản"}
            </button>
            <button type="button" onClick={() => setTab("login")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}>Quay lại đăng nhập</button>
          </form>
        )}

        {tab === "reset-password" && (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: 700 }}>Đặt Mật Khẩu Mới</h3>
            <Field label="Mật khẩu mới" error={errors.password}>
              <div style={{ position: "relative" }}>
                <input className="input-pk" type={showPw ? "text" : "password"} placeholder="Ít nhất 6 ký tự" value={form.password} onChange={e => set("password", e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Xác nhận mật khẩu" error={errors.confirmPw}>
              <input className="input-pk" type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPw} onChange={e => set("confirmPw", e.target.value)} />
            </Field>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        )}

        {/* Footer Text */}
        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 20 }}>
          Bằng cách sử dụng hệ thống, bạn đồng ý với <a href="#" style={{ color: "var(--pk-pink)" }}>Điều khoản dịch vụ</a> của PinkyLab.
        </p>
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
