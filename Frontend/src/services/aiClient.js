const AI_API_BASE = (import.meta.env.VITE_AI_API_URL || "http://localhost:8010/api").replace(/\/$/, "");
const SESSION_KEY = "pk_ai_session_id";

export function getAiSessionId() {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `pk-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(SESSION_KEY, id);
  return id;
}

async function aiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${AI_API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`AI API ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function trackEvent(event) {
  try {
    await aiFetch("/events", {
      method: "POST",
      body: JSON.stringify({
        session_id: getAiSessionId(),
        ...event,
      }),
    });
  } catch {
    // AI tracking must never block the shopping flow.
  }
}

export function getRecommendations(payload = {}) {
  return aiFetch("/recommendations", {
    method: "POST",
    body: JSON.stringify({
      session_id: getAiSessionId(),
      limit: 8,
      ...payload,
    }),
  });
}

export function getAnalyticsSummary(periodDays = 30) {
  return aiFetch(`/analytics/summary?period_days=${periodDays}`);
}

export function sendChatMessage(payload = {}) {
  return aiFetch("/chat", {
    method: "POST",
    body: JSON.stringify({
      session_id: getAiSessionId(),
      limit: 4,
      ...payload,
    }),
  });
}

export function toProductCard(item) {
  return {
    id: item.id,
    name: item.name,
    brand: item.brand,
    category: item.category,
    price: item.price,
    originalPrice: item.original_price,
    rating: item.rating || 4.6,
    reviews: item.reviews || 0,
    image: item.image,
    images: item.image ? [item.image] : [],
    badge: item.badge,
    description: item.description,
    stock: item.stock,
    inStock: item.in_stock,
    tags: item.tags || [],
    attributes: item.attributes || {},
    aiScore: item.score,
    aiReason: item.reason || item.matched_reason,
  };
}
