import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  User,
  Heart,
  Bell,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useSettingStore } from "../stores/useSettingStore";
import { useWishlistStore } from "../stores/useWishlistStore"; // thêm import
import { useNotificationStore } from "../stores/useNotificationStore";
import { useEffect, useState,useRef } from "react";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const { cart } = useCartStore();
  const { setting: generalSetting, fetchSetting } = useSettingStore();
  const navigate = useNavigate();
  const { wishlist } = useWishlistStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationRef = useRef();

  useEffect(() => {
    if (!generalSetting) fetchSetting();
  }, []);
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-[#0a0a1f]/90 backdrop-blur-md shadow-lg z-50 transition-all duration-300 border-b border-[#13132a]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-blue-300 flex items-center gap-2"
          >
            {generalSetting?.logo && (
              <img
                src={generalSetting.logo}
                alt="Logo"
                className="w-8 h-8 rounded"
              />
            )}
            {generalSetting?.storeName || "TP.Cosmic Store"}
          </Link>

          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-blue-400 transition"
            >
              Home
            </Link>

            {user && (
              <>
                <Link
                  to="/cart"
                  className="relative text-gray-300 hover:text-blue-400 transition"
                >
                  <ShoppingCart className="inline-block mr-1" size={20} />
                  <span className="hidden sm:inline">Cart</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -left-2 items-center bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
                      {cart.length}
                    </span>
                  )}
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative text-gray-300 hover:text-pink-400 transition"
                >
                  <Heart className="inline-block mr-1" size={20} />
                  <span className="hidden sm:inline">Liked</span>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-2 -left-2 bg-pink-500 text-white rounded-full px-2 py-1 text-xs">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-blue-400 transition flex items-center"
                >
                  <User className="inline-block mr-1" size={20} />
                  <span className="hidden sm:inline">User</span>
                </Link>

                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() =>
                      setShowNotificationDropdown(!showNotificationDropdown)
                    }
                    className="relative text-gray-300 hover:text-yellow-400 transition"
                  >
                    <Bell className="inline-block mr-1" size={20} />
                    <span className="hidden sm:inline">Notify</span>
                    {Array.isArray(notifications) &&
                      notifications.filter((n) => !n.isRead).length > 0 && (
                        <span className="absolute -top-1 -left-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {notifications.filter((n) => !n.isRead).length}
                        </span>
                      )}
                  </button>

                  {/* Dropdown */}
                  {showNotificationDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-gray-900 text-white shadow-lg rounded-lg border border-gray-700 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-700 font-semibold text-sm">
                        Unread Notifications
                      </div>
                      {notifications.filter((n) => !n.isRead).length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          No unread notifications.
                        </div>
                      ) : (
                        notifications
                          .filter((n) => !n.isRead)
                          .slice(0, 5)
                          .map((n) => (
                            <Link
                              to={n.link || "/notifications"}
                              key={n._id}
                              onClick={() => setShowNotificationDropdown(false)}
                              className="block px-4 py-3 hover:bg-gray-800 text-sm border-b border-gray-800"
                            >
                              <div className="font-medium">{n.message}</div>
                              <div className="text-gray-400 text-xs">
                                {new Date(n.createdAt).toLocaleString()}
                              </div>
                            </Link>
                          ))
                      )}
                      <div className="px-4 py-2">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotificationDropdown(false)}
                          className="text-blue-400 hover:underline text-sm"
                        >
                          See all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {(isAdmin || isStaff) && (
              <Link
                to="/secret-dashboard"
                className="bg-blue-400 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center"
              >
                <Lock className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded-md flex items-center"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">Log Out</span>
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-blue-400 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center"
                >
                  <UserPlus className="mr-2" size={18} />
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-blue-400 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center"
                >
                  <LogIn className="mr-2" size={18} />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
