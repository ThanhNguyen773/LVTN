import { useEffect, useState } from "react";
import {
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Pencil,
  Save,
  ShieldCheck,
  UserIcon,
  CircleDot,
  CircleOff,
  Heart,
  Ticket,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useUserStore } from "../stores/useUserStore";
import { useOrderStore } from "../stores/useOrderStore";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";

import MyActiveCoupons from "../components/MyActiveCoupons";
import WishlistSection from "../components/WishlistSection";

const UserProfilePage = () => {
  const { user, checkAuth, uploadAvatar, changePassword } = useUserStore();
  const {
    userOrders,
    fetchMyOrders,
    cancelOrderByUser,
    confirmOrderDelivered,
    loading,
  } = useOrderStore();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("user");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    avatar: "",
    isOnline: false,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [recentOnly, setRecentOnly] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // hoặc 10 tùy bạn

  useEffect(() => {
    if (user) {
      fetchMyOrders();
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        avatar: user.avatar || {},
        isOnline: !!user.isOnline || "",
      });
    }
  }, [user]);

  useEffect(() => {
    setCurrentPage(1); // reset trang khi lọc thay đổi
  }, [search, statusFilter, startDate, endDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put("/auth/me", formData);
      toast.success("Cập nhật thành công");
      setIsEditing(false);
      checkAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    }
  };
  const cancelOrder = async (orderId) => {
    await cancelOrderByUser(orderId);
    // Tự động làm mới (nếu cần) hoặc đã được cập nhật trong store
  };
  const roleDisplay = {
    admin: {
      label: "Admin",
      icon: <ShieldCheck className="w-5 h-5 mr-1" />,
      color: "text-red-500",
    },
    staff: {
      label: "Staff",
      icon: <Briefcase className="w-5 h-5 mr-1" />,
      color: "text-yellow-400",
    },
    user: {
      label: "Customer",
      icon: <UserIcon className="w-5 h-5 mr-1" />,
      color: "text-green-400",
    },
  };
  const currentRole = (user?.role || "user").toLowerCase();
  const {
    icon: RoleIcon,
    label: roleLabel,
    color: roleColor,
  } = roleDisplay[currentRole] || roleDisplay.user;

  const resetForm = () => {
    if (!user) return;
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      avatar: user.avatar || {},
      isOnline: user.isOnline || "",
    });
    setIsEditing(false);
  };

  const markAsDelivered = async (orderId) => {
    await confirmOrderDelivered(orderId);
    // nếu muốn đảm bảo nhất quán có thể refresh:
    await fetchMyOrders();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const uploaded = await uploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatar: uploaded }));
    } catch (error) {
      console.error("Upload avatar failed", error);
      toast.error("Upload avatar failed");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const renderStatus = (status, log = []) => {
    const lastChange = log?.[log.length - 1];
    return (
      <span
        title={
          lastChange
            ? `Cập nhật: ${new Date(lastChange.date).toLocaleString(
                "vi-VN"
              )} bởi ${lastChange.updatedBy?.name || "Hệ thống"}`
            : ""
        }
        className={
          "font-semibold " +
          (status === "Processing"
            ? "text-yellow-500"
            : status === "Shipping"
            ? "text-blue-400"
            : status === "Delivered"
            ? "text-green-500"
            : status === "Canceled"
            ? "text-red-500"
            : "text-gray-400")
        }
      >
        {status}
      </span>
    );
  };

  const filteredOrders = userOrders.filter((order) => {
    const matchStatus = statusFilter === "All" || order.status === statusFilter;
    const matchSearch =
      order.orderCode?.toLowerCase().includes(search.toLowerCase()) ?? false;

    const matchRecent =
      !recentOnly ||
      (() => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const diffTime = now - orderDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 3;
      })();

    const matchDateRange = (() => {
      const created = new Date(order.createdAt).setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      if (start && created < start) return false;
      if (end && created > end) return false;
      return true;
    })();

    return matchStatus && matchSearch && matchRecent && matchDateRange;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      className="flex max-w-7xl mx-auto mt-10 mb-12 gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Sidebar */}
      <div className="w-48 rounded-2xl p-4 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-4">My Profile</h3>
        <ul className="space-y-2">
          {[
            {
              key: "user",
              label: "My Account",
              icon: <UserIcon className="w-4 h-4 mr-2" />,
            },
            {
              key: "history",
              label: "My Purchase",
              icon: <Briefcase className="w-4 h-4 mr-2" />,
            },
            {
              key: "wishlist",
              label: "My Favorite",
              icon: <Heart className="w-4 h-4 mr-2" />,
            },
            {
              key: "coupon",
              label: "My Coupon",
              icon: <Ticket className="w-4 h-4 mr-2" />,
            },
          ].map(({ key, label, icon }) => (
            <li key={key}>
              <button
                onClick={() => setSelectedTab(key)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  selectedTab === key
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-700 text-white"
                }`}
              >
                <div className="flex items-center">
                  {icon}
                  <span>{label}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1">
        {selectedTab === "user" && (
          <motion.div
            key="user"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-2xl shadow-xl text-gray-200"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between mb-6 gap-6">
              {/* Account Information */}
              {/* Avatar */}
              <div className="relative">
                <label
                  htmlFor="avatarInput"
                  className="relative cursor-pointer group"
                >
                  <img
                    src={
                      formData.avatar?.url || // nếu là object
                      formData.avatar || // nếu là string url
                      user?.avatar?.url || // fallback từ user
                      "https://res.cloudinary.com/dhd7fwafy/image/upload/v1752225767/sQxW2GrO_400x400_w9afhp.png"
                    }
                    alt="Avatar"
                    className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg transition duration-300 group-hover:opacity-75"
                  />

                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition">
                      <span className="text-white text-sm">
                        Click to change
                      </span>
                    </div>
                  )}
                </label>
                {/* Overlay spinner khi upload */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <LoadingSpinner />
                  </div>
                )}
                {/* Input file ẩn */}
                {isEditing && (
                  <input
                    type="file"
                    id="avatarInput"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold text-blue-300">
                    Account Information
                  </h2>
                  {!isEditing ? (
                    <button
                      className="text-blue-400 hover:text-blue-300 transition"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        className="text-green-400 hover:text-green-300 transition"
                        onClick={handleSave}
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300 transition"
                        onClick={resetForm}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isEditing ? (
                    <>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="p-2 rounded bg-gray-700 text-white"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="p-2 rounded bg-gray-700 text-white"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-300 mb-1">
                          Address
                        </label>
                        <input
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="p-2 rounded bg-gray-700 text-white"
                          placeholder="Enter your address"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-300 mb-1">
                          Date of Birth
                        </label>
                        <input
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="p-2 rounded bg-gray-700 text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p>
                          <strong>Full Name:</strong> {user?.name}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Email:</strong> {user?.email}
                        </p>
                      </div>
                      {/* Role & Status */}

                      <div className="flex items-center gap-2">
                        <strong>Role:</strong>{" "}
                        <div className={`flex items-center gap-1 ${roleColor}`}>
                          {RoleIcon}
                          <span className="text-sm font-semibold">
                            {roleLabel}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {user?.phone || "Chưa cung cấp"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Date of Birth:</strong>{" "}
                          {user?.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Address:</strong>{" "}
                          {user?.address || "Chưa cung cấp"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Status:</strong>{" "}
                        {user?.isOnline ? (
                          <div className="flex items-center gap-1">
                            <CircleDot className="w-5 h-5 text-green-400" />
                            <span className="text-sm">Online</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <CircleOff className="w-5 h-5 text-gray-500" />
                            <span className="text-sm">Offline</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p>
                          <strong>Created At:</strong>{" "}
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                }
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold text-blue-300 flex items-center gap-2">
                  <Lock className="w-5 h-5" /> Change Password
                </h3>

                {/* Current Password */}
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 pr-10 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* New Password */}
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="New password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 pr-10 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  onClick={async () => {
                    if (!currentPassword || !newPassword) {
                      return toast.error("Please fill all fields");
                    }
                    if (newPassword.length < 6) {
                      return toast.error(
                        "New password must be at least 6 characters"
                      );
                    }
                    const success = await changePassword({
                      currentPassword,
                      newPassword,
                    });
                    if (success) {
                      setCurrentPassword("");
                      setNewPassword("");
                      toast.success("Password updated successfully");
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 transition text-white font-semibold py-2 px-4 rounded w-full"
                >
                  Update Password
                </button>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-2xl shadow-xl text-gray-200"
          >
            <h2 className="text-2xl font-bold text-blue-300 mb-6">
              Purchase History
            </h2>

            {/* Bộ lọc */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="Search by order code..."
                className="px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 w-full lg:w-[22%]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 w-full lg:w-[16%]"
              >
                <option value="All">All</option>
                <option value="Processing">Processing</option>
                <option value="Shipping">Shipping</option>
                <option value="Delivered">Delivered</option>
                <option value="Canceled">Canceled</option>
              </select>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 w-full lg:w-[20%]"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-600 w-full lg:w-[20%]"
              />
            </div>

            {/* Danh sách đơn hàng */}
            {loading ? (
              <LoadingSpinner />
            ) : filteredOrders.length === 0 ? (
              <p className="text-gray-400 italic">
                You have not placed any orders yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-sm text-left">
                  <thead className="bg-gray-900 text-gray-100 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Order Code</th>
                      <th className="px-4 py-3 text-center">Amount</th>
                      <th className="px-4 py-3 text-center">Create At</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      // <tr
                      //   key={order._id}
                      //   onClick={() => navigate(`/orders/${order._id}`)}
                      //   className="bg-gray-800 hover:bg-gray-900 transition cursor-pointer rounded-lg"
                      // >
                      //   <td className="px-4 py-3 font-medium text-blue-400">
                      //     {order.orderCode || (
                      //       <span className="italic text-gray-400">
                      //         No code
                      //       </span>
                      //     )}
                      //   </td>
                      //   <td className="px-4 py-3 text-center">
                      //     ${order.totalAmount.toFixed(2)}
                      //   </td>
                      //   <td className="px-4 py-3 text-center">
                      //     {new Date(order.createdAt).toLocaleDateString(
                      //       "vi-VN"
                      //     )}
                      //   </td>
                      //   <td className="px-4 py-3 text-center">
                      //     {renderStatus(order.status, order.statusLog)}
                      //   </td>
                      // </tr>
                      <tr
                        key={order._id}
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="bg-gray-800 hover:bg-gray-900 transition cursor-pointer rounded-lg"
                      >
                        <td className="px-4 py-3 font-medium text-blue-400">
                          {order.orderCode || (
                            <span className="italic text-gray-400">
                              No code
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {renderStatus(order.status, order.statusLog)}
                        </td>
                        <td className="px-4 py-3 text-center flex justify-center gap-2">
                          {/* Huỷ khi đang Processing */}
                          {order.status === "Processing" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelOrderByUser(order._id);
                              }}
                              className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded text-xs"
                            >
                              Cancel
                            </button>
                          )}
                          {/* Xác nhận Delivered khi đang Shipping */}
                          {order.status === "Shipping" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsDelivered(order._id);
                              }}
                              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs"
                            >
                              Delivered
                            </button>
                          )}
                          {/* Nếu không có action thì giữ khoảng trống hoặc dấu — */}
                          {order.status !== "Processing" &&
                            order.status !== "Shipping" && (
                              <span className="text-gray-500 text-xs">—</span>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => {
                      const page = idx + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-white hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === "wishlist" && (
          <motion.div
            key="wishlist"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-2xl shadow-xl text-gray-200"
          >
            <h2 className="text-2xl font-bold text-blue-300 mb-6">
              My Favorites
            </h2>
            <WishlistSection />
          </motion.div>
        )}

        {selectedTab === "coupon" && (
          <motion.div
            key="coupon"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-2xl shadow-xl text-gray-200 "
          >
            <h2 className="text-2xl font-bold text-blue-300 mb-6 ">
              My Coupons
            </h2>

            <p className="text-gray-400 mb-4">
              Here are your active coupons. Double-click to copy the code.
            </p>
            <MyActiveCoupons />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UserProfilePage;
