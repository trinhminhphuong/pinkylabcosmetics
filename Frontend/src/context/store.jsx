import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Auth Context ─────────────────────────────────────────
// MUST be defined first — Cart and Wishlist depend on it
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pk_user") || "null"); } catch { return null; }
  });

  const isAuthenticated = !!user && !!localStorage.getItem("token");

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("pk_user", JSON.stringify(userData));
    if (token) localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pk_user");
    localStorage.removeItem("token");
    // Force a reload to clear all React state (wishlist, cart, etc.)
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─── Cart Context ─────────────────────────────────────────
const CartContext = createContext(null);

const normalizeItem = (item) => ({
  ...item,
  brand: typeof item.brand === "object" ? (item.brand?.name || "") : (item.brand || ""),
  image: item.image || (item.imageUrl && item.imageUrl[0]) || (item.images && item.images[0]) || null,
  price: item.price || item.oldPrice || 0,
  category: typeof item.category === "object" ? (item.category?.name || "") : (item.category || ""),
});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const cartKey = user?.email ? `pk_cart_${user.email}` : "pk_cart_guest";

  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(cartKey) || "[]");
      return saved.map(normalizeItem);
    } catch { return []; }
  });

  // Reload cart when user switches accounts
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(cartKey) || "[]");
      setItems(saved.map(normalizeItem));
    } catch { setItems([]); }
  }, [cartKey]);

  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [items, cartKey]);

  const add = (product) => {
    const normalized = normalizeItem(product);
    setItems(prev => {
      const existing = prev.find(i => i.id === normalized.id);
      if (existing) return prev.map(i => i.id === normalized.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...normalized, qty: 1 }];
    });
  };

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const update = (id, qty) => {
    if (qty <= 0) { remove(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

// ─── Wishlist Context ─────────────────────────────────────
const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const wishKey = user?.email ? `pk_wish_${user.email}` : "pk_wish_guest";

  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(wishKey) || "[]"); } catch { return []; }
  });

  // Reload wishlist when user switches accounts
  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem(wishKey) || "[]"));
    } catch { setIds([]); }
  }, [wishKey]);

  useEffect(() => {
    localStorage.setItem(wishKey, JSON.stringify(ids));
  }, [ids, wishKey]);

  const toggle = (id) => setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const has = (id) => ids.includes(id);

  return (
    <WishlistContext.Provider value={{ ids, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);

// ─── Toast Context ────────────────────────────────────────
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);

  const show = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div className="toast">
          <span style={{ fontSize: "1rem" }}>✓</span>
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
