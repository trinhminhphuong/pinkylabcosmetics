import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Tag, ChevronRight, Loader } from "lucide-react";
import { NewsService, NewsCategoryService } from "../services/apiServices";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function NewsCard({ news, featured = false }) {
  const thumbnail = news.thumbnailUrl || news.imageUrl1 || null;
  return (
    <Link
      to={`/news/${news.id}`}
      style={{
        display: "block", textDecoration: "none", color: "inherit",
        background: "#fff", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)", overflow: "hidden",
        transition: "all 0.3s ease", cursor: "pointer"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: "100%", aspectRatio: featured ? "16/7" : "16/9",
        background: "var(--pk-pink-light)", overflow: "hidden", position: "relative"
      }}>
        {thumbnail ? (
          <img src={thumbnail} alt={news.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
            🌸
          </div>
        )}
        {news.category && (
          <span style={{
            position: "absolute", top: 12, left: 12,
            background: "var(--pk-pink)", color: "#fff",
            fontSize: "0.72rem", fontWeight: 700, padding: "4px 12px",
            borderRadius: 999, letterSpacing: "0.05em"
          }}>
            {news.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: featured ? "28px 32px" : "20px" }}>
        <h2 style={{
          fontFamily: "Playfair Display, serif",
          fontSize: featured ? "1.4rem" : "1.05rem",
          fontWeight: 700, lineHeight: 1.4,
          marginBottom: 10, color: "var(--text)",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>
          {news.title}
        </h2>

        {featured && news.content && (
          <p style={{
            fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7,
            marginBottom: 16,
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden"
          }}>
            {news.content.replace(/<[^>]*>/g, "").slice(0, 180)}...
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-muted)" }}>
            <Calendar size={13} />
            {formatDate(news.createdAt)}
            {news.author && (
              <>
                <span style={{ margin: "0 4px" }}>·</span>
                <span>{news.author.firstName} {news.author.lastName}</span>
              </>
            )}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--pk-pink)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            Đọc tiếp <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    NewsCategoryService.getAllCategories({ pageNum: 1, pageSize: 100 })
      .then(res => {
        const data = res?.data;
        setCategories(data?.items || data?.content || []);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { pageNum: page + 1, pageSize: PAGE_SIZE };
    if (selectedCat) params.categoryId = selectedCat;
    NewsService.getAllNews(params)
      .then(res => {
        const data = res?.data;
        setNews(data?.items || data?.content || []);
        setTotalPages(data?.meta?.totalPages || data?.totalPages || 1);
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [page, selectedCat]);

  const filtered = search.trim()
    ? news.filter(n => n.title?.toLowerCase().includes(search.toLowerCase()))
    : news;

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <main className="page-content" style={{ paddingBottom: 72 }}>
      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #ffe4e8 0%, #fff0f5 50%, #fce4ec 100%)",
        padding: "64px 20px 48px",
        textAlign: "center",
        borderBottom: "1px solid var(--border)"
      }}>
        <p className="label-pink" style={{ marginBottom: 12 }}>✦ BLOG & TIN TỨC</p>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, marginBottom: 16 }}>
          Bí quyết làm đẹp & xu hướng mỹ phẩm
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Cập nhật kiến thức skincare, review sản phẩm và xu hướng làm đẹp mới nhất từ PinkyLab.
        </p>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", maxWidth: 480, margin: "0 auto",
          background: "#fff", borderRadius: 999, overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid var(--border)"
        }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            style={{ flex: 1, border: "none", outline: "none", padding: "14px 20px", fontSize: "0.9rem", background: "transparent" }}
          />
          <button style={{ background: "var(--pk-pink)", color: "#fff", border: "none", padding: "14px 20px", cursor: "pointer" }}>
            <Search size={18} />
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48 }}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Category filters */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
              <button
                onClick={() => { setSelectedCat(null); setPage(0); }}
                style={{
                  padding: "8px 18px", borderRadius: 999, border: "2px solid",
                  borderColor: !selectedCat ? "var(--pk-pink)" : "var(--border)",
                  background: !selectedCat ? "var(--pk-pink)" : "transparent",
                  color: !selectedCat ? "#fff" : "var(--text)",
                  fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                Tất cả
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCat(cat.id); setPage(0); }}
                  style={{
                    padding: "8px 18px", borderRadius: 999, border: "2px solid",
                    borderColor: selectedCat === cat.id ? "var(--pk-pink)" : "var(--border)",
                    background: selectedCat === cat.id ? "var(--pk-pink)" : "transparent",
                    color: selectedCat === cat.id ? "#fff" : "var(--text)",
                    fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                <Loader size={36} color="var(--pk-pink)" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>📰</div>
                <p style={{ fontSize: "1.1rem" }}>Chưa có bài viết nào</p>
              </div>
            ) : (
              <>
                {/* Featured post */}
                {featured && !search && page === 0 && (
                  <div style={{ marginBottom: 36 }}>
                    <NewsCard news={featured} featured />
                  </div>
                )}

                {/* Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                  {(search || page > 0 ? filtered : rest).map(item => (
                    <NewsCard key={item.id} news={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        style={{
                          width: 40, height: 40, borderRadius: "50%", border: "2px solid",
                          borderColor: i === page ? "var(--pk-pink)" : "var(--border)",
                          background: i === page ? "var(--pk-pink)" : "#fff",
                          color: i === page ? "#fff" : "var(--text)",
                          fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ width: 280, flexShrink: 0 }} className="hide-mobile">
            {/* Categories */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>
                Danh mục
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  onClick={() => { setSelectedCat(null); setPage(0); }}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderRadius: "var(--radius-md)", border: "none",
                    background: !selectedCat ? "var(--pk-pink-light)" : "transparent",
                    color: !selectedCat ? "var(--pk-pink)" : "var(--text)",
                    fontWeight: !selectedCat ? 700 : 500, cursor: "pointer", textAlign: "left",
                    fontSize: "0.88rem", transition: "all 0.2s"
                  }}
                >
                  Tất cả bài viết
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{news.length}+</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCat(cat.id); setPage(0); }}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderRadius: "var(--radius-md)", border: "none",
                      background: selectedCat === cat.id ? "var(--pk-pink-light)" : "transparent",
                      color: selectedCat === cat.id ? "var(--pk-pink)" : "var(--text)",
                      fontWeight: selectedCat === cat.id ? 700 : 500, cursor: "pointer", textAlign: "left",
                      fontSize: "0.88rem", transition: "all 0.2s"
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent posts */}
            {news.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                  Bài viết gần đây
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {news.slice(0, 4).map(item => (
                    <Link to={`/news/${item.id}`} key={item.id} style={{ display: "flex", gap: 12, textDecoration: "none", color: "inherit" }}>
                      <div style={{ width: 60, height: 60, borderRadius: "var(--radius-md)", overflow: "hidden", flexShrink: 0, background: "var(--pk-pink-light)" }}>
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>🌸</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.4, color: "var(--text)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>{formatDate(item.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
