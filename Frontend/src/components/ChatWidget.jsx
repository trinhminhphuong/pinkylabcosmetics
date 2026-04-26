import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

const BOT_RESPONSES = {
  default: "Xin chào! Tôi có thể giúp bạn tìm sản phẩm phù hợp. Bạn đang quan tâm đến loại mỹ phẩm nào? 💕",
  skincare: "Chúng tôi có dòng Skincare đầy đủ: Serum, Kem dưỡng, Toner, Kem chống nắng. Bạn muốn tư vấn sản phẩm nào?",
  makeup: "Dòng Makeup của PinkyLab gồm: Son môi, Phấn má hồng, Phấn nền và Bảng mắt. Bạn muốn biết thêm về sản phẩm nào?",
  giá: "Sản phẩm PinkyLab có giá từ 220.000đ đến 720.000đ. Bạn có thể vào trang Sản phẩm để lọc theo giá nhé!",
  giao: "Chúng tôi giao hàng toàn quốc trong 2-5 ngày. Miễn phí giao hàng cho đơn từ 500.000đ!",
  đổi: "Chính sách đổi trả trong 30 ngày nếu sản phẩm lỗi hoặc không đúng mô tả. Liên hệ 1800 6868 để được hỗ trợ.",
  khuyến: "Nhập mã PINKY10 để giảm 10% cho đơn đầu tiên! Theo dõi fanpage để cập nhật khuyến mãi mới nhất.",
};

function getBotReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes("skincare") || lower.includes("da") || lower.includes("serum") || lower.includes("kem")) return BOT_RESPONSES.skincare;
  if (lower.includes("makeup") || lower.includes("son") || lower.includes("phấn") || lower.includes("mắt")) return BOT_RESPONSES.makeup;
  if (lower.includes("giá") || lower.includes("bao nhiêu") || lower.includes("tiền")) return BOT_RESPONSES.giá;
  if (lower.includes("giao") || lower.includes("ship") || lower.includes("nhận")) return BOT_RESPONSES.giao;
  if (lower.includes("đổi") || lower.includes("trả") || lower.includes("hoàn")) return BOT_RESPONSES.đổi;
  if (lower.includes("giảm") || lower.includes("mã") || lower.includes("khuyến") || lower.includes("ưu đãi")) return BOT_RESPONSES.khuyến;
  return "Cảm ơn bạn đã nhắn tin! Để được tư vấn chi tiết hơn, vui lòng gọi hotline 1800 6868 hoặc email hello@pinkylab.vn 💌";
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: BOT_RESPONSES.default, time: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: "user", text: input.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: "bot", text: getBotReply(userMsg.text), time: new Date() }]);
    }, 900);
  };

  const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

  const fmtTime = (d) => d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* FAB Button */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 200,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--pk-pink), #d44070)",
        color: "#fff", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 6px 24px rgba(232,88,122,0.5)",
        transition: "all 0.3s",
        animation: open ? "none" : "pulse-ring 2s infinite"
      }}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 28, zIndex: 200,
          width: 340, maxHeight: 480,
          background: "var(--surface)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 20px 60px rgba(45,26,38,0.2)",
          border: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "fadeUp 0.3s ease"
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 18px",
            background: "linear-gradient(135deg, var(--pk-pink), #d44070)",
            color: "#fff",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>PinkyLab Assistant</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.85, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                Trực tuyến
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: msg.from === "user" ? "flex-end" : "flex-start" }}>
                <div className={msg.from === "user" ? "bubble-user" : "bubble-bot"}>
                  {msg.text}
                </div>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", paddingInline: 4 }}>
                  {fmtTime(msg.time)}
                </span>
              </div>
            ))}
            {typing && (
              <div className="bubble-bot" style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--pk-pink)", display: "inline-block", animation: `float ${0.6 + i * 0.15}s ease-in-out infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div style={{ padding: "8px 14px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Skincare", "Makeup", "Giao hàng", "Khuyến mãi"].map(q => (
              <button key={q} onClick={() => { setInput(q); }} style={{
                fontSize: "0.72rem", padding: "4px 10px", borderRadius: 999,
                border: "1.5px solid var(--pk-pink)", color: "var(--pk-pink)",
                background: "var(--pk-pink-light)", cursor: "pointer", transition: "all 0.15s"
              }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 14px 14px", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Nhập tin nhắn…"
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 999,
                border: "1.5px solid var(--border)",
                background: "var(--surface-2)", fontSize: "0.875rem",
                outline: "none", color: "var(--text)"
              }}
            />
            <button onClick={sendMessage} style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--pk-pink), #d44070)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
              boxShadow: "0 3px 10px rgba(232,88,122,0.4)"
            }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
