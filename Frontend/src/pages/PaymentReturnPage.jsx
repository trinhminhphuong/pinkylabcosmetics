import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentService, OrderService, CartService, PaymentMethodService } from "../services/apiServices";
import { useCart, useToast } from "../context/store";
import { Check, XCircle, Loader } from "lucide-react";

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clear } = useCart();
  const { show } = useToast();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Đang xác nhận thanh toán với VNPay...");
  const [elapsed, setElapsed] = useState(0);   // đếm giây chờ
  const [countdown, setCountdown] = useState(5); // đếm ngược sau success
  const hasRun = useRef(false);
  const timerRef = useRef(null);
  const elapsedRef = useRef(null);

  // Bộ đếm giây khi đang loading
  useEffect(() => {
    if (status !== "loading") { clearInterval(elapsedRef.current); return; }
    elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(elapsedRef.current);
  }, [status]);

  // Đếm ngược 5s khi success rồi về trang chủ
  useEffect(() => {
    if (status !== "success") return;
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [status, navigate]);

  useEffect(() => {
    if (hasRun.current) return; // Already running — skip
    hasRun.current = true;
    const txnRef       = searchParams.get("vnp_TxnRef");
    const responseCode = searchParams.get("vnp_ResponseCode");
    const txnStatus    = searchParams.get("vnp_TransactionStatus");

    const finalize = async () => {
      // ── Bước 1: Kiểm tra kết quả VNPay từ URL params ──────────────────────
      if (responseCode !== "00" || txnStatus !== "00") {
        setStatus("failed");
        setMessage(`Thanh toán không thành công (mã lỗi VNPay: ${responseCode || "unknown"}). Vui lòng thử lại.`);
        return;
      }

      // ── Bước 2: Poll /payment/status/{txnRef} cho đến khi DB xác nhận ──────
      // Không fallback — chờ DB trả về SUCCESS thật sự
      let dbStatus = "PENDING";
      if (!txnRef) {
        setStatus("failed");
        setMessage("Không tìm thấy mã giao dịch. Vui lòng liên hệ hỗ trợ.");
        return;
      }

      setMessage("Đang chờ xác nhận từ máy chủ...");

      // Poll với backoff: 2s, 3s, 3s, 5s, 5s, 5s, 10s, 10s, 10s, 10s... (tổng ~63s)
      const delays = [2000, 3000, 3000, 5000, 5000, 5000, 10000, 10000, 10000, 10000];
      for (let i = 0; i < delays.length; i++) {
        await new Promise(r => setTimeout(r, delays[i]));
        try {
          const res = await PaymentService.paymentStatus(txnRef);
          const rawStatus = res?.data?.data ?? res?.data ?? res;
          dbStatus = typeof rawStatus === "string" ? rawStatus.toUpperCase() : String(rawStatus).toUpperCase();
          console.log(`[PaymentReturn] Poll ${i + 1}/${delays.length}: txnRef=${txnRef}, dbStatus=${dbStatus}`);
          if (dbStatus === "SUCCESS" || dbStatus === "FAILED") break;
        } catch (e) {
          console.log(`[PaymentReturn] Poll ${i + 1}/${delays.length}: not updated yet (${e?.response?.status || e?.message})`);
        }
        // Chỉ cập nhật text mô tả, giây sẽ tự đếm riêng
        setMessage("Đang chờ xác nhận thanh toán...");
      }

      if (dbStatus === "FAILED") {
        setStatus("failed");
        setMessage("Giao dịch bị từ chối bởi ngân hàng. Vui lòng thử lại.");
        return;
      }

      // Nếu sau tất cả các lần poll DB vẫn là PENDING → timeout, báo lỗi cho user
      if (dbStatus === "PENDING") {
        setStatus("failed");
        setMessage(`Hệ thống chưa xác nhận được giao dịch. Mã GD: ${txnRef}. Vui lòng chờ và kiểm tra lại đơn hàng, hoặc liên hệ hỗ trợ.`);
        return;
      }

      // ── Bước 3: Đặt hàng ───────────────────────────────────────────────────
      // Payment VNPay thành công → chỉ cần placeOrder
      // Cart đã được sync + selectShippingMethod + selectPaymentMethod TRƯỚC khi redirect sang VNPay
      // KHÔNG cần re-sync lại (có thể fail nếu JWT hết hạn)
      setMessage("Đang tạo đơn hàng...");
      try {
        const pending = JSON.parse(localStorage.getItem("pk_pending_order") || "null");
        if (!pending) throw new Error("Không tìm thấy thông tin đơn hàng. Vui lòng liên hệ hỗ trợ.");

        const { form } = pending;

        // Nếu user vẫn còn token hợp lệ, thử placeOrder trực tiếp
        // Cart đã sẵn sàng (shipMethod + payMethod đã chọn trước khi redirect)
        let orderPlaced = false;
        try {
          const orderData = buildOrderData(form);
          await OrderService.placeOrder(orderData);
          orderPlaced = true;
        } catch (firstErr) {
          const statusCode = firstErr?.response?.status;

          // Nếu 403/401 → thử re-sync cart rồi placeOrder lại
          if (statusCode === 403 || statusCode === 401) {
            setMessage("Đang khôi phục phiên đặt hàng...");
            const { shipMethod, payMethodId, items: savedItems } = pending;

            // Re-sync cart
            try { await CartService.clearCart(); } catch (e) { /* ignore */ }
            for (const item of (savedItems || [])) {
              await CartService.addItem({ productId: item.id, quantity: item.qty });
            }

            // Re-select shipping method
            if (shipMethod) await CartService.selectShippingMethod(shipMethod);

            // Re-select payment method — dùng saved UUID hoặc fetch lại
            let pmId = payMethodId;
            if (!pmId) {
              const pmRes = await PaymentMethodService.getAllPaymentMethods();
              const pmList = pmRes?.data?.items || pmRes?.data || pmRes || [];
              const vnpay = pmList.find(m => (m.name || "").toLowerCase().includes("vnpay"));
              pmId = vnpay?.id || pmList[1]?.id;
            }
            if (pmId) await CartService.selectPaymentMethod(pmId);

            // Thử placeOrder lại
            const orderData = buildOrderData(form);
            await OrderService.placeOrder(orderData);
            orderPlaced = true;
          } else {
            throw firstErr; // Lỗi khác → re-throw
          }
        }

        if (orderPlaced) {
          localStorage.removeItem("pk_pending_order");
          clear();
          setStatus("success");
          show("🎉 Đặt hàng thành công qua VNPay!");
        }
      } catch (err) {
        console.error("[PaymentReturn] placeOrder failed:", err);
        setStatus("failed");
        const msg = err?.response?.data?.message || err?.message || "";
        setMessage(
          msg
            ? `Lỗi: ${msg}`
            : `Thanh toán VNPay thành công nhưng đặt hàng thất bại.${txnRef ? ` Mã GD: ${txnRef}` : ""} Vui lòng liên hệ hỗ trợ.`
        );
      }
    };

    finalize();
  }, []);

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "40px 20px" }}>
      <div className="card" style={{ textAlign: "center", padding: "56px 40px", maxWidth: 480, width: "100%" }}>

        {status === "loading" && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <Loader size={52} color="var(--pk-pink)" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: 12 }}>
              Đang xử lý
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              {message}{elapsed > 0 ? ` (${elapsed}s)` : ""}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg,var(--pk-pink),#d44070)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px", boxShadow: "0 8px 28px rgba(232,88,122,0.4)"
            }}>
              <Check size={36} color="#fff" />
            </div>
            <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.9rem", fontWeight: 700, marginBottom: 12 }}>
              Thanh toán thành công! 🎉
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 16 }}>
              Đơn hàng đã được đặt và xác nhận thanh toán qua <strong>VNPay</strong>.
            </p>
            <p style={{ color: "var(--pk-pink)", fontWeight: 600, fontSize: "0.9rem", marginBottom: 24 }}>
              Tự động chuyển về trang chủ sau <strong>{countdown}</strong> giây...
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => navigate("/account")} className="btn-outline">Xem đơn hàng</button>
              <button onClick={() => { clearInterval(timerRef.current); navigate("/"); }} className="btn-primary">Về trang chủ</button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#fee2e2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px"
            }}>
              <XCircle size={40} color="#ef4444" />
            </div>
            <h2 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.9rem", fontWeight: 700, marginBottom: 12, color: "#ef4444" }}>
              Thất bại
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 28, fontSize: "0.9rem" }}>{message}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => navigate("/cart")} className="btn-outline">Giỏ hàng</button>
              <button onClick={() => navigate("/checkout")} className="btn-primary">Thử lại</button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

function buildOrderData(form) {
  return {
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
    note: form.note || "",
  };
}
