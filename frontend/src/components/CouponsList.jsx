import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trash,
  PlusCircle,
  Pencil,
  Percent,
  CheckCircle,
  AlarmClock,
  Download,
} from "lucide-react";
import Modal from "react-modal";
import { useCouponStore } from "../stores/useCouponStore";
import CreateCouponForm from "./CreateCouponForm";
import LoadingSpinner from "./LoadingSpinner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

Modal.setAppElement("#root");

const CouponsList = () => {
  const {
    coupons,
    fetchCoupons,
    deleteCoupon,
    deleteAllCoupons,
    createCoupon,
    updateCoupon,
    loading,
  } = useCouponStore();

  const [showForm, setShowForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [sortOrder, setSortOrder] = useState("none"); // "asc", "desc", "none"

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const openEditModal = (coupon) => {
    setEditingCoupon({ ...coupon });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingCoupon((prev) => ({ ...prev, [name]: value }));
  };

  const exportFilteredCouponsToXLSX = () => {
    if (!filteredCoupons || filteredCoupons.length === 0) return;

    const dataToExport = filteredCoupons.map((coupon) => ({
      Code: coupon.code,
      User: coupon.userId?.name || "Ẩn danh",
      Email: coupon.userId?.email || "",
      Discount: `${coupon.discountPercentage}%`,
      Expiration: new Date(coupon.expirationDate).toLocaleDateString("vi-VN"),
      Status: coupon.isActive ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Coupons");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Coupons_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSave = async () => {
    if (editingCoupon) {
      const payload = {
        code: editingCoupon.code,
        discountPercentage: editingCoupon.discountPercentage,
        expirationDate: editingCoupon.expirationDate,
        isActive: editingCoupon.isActive,
        userId:
          typeof editingCoupon.userId === "object"
            ? editingCoupon.userId._id
            : editingCoupon.userId,
      };
      await updateCoupon(editingCoupon._id, payload);
      await fetchCoupons();
      closeModal();
    }
  };

  let filteredCoupons = (coupons || []).filter((coupon) => {
    const matchQuery =
      coupon.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? coupon.isActive
        : !coupon.isActive;

    return matchQuery && matchStatus;
  });

  // Sort by discount
  if (sortOrder === "asc") {
    filteredCoupons = filteredCoupons.sort(
      (a, b) => a.discountPercentage - b.discountPercentage
    );
  } else if (sortOrder === "desc") {
    filteredCoupons = filteredCoupons.sort(
      (a, b) => b.discountPercentage - a.discountPercentage
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil((filteredCoupons?.length || 0) / itemsPerPage)
  );

  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg border border-gray-700 overflow-hidden max-w-6xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
        <h2 className="text-2xl font-bold text-white mb-2">
          {" "}
          Coupon Management
        </h2>
      </div>

      <div className="px-6 py-8  space-y-4">
        {/* Thẻ thống kê nổi bật */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Coupons */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-5 shadow-lg text-white flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-200 flex items-center gap-1">
                <Percent size={16} /> Total Coupons
              </p>
              <p className="text-2xl font-bold">{coupons.length}</p>
            </div>
          </div>

          {/* Active Coupons */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-5 shadow-lg text-white flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-200 flex items-center gap-1">
                <CheckCircle size={16} /> Active Coupons
              </p>
              <p className="text-2xl font-bold">
                {coupons.filter((c) => c.isActive).length}
              </p>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl p-5 shadow-lg text-gray-900 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 flex items-center gap-1">
                <AlarmClock size={16} /> Expiring Soon (&lt; 3 days)
              </p>
              <p className="text-2xl font-bold">
                {
                  coupons.filter(
                    (c) =>
                      new Date(c.expirationDate) <
                      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar - chỉ hiển thị khi không tạo form */}
        {!showForm && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Nút chức năng */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow"
              >
                <PlusCircle className="w-4 h-4" />
                Add Code
              </button>
              <button
                onClick={deleteAllCoupons}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow"
              >
                <Trash className="w-4 h-4" />
                Delete All
              </button>
              <button
                onClick={exportFilteredCouponsToXLSX}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow"
              >
                <Download className="w-4 h-4" />{" "}
                
              </button>
            </div>

            {/* Tìm kiếm + lọc */}
            <div className="flex items-center gap-3">
              <label className="text-white">Search:</label>
              <input
                type="text"
                placeholder="Typing code or user..."
                className="bg-gray-800 text-white px-3 py-2 rounded w-64 border border-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 font-medium"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 font-medium"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="none">Sort Discount</option>
                <option value="asc">Low → High</option>
                <option value="desc">High → Low</option>
              </select>
            </div>
          </div>
        )}

        {/* Form tạo mới coupon */}
        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Coupon</h3>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
              >
                Close
              </button>
            </div>
            <CreateCouponForm createCoupon={createCoupon} />
          </div>
        )}
      </div>

      {/* Table hoặc Loading */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredCoupons.length === 0 ? (
        <p className="text-white text-center mt-6">No coupons found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 text-sm text-left text-white">
            <thead className="bg-gray-700 text-xs uppercase text-gray-300">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Discount</th>
                <th className="px-6 py-3">Expiration</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {paginatedCoupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium">{coupon.code}</td>
                  <td className="px-6 py-4">
                    {coupon.userId?.name || "Ẩn danh"}
                    <br />
                    <span className="text-gray-400 text-xs">
                      {coupon.userId?.email || ""}
                    </span>
                  </td>
                  <td className="px-6 py-4">{coupon.discountPercentage}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>
                        {new Date(coupon.expirationDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                      {new Date(coupon.expirationDate) <
                        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && (
                        <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                          Expiring soon
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-bold ${
                        coupon.isActive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(coupon)}
                      className="text-yellow-400 hover:text-yellow-600"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon._id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-6 mb-4 text-sm text-gray-300">
              {/* Bên trái: Thông tin số lượng */}
              <div className="text-gray-400">
                Showing {paginatedCoupons.length} out of{" "}
                {filteredCoupons.length} entries
              </div>

              {/* Bên phải: Phân trang */}
              <div className="flex gap-2 text-gray-400">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "text-gray-500 cursor-not-allowed"
                      : "hover:text-white"
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-blue-500 text-white"
                        : "hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? "text-gray-500 cursor-not-allowed"
                      : "hover:text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal chỉnh sửa giữ nguyên */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="bg-gray-800 text-white max-w-md mx-auto mt-24 p-6 rounded-lg shadow-lg outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <h3 className="text-xl font-semibold mb-6 text-center">
            Editing Coupon
          </h3>

          {editingCoupon && (
            <>
              <div className="mb-4">
                <label className="block text-sm mb-1">Code</label>
                <input
                  name="code"
                  value={editingCoupon.code}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Percentage</label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={editingCoupon.discountPercentage}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm mb-1">Expired</label>
                <input
                  type="date"
                  name="expirationDate"
                  value={
                    new Date(editingCoupon.expirationDate)
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm mb-1">Status</label>
                <select
                  name="isActive"
                  value={editingCoupon.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setEditingCoupon((prev) => ({
                      ...prev,
                      isActive: e.target.value === "true",
                    }))
                  }
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </motion.div>
  );
};

export default CouponsList;
