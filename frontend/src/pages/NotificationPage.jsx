import { useState } from "react";
import { useNotificationStore } from "../stores/useNotificationStore";
import { motion } from "framer-motion";
import Breadcrumb from "../components/Breadcrumb";
import { Link } from "react-router-dom";

const typeColors = {
  info: "bg-blue-700",
  promotion: "bg-pink-700",
  order: "bg-green-700",
  system: "bg-purple-700",
};

const NotificationPage = () => {
  const {
    notifications,
    markAllAsRead,
    deleteAllNotifications,
    deleteReadNotifications,
  } = useNotificationStore();

  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Notifications" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    const readCondition =
      filter === "read" ? n.isRead : filter === "unread" ? !n.isRead : true;
    const typeCondition = typeFilter === "all" ? true : n.type === typeFilter;
    return readCondition && typeCondition;
  });

  return (
    <div className="min-h-screen mb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-b from-[#0a0a1f] to-transparent w-full py-6 shadow-sm"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-3xl sm:text-5xl font-bold text-blue-300 mt-2 text-center">
            Notifications
          </h1>
        </div>
      </motion.div>

      {/* Bộ lọc và hành động */}
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-4 items-center mb-6">

          {/* Bộ lọc dạng select */}
          <div className="flex gap-4 flex-wrap w-full sm:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="promotion">Promotion</option>
              <option value="order">Order</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Hành động */}
          <div className="flex gap-2 text-sm flex-wrap justify-end w-full sm:w-auto">
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-md text-white"
            >
              Mark all as read
            </button>
            <button
              onClick={deleteReadNotifications}
              className="bg-yellow-600 hover:bg-yellow-500 px-3 py-2 rounded-md text-white"
            >
              Delete read
            </button>
            <button
              onClick={deleteAllNotifications}
              className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-md text-white"
            >
              Delete all
            </button>
          </div>
        </div>

        {/* Danh sách thông báo */}
        {filteredNotifications.length === 0 ? (
          <p className="text-gray-400 text-center mt-6">
            No notifications to show.
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredNotifications.map((n, index) => (
              <motion.li
                key={n._id || `notification-${index}`}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "#1f2937",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
                transition={{ type: "spring", stiffness: 200 }}
                className="rounded-lg cursor-pointer overflow-hidden"
              >
                <Link
                  to={n.link || "/notifications"}
                  className={`block p-4 transition-all duration-300 border border-gray-600 ${
                    n.isRead ? "bg-gray-800" : typeColors[n.type] || "bg-yellow-700"
                  } hover:bg-blue-500`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-white">{n.message}</div>
                    <span className="text-xs bg-black/30 px-2 py-1 rounded-full text-white capitalize">
                      {n.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
