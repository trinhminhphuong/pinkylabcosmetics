import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import ChatProductCard from "./ChatProductCard";
import { useCart, useWishlist } from "../context/store";
import { sendChatMessage, toProductCard } from "../services/aiClient";

const DEFAULT_SUGGESTIONS = ["Da dầu mụn dưới 300k", "Son đi học tự nhiên", "Kem chống nắng còn hàng", "Sản phẩm đang sale"];
const INITIAL_MESSAGE = "Xin chào! Tôi có thể giúp bạn tìm sản phẩm phù hợp. Bạn đang quan tâm đến loại mỹ phẩm nào?";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: INITIAL_MESSAGE, time: new Date(), suggestions: DEFAULT_SUGGESTIONS }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const { items: cartItems } = useCart();
  const { ids: wishlistIds } = useWishlist();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text = input) => {
    const content = text.trim();
    if (!content || typing) return;

    const userMsg = { id: Date.now(), from: "user", text: content, time: new Date() };
    const history = messages
      .filter(msg => msg.text)
      .slice(-8)
      .map(msg => ({ role: msg.from === "user" ? "user" : "assistant", content: msg.text }));

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const response = await sendChatMessage({
        message: content,
        history,
        limit: 4,
        cart_product_ids: cartItems.map(item => String(item.id)),
        wishlist_product_ids: wishlistIds.map(String),
      });

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: response.reply,
          time: new Date(),
          products: (response.items || []).map(toProductCard),
          suggestions: response.suggestions || DEFAULT_SUGGESTIONS,
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: "Mình đang gặp lỗi kết nối AI. Bạn thử lại sau hoặc xem trực tiếp trang Sản phẩm nhé.",
          time: new Date(),
          suggestions: DEFAULT_SUGGESTIONS,
          error: true,
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const fmtTime = (d) => d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const latestSuggestions = [...messages].reverse().find(msg => msg.from === "bot" && msg.suggestions?.length)?.suggestions || DEFAULT_SUGGESTIONS;

  return (
    <>
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

      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 28, zIndex: 200,
          width: "min(380px, calc(100vw - 32px))", maxHeight: "min(640px, calc(100vh - 120px))",
          background: "var(--surface)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 20px 60px rgba(45,26,38,0.2)",
          border: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "fadeUp 0.3s ease"
        }}>
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

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: msg.from === "user" ? "flex-end" : "flex-start" }}>
                <div className={msg.from === "user" ? "bubble-user" : "bubble-bot"} style={msg.error ? { color: "#ef4444" } : undefined}>
                  {msg.text}
                </div>

                {msg.products?.length > 0 && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                    {msg.products.map(product => <ChatProductCard key={product.id} product={product} />)}
                  </div>
                )}

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

          <div style={{ padding: "8px 14px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {latestSuggestions.slice(0, 4).map(q => (
              <button key={q} onClick={() => sendMessage(q)} disabled={typing} style={{
                fontSize: "0.72rem", padding: "4px 10px", borderRadius: 999,
                border: "1.5px solid var(--pk-pink)", color: "var(--pk-pink)",
                background: "var(--pk-pink-light)", cursor: typing ? "not-allowed" : "pointer", transition: "all 0.15s"
              }}>
                {q}
              </button>
            ))}
          </div>

          <div style={{ padding: "10px 14px 14px", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Nhập tin nhắn…"
              disabled={typing}
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 999,
                border: "1.5px solid var(--border)",
                background: "var(--surface-2)", fontSize: "0.875rem",
                outline: "none", color: "var(--text)"
              }}
            />
            <button onClick={() => sendMessage()} disabled={typing || !input.trim()} style={{
              width: 38, height: 38, borderRadius: "50%",
              background: typing || !input.trim() ? "#ddd" : "linear-gradient(135deg, var(--pk-pink), #d44070)",
              border: "none", cursor: typing || !input.trim() ? "not-allowed" : "pointer",
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
