import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider, AuthProvider, WishlistProvider, ToastProvider } from "./context/store";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";
import WishlistPage from "./pages/WishlistPage";
import PaymentReturnPage from "./pages/PaymentReturnPage";
import AiAnalyticsPage from "./pages/AiAnalyticsPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";

// Admin Imports
import AdminGuard from "./components/admin/AdminGuard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminNews from "./pages/admin/AdminNews";

function NotFound() {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center", padding: "0 20px", paddingTop: 88 }}>
      <div style={{ fontSize: "5rem", marginBottom: 20 }}>🌸</div>
      <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "2.5rem", fontWeight: 700, marginBottom: 12, color: "var(--pk-pink)" }}>404</h1>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 12 }}>Trang không tồn tại</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Trang bạn đang tìm kiếm có thể đã bị xóa hoặc chưa tồn tại.</p>
      <a href="/" style={{ background: "linear-gradient(135deg,var(--pk-pink),#d44070)", color: "#fff", padding: "11px 28px", borderRadius: 999, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", boxShadow: "0 4px 16px rgba(232,88,122,0.4)" }}>
        Về trang chủ
      </a>
    </main>
  );
}

function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <ChatWidget />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <Routes>
                {/* User Routes */}
                <Route element={<UserLayout />}>
                  <Route path="/"            element={<HomePage />} />
                  <Route path="/products"    element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart"        element={<CartPage />} />
                  <Route path="/checkout"    element={<CheckoutPage />} />
                  <Route path="/login"       element={<LoginPage />} />
                  <Route path="/account"     element={<AccountPage />} />
                  <Route path="/wishlist"    element={<WishlistPage />} />
                  <Route path="/ai-analytics" element={<AiAnalyticsPage />} />
                  <Route path="/news"          element={<NewsPage />} />
                  <Route path="/news/:id"       element={<NewsDetailPage />} />
                  <Route path="/payment/vnpay/return" element={<PaymentReturnPage />} />
                  <Route path="*"            element={<NotFound />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminGuard />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="brands" element={<AdminBrands />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="news" element={<AdminNews />} />
                  </Route>
                </Route>
              </Routes>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
