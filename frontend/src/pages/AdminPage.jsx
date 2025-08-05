import {
  BarChart,
  ShoppingBasket,
  Ticket,
  User,
  ImageIcon,
  ShieldCheck,
  Cog,
  Package,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import ProductsList from "../components/ProductsList";
import AnalyticsTab from "../components/AnalyticsTab";
import CouponsList from "../components/CouponsList";
import BannerList from "../components/BannerList";
import UserList from "../components/UserList";
import PoliciesList from "../components/PoliciesList";
import GeneralSettings from "../components/GeneralSettings";
import OrderList from "../components/OrderList";


import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import ReviewList from "../components/ReviewList";

const tabs = [
  { id: "analytics", label: "Analytics", icon: BarChart },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "orders", label: "Orders", icon: Package },
  { id: "users", label: "Users", icon: User },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "reviews", label: "Reviews", icon: MessageCircle },
  { id: "banners", label: "Banners", icon: ImageIcon },
  { id: "policies", label: "Policies", icon: ShieldCheck },
  { id: "general", label: "General", icon: Cog },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const { fetchAllProducts } = useProductStore();
  const { user } = useUserStore();
  const { products, fetchProducts } = useProductStore();
  const [selectedProductId, setSelectedProductId] = useState(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const filteredTabs = tabs.filter((tab) => {
    if (["users", "banners", "policies", "general"].includes(tab.id)) {
      return isAdmin;
    }
    return true;
  });

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.h1
          className="text-5xl font-bold mb-10 text-blue-300 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {filteredTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Nội dung tab */}
        {activeTab === "products" && <ProductsList />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "coupons" && <CouponsList />}
        {activeTab === "orders" && <OrderList />}
        {activeTab === "reviews" && <ReviewList />}
        {activeTab === "users" && isAdmin && <UserList />}
        {activeTab === "banners" && isAdmin && <BannerList />}
        {activeTab === "policies" && isAdmin && <PoliciesList />}
        {activeTab === "general" && isAdmin && <GeneralSettings />}
      </div>
    </div>
  );
};

export default AdminPage;
