import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trash,
  Pencil,
  Eye,
  CircleChevronLeft,
  Download,
  TimerResetIcon,
  RefreshCcwDot,
  RotateCcw,
  PlusCircle,
} from "lucide-react";
import Modal from "react-modal";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate, useLocation } from "react-router-dom";
import UserStats from "./UserStats";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

Modal.setAppElement("#root");

const UserList = () => {
  const {
    users,
    fetchAllUsers,
    deleteUser,
    updateUser,
    createStaff,
    user: currentUser,
  } = useUserStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [infoUser, setInfoUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showRecentUsersOnly, setShowRecentUsersOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const openEditModal = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  const openInfoModal = (user) => {
    setInfoUser(user);
    setIsInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    setInfoUser(null);
    setIsInfoModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSave = async () => {
  //   if (editingUser) {
  //     await updateUser(editingUser._id, editingUser);
  //     closeEditModal();
  //   }
  // };
  const handleSave = async () => {
    if (!editingUser) return;

    // Nếu là chính mình và chỉ thay đổi role thì chặn
    if (
      editingUser._id === currentUser?._id &&
      editingUser.role !== currentUser.role
    ) {
      alert("Bạn không thể thay đổi vai trò của chính mình!");
      return;
    }

    await updateUser(editingUser._id, editingUser);
    closeEditModal();
  };

  const filteredUsers = users.filter((user) => {
    const createdWithin7Days = () => {
      const now = new Date();
      const createdAt = new Date(user.createdAt);
      const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
      return diffInDays <= 7;
    };

    const roleMatch = filterRole === "all" || user.role === filterRole;
    const statusMatch =
      filterStatus === "" ||
      (filterStatus === "active" && user.isOnline === true) ||
      (filterStatus === "inactive" && user.isOnline === false);

    const searchMatch =
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchText.toLowerCase());

    const recentMatch = !showRecentUsersOnly || createdWithin7Days();

    return roleMatch && statusMatch && searchMatch && recentMatch;
  });
  const handleRoleChange = (id, newRole) => {
    // 🔒 Nếu là chính mình thì chặn đổi role
    if (id === currentUser?._id) {
      return alert("Bạn không thể thay đổi vai trò của chính mình!");
    }
    updateUser(id, { role: newRole });
  };

  const handleExportToExcel = () => {
    const exportData = users.map(
      ({ name, email, role, phone, address, dateOfBirth, createdAt }) => ({
        Name: name,
        Email: email,
        Role: role,
        Phone: phone || "",
        Address: address || "",
        Birthday: dateOfBirth
          ? new Date(dateOfBirth).toLocaleDateString("vi-VN")
          : "",
        CreatedAt: new Date(createdAt).toLocaleDateString("vi-VN"),
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "UserList.xlsx");
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <motion.div
      className="bg-gray-800 border border-gray-700 shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex items-center gap-4">
          {location.pathname !== "/secret-dashboard" && (
            <button
              onClick={() => navigate("/secret-dashboard")}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow transition"
              title="Trở về Dashboard"
            >
              <CircleChevronLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-wrap items-center gap-4 px-6 py-4">
          <UserStats />
          {/* 🔍 Thanh tìm kiếm */}
          <div className="flex items-center gap-2">
            <label className="text-white">Search:</label>
            <input
              type="text"
              placeholder="Type name, email, or phone..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-gray-700 text-white px-2 py-2 rounded w-[300px]"
            />
          </div>
          {/* 🔽 Bộ lọc trạng thái */}
          <div className="flex items-center gap-2">
            <label className="text-white">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-700 text-white px-2 py-2 rounded"
            >
              <option value="">All</option>
              <option value="active">Online</option>
              <option value="inactive">Offline</option>
            </select>

            <label className="text-white">Role:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-gray-700 text-white px-2 py-2 rounded"
            >
              <option value="all">All</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowRecentUsersOnly((prev) => !prev)}
              className={`px-4 py-2 rounded font-medium shadow ${
                showRecentUsersOnly
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {showRecentUsersOnly ? "Show All Users" : "Filter New Users"}
            </button>
            <button
              onClick={() => {
                setSearchText("");
                setFilterRole("all");
                setFilterStatus("");
                setShowRecentUsersOnly(false);
                setCurrentPage(1);
                fetchAllUsers();
              }}
              className="px-4 py-2 rounded bg-gray-700 text-white font-medium shadow hover:bg-gray-600"
            >
              <RotateCcw />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow"
              title="Create Staff Account"
            >
              <PlusCircle />
            </button>

            <button
              onClick={handleExportToExcel}
              className="px-4 py-2 rounded bg-green-600 text-white font-medium shadow hover:bg-green-500"
            >
              <Download />
            </button>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
                Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
                Created At
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {Array.isArray(paginatedUsers) &&
              paginatedUsers.map((user, index) => (
                <tr key={user._id} className="hover:bg-gray-700">
                  <td className="px-4 py-4 text-white text-sm">
                    {(currentPage - 1) * usersPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 text-white">{user.name}</td>
                  <td className="px-6 py-4 text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 text-gray-300">{user.role}</td>
                  <td className="px-6 py-4 text-gray-300">
                    <button
                      onClick={() => openInfoModal(user)}
                      title="Xem chi tiết"
                    >
                      <Eye className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${
                          user.isOnline ? "bg-green-400" : "bg-gray-500"
                        }`}
                      ></span>
                      <span className="text-gray-300 text-sm">
                        {user.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-400 hover:text-red-300"
                      title="Xoá người dùng"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-400">
        <span>
          Showing {paginatedUsers.length} out of {filteredUsers.length} entries
        </span>
        <div className="space-x-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            className="px-2 py-1 hover:underline"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-400 text-white"
                  : "hover:bg-gray-600 text-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            className="px-2 py-1 hover:underline"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={closeEditModal}
        className="bg-gray-900 text-white w-full max-w-2xl mx-auto mt-20 p-8 rounded-lg shadow-xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <h3 className="text-2xl font-bold mb-6 text-center text-blue-300">
          Edit User
        </h3>

        {editingUser && (
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                name="name"
                value={editingUser.name}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Role
              </label>
              <select
                name="role"
                value={editingUser.role}
                onChange={handleChange}
                disabled={editingUser._id === currentUser?._id}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={editingUser.phone || ""}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Birthday
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={editingUser.dateOfBirth?.split("T")[0] || ""}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Address
              </label>
              <input
                name="address"
                value={editingUser.address || ""}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                name="isActive"
                value={editingUser.isActive ? "true" : "false"}
                onChange={(e) =>
                  setEditingUser((prev) => ({
                    ...prev,
                    isActive: e.target.value === "true",
                  }))
                }
                className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeEditModal}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded font-semibold"
          >
            Save
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isInfoModalOpen}
        onRequestClose={closeInfoModal}
        className="bg-gray-900 text-white w-full max-w-2xl mx-auto mt-20 p-8 rounded-lg shadow-xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        {infoUser ? (
          <>
            {/* Avatar + Tên + Role */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={
                  infoUser.avatar?.url ||
                  "https://res.cloudinary.com/dhd7fwafy/image/upload/v1752225767/sQxW2GrO_400x400_w9afhp.png"
                }
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md object-cover"
              />
              <h3 className="text-2xl font-bold text-blue-300 mt-3">
                {infoUser.name || "Unnamed User"}
              </h3>
              <span className="text-sm text-gray-400 capitalize">
                {infoUser.role}
              </span>
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid sm:grid-cols-2 gap-4 text-sm w-full">
              <div>
                <label className="block text-gray-400 mb-1">Phone</label>
                <div className="bg-gray-800 px-3 py-2 rounded border border-gray-600">
                  {infoUser.phone || "—"}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Birthday</label>
                <div className="bg-gray-800 px-3 py-2 rounded border border-gray-600">
                  {infoUser.dateOfBirth
                    ? new Date(infoUser.dateOfBirth).toLocaleDateString("vi-VN")
                    : "—"}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1">Address</label>
                <div className="bg-gray-800 px-3 py-2 rounded border border-gray-600">
                  {infoUser.address || "—"}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Status</label>
                <div
                  className={`bg-gray-800 px-3 py-2 rounded border text-center ${
                    infoUser.isOnline
                      ? "border-green-500 text-green-400"
                      : "border-yellow-500 text-yellow-400"
                  }`}
                >
                  {infoUser.isOnline ? "Online" : "Offline"}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Created At</label>
                <div className="bg-gray-800 px-3 py-2 rounded border border-gray-600 text-center">
                  {new Date(infoUser.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400">Loading user info...</p>
        )}

        {/* Close button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={closeInfoModal}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isCreateModalOpen}
        onRequestClose={() => setIsCreateModalOpen(false)}
        className="bg-gray-900 text-white w-full max-w-2xl mx-auto mt-20 p-8 rounded-lg shadow-xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <h3 className="text-2xl font-bold mb-6 text-center text-green-300">
          Create Staff Account
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              value={newStaff.name}
              onChange={(e) =>
                setNewStaff({ ...newStaff, name: e.target.value })
              }
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={newStaff.email}
              onChange={(e) =>
                setNewStaff({ ...newStaff, email: e.target.value })
              }
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={newStaff.password}
              onChange={(e) =>
                setNewStaff({ ...newStaff, password: e.target.value })
              }
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone
            </label>
            <input
              value={newStaff.phone}
              onChange={(e) =>
                setNewStaff({ ...newStaff, phone: e.target.value })
              }
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Birthday
            </label>
            <input
              type="date"
              value={newStaff.dateOfBirth}
              onChange={(e) =>
                setNewStaff({ ...newStaff, dateOfBirth: e.target.value })
              }
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Address
            </label>
            <input
              value={newStaff.address}
              onChange={(e) =>
                setNewStaff({ ...newStaff, address: e.target.value })
              }
              className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await createStaff(newStaff);
              setIsCreateModalOpen(false);
              setNewStaff({
                name: "",
                email: "",
                password: "",
                phone: "",
                address: "",
                dateOfBirth: "",
              });
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded font-semibold"
          >
            Create
          </button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default UserList;
