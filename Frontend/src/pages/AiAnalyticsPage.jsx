import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, Search, Sparkles, TrendingUp } from "lucide-react";
import { getAnalyticsSummary } from "../services/aiClient";

export default function AiAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalyticsSummary(30)
      .then(setSummary)
      .catch(() => setError("Không kết nối được AI service. Hãy chạy FastAPI ở cổng 8010."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-content" style={{ paddingBottom: 72 }}>
      <div className="container">
        <div style={{ padding: "34px 0 24px" }}>
          <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700 }}>
            AI Insights
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
            Phân tích dữ liệu tìm kiếm, lượt xem và tín hiệu mua hàng để cải thiện gợi ý sản phẩm.
          </p>
        </div>

        {loading && <div className="skeleton" style={{ height: 260 }} />}
        {error && <div className="card" style={{ padding: 22, color: "#ef4444" }}>{error}</div>}

        {summary && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
              <MetricCard Icon={BarChart3} label="Tổng event" value={summary.total_events} />
              <MetricCard Icon={Search} label="Từ khóa top" value={summary.top_search_terms[0]?.query || "Chưa có"} />
              <MetricCard Icon={TrendingUp} label="Nhóm quan tâm" value={summary.top_categories[0]?.category || "Chưa có"} />
              <MetricCard Icon={Sparkles} label="Sản phẩm tín hiệu mạnh" value={summary.high_intent_products[0]?.name || "Chưa có"} />
            </div>

            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 14 }}>Insight đề xuất</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {summary.recommendation_insights.map((item) => (
                  <div key={item} style={{ display: "flex", gap: 10, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    <Sparkles size={16} color="var(--pk-pink-dark)" style={{ marginTop: 3, flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <ListCard title="Sản phẩm được xem nhiều" rows={summary.top_viewed_products} empty="Chưa có lượt xem" />
              <ListCard title="Sản phẩm có tín hiệu mua cao" rows={summary.high_intent_products} empty="Chưa có tín hiệu" />
              <TermCard title="Từ khóa tìm kiếm" rows={summary.top_search_terms} />
              <ListCard
                title="Xem cao, chuyển đổi thấp"
                rows={summary.low_conversion_products}
                empty="Chưa phát hiện"
                Icon={AlertTriangle}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function MetricCard({ Icon: MetricIcon, label, value }) {
  return (
    <div className="card" style={{ padding: 20, display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 42, height: 42, borderRadius: 8, background: "var(--pk-pink-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MetricIcon size={20} color="var(--pk-pink-dark)" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: 4 }}>{label}</div>
        <div style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      </div>
    </div>
  );
}

function ListCard({ title, rows, empty, Icon: ListIcon = TrendingUp }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
        <ListIcon size={18} color="var(--pk-pink-dark)" /> {title}
      </h3>
      {rows.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((row) => (
            <div key={`${row.product_id}-${row.name}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{row.name}</span>
              <span style={{ color: "var(--pk-pink-dark)", fontWeight: 800 }}>{row.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TermCard({ title, rows }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
        <Search size={18} color="var(--pk-pink-dark)" /> {title}
      </h3>
      {rows.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Chưa có từ khóa</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {rows.map((row) => (
            <span key={row.query} style={{ padding: "7px 12px", borderRadius: 99, background: "var(--pk-pink-light)", color: "var(--pk-pink-dark)", fontWeight: 700, fontSize: "0.8rem" }}>
              {row.query} · {row.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
