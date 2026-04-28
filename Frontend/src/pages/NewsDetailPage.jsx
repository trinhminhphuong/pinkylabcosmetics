import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, Loader } from "lucide-react";
import { NewsService } from "../services/apiServices";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
}

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    NewsService.getNewsById(id)
      .then(res => {
        const data = res?.data || res;
        setNews(data);
      })
      .catch(() => setNews(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader size={36} color="var(--pk-pink)" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  if (!news) {
    return (
      <main className="page-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>📰</div>
        <h2 style={{ fontWeight: 700, marginBottom: 12 }}>Không tìm thấy bài viết</h2>
        <Link to="/news" className="btn-primary">Quay lại Blog</Link>
      </main>
    );
  }

  return (
    <main className="page-content" style={{ paddingBottom: 72 }}>
      {/* Hero Thumbnail */}
      {news.thumbnailUrl && (
        <div style={{ width: "100%", maxHeight: 480, overflow: "hidden", background: "var(--pk-pink-light)" }}>
          <img src={news.thumbnailUrl} alt={news.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}

      <div className="container">
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 0" }}>
          {/* Back */}
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 24, gap: 6 }}>
            <ArrowLeft size={16} /> Quay lại Blog
          </button>

          {/* Category tag */}
          {news.category && (
            <Link to={`/news?cat=${news.category.id}`} style={{
              display: "inline-block", background: "var(--pk-pink)", color: "#fff",
              fontSize: "0.72rem", fontWeight: 700, padding: "5px 14px",
              borderRadius: 999, marginBottom: 20, textDecoration: "none", letterSpacing: "0.05em"
            }}>
              {news.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 700, lineHeight: 1.3, marginBottom: 20, color: "var(--text)"
          }}>
            {news.title}
          </h1>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36, paddingBottom: 24, borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
            {news.author && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--pk-pink-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pk-pink)", fontWeight: 700, fontSize: "0.9rem" }}>
                  {news.author.firstName?.charAt(0) || "A"}
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{news.author.firstName} {news.author.lastName}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Tác giả</p>
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <Calendar size={14} />
              {formatDate(news.createdAt)}
            </div>
            {news.tags?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {news.tags.map(tag => (
                  <span key={tag.id} style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--pk-pink-light)", color: "var(--pk-pink)", fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>
                    <Tag size={11} /> {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ fontSize: "1rem", lineHeight: 1.85, color: "var(--text)", whiteSpace: "pre-wrap" }}>
            {news.content}
          </div>

          {/* Inline images */}
          {(news.imageUrl1 || news.imageUrl2) && (
            <div style={{ display: "grid", gridTemplateColumns: news.imageUrl1 && news.imageUrl2 ? "1fr 1fr" : "1fr", gap: 16, marginTop: 40 }}>
              {news.imageUrl1 && (
                <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={news.imageUrl1} alt="Ảnh minh họa 1" style={{ width: "100%", display: "block", objectFit: "cover" }} />
                </div>
              )}
              {news.imageUrl2 && (
                <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={news.imageUrl2} alt="Ảnh minh họa 2" style={{ width: "100%", display: "block", objectFit: "cover" }} />
                </div>
              )}
            </div>
          )}

          {/* Back to blog */}
          <div style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <Link to="/news" className="btn-outline">← Quay lại tất cả bài viết</Link>
          </div>
        </div>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
