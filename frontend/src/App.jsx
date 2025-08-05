import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import ProductPage from "./pages/ProductPage";
import OrderPage from "./pages/OrderPage";
import UserProfilePage from "./pages/UserProfilePage";
import PolicyDetailPage from "./pages/PolicyDetailPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import WishlistPage from "./pages/WishlistPage";
import NotificationPage from "./pages/NotificationPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ProductsList from "./components/ProductsList";
import UserList from "./components/UserList";
import ChatWidget from "./components/ChatWidget";
import LoadingSpinner from "./components/LoadingSpinner";
import MaintenancePage from "./pages/MaintenancePage";

import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";
import { useWishlistStore } from "./stores/useWishlistStore";
import { useNotificationStore } from "./stores/useNotificationStore";
import { useSettingStore } from "./stores/useSettingStore";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const { fetchNotifications } = useNotificationStore();
  const { setting, fetchSetting } = useSettingStore();

  // Fetch user + setting khi app mount
  useEffect(() => {
    checkAuth();
    fetchSetting();
  }, [checkAuth, fetchSetting]);

  // Khi user thay đổi, fetch data liên quan
  useEffect(() => {
    if (!user) return;
    getCartItems();
    fetchNotifications();
    fetchWishlist();
  }, [user, getCartItems, fetchNotifications, fetchWishlist]);

  // Chờ auth hoặc setting load
  if (checkingAuth || typeof setting?.maintenanceMode?.isActive !== "boolean") {
    return <LoadingSpinner />;
  }

  const maintenanceActive = setting.maintenanceMode.isActive;
  const maintenanceMessage = setting.maintenanceMode.message;

  // 👉 Chỉ hiện trang bảo trì nếu user đã login, không phải admin
  if (user && maintenanceActive && user.role !== "admin") {
    return <MaintenancePage message={maintenanceMessage} setting={setting} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.25)_0%,_rgba(30,64,175,0.2)_45%,_rgba(15,23,42,0.1)_100%)] blur-2xl pointer-events-none" />
          </div>
        </div>

        <div className="relative z-50 pt-20">
          <Navbar />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/signup"
              element={!user ? <SignUpPage /> : <Navigate to="/" />}
            />
            <Route
              path="/login"
              element={!user ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/secret-dashboard"
              element={
                user?.role === "admin" || user?.role === "staff" ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route
              path="/cart"
              element={user ? <CartPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/purchase-success"
              element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/purchase-cancel"
              element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
            />
            <Route path="/admin/products_list" element={<ProductsList />} />
            <Route path="/admin/users_list" element={<UserList />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/admin/orders" element={<OrderPage />} />
            <Route
              path="/profile"
              element={user ? <UserProfilePage /> : <Navigate to="/login" />}
            />
            <Route path="/policy/:id" element={<PolicyDetailPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route
              path="/products/category/:category"
              element={<CategoryPage />}
            />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/cart/checkout" element={<CheckoutPage />} />
          </Routes>
        </div>

        <Toaster />
      </div>
      <ChatWidget />
      <Footer />
    </>
  );
}

export default App;
