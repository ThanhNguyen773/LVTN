import { useEffect, useState } from "react";
import {
  CircleChevronLeft,
  Eye,
  Trash,
  Package,
  Truck,
  Ban,
  BarChart,
  Clock,
  Download,
} from "lucide-react";
import Modal from "react-modal";
import { motion } from "framer-motion";
import axios from "../lib/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";
import { useSettingStore } from "../stores/useSettingStore";
import { useNotificationStore } from "../stores/useNotificationStore";

Modal.setAppElement("#root");

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [editingStatus, setEditingStatus] = useState({});
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const { setting: generalSetting, fetchSetting } = useSettingStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const [allOrders, setAllOrders] = useState([]);
  const { fetchNotifications } = useNotificationStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    canceledOrders: 0,
    shippingOrders: 0,
    pendingOrders: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();
  useEffect(() => {
    if (!generalSetting) fetchSetting();
  }, []);
  const fetchOrders = async (page = 1) => {
    try {
      const query = new URLSearchParams({
        page,
        limit: 10,
        from: dateRange.from,
        to: dateRange.to,
        status: statusFilter,
        search: searchTerm.trim(),
        paymentMethod: paymentMethodFilter,
      }).toString();

      const res = await axios.get(`/orders?${query}`);
      const sortedOrders = res.data.orders.sort((a, b) => {
        const statusOrder = { Processing: 0, Delivered: 1, Canceled: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      setOrders(sortedOrders);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng", error);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get("/orders/all"); // backend trả về toàn bộ orders
      setAllOrders(res.data.orders || []);
    } catch (err) {
      console.error("Lỗi lấy tất cả đơn hàng:", err);
    }
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Bạn có chắc muốn xoá đơn hàng này?");
    if (!confirm) return;
    try {
      await axios.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (error) {
      console.error("Lỗi khi xoá đơn hàng", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      const updatedOrder = res.data.order;

      // ✅ Chỉ cần cập nhật lại state, không cần fetch lại
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
      await fetchNotifications(); // Cập nhật thông báo sau khi thay đổi trạng thái
      alert("Trạng thái đã được cập nhật!");
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Không thể cập nhật trạng thái.");
    }
  };
  const renderPaymentMethod = (method) => {
    if (!method) return "N/A";
    return method === "COD"
      ? "Cash on Delivery"
      : method === "Stripe"
      ? "Paid via Stripe"
      : method;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchOrders(page);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter, dateRange, searchTerm, paymentMethodFilter]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);
  useEffect(() => {
    fetchAllOrders();
  }, []);

  const totalOrders = allOrders.length;
  const deliveredOrders = allOrders.filter(
    (o) => o.status === "Delivered"
  ).length;
  const processingOrders = allOrders.filter(
    (o) => o.status === "Processing"
  ).length;
  const canceledOrders = allOrders.filter(
    (o) => o.status === "Canceled"
  ).length;

  const cancelRate =
    totalOrders > 0 ? ((canceledOrders / totalOrders) * 100).toFixed(1) : 0;
  const fulfillmentRate =
    totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;

  const handleBulkApproveShipping = async () => {
    const invalidOrders = orders.filter(
      (o) => selectedOrders.includes(o._id) && o.status !== "Processing"
    );

    if (invalidOrders.length > 0) {
      alert("Chỉ có thể duyệt các đơn hàng đang ở trạng thái 'Processing'.");
      return;
    }

    try {
      await axios.patch("/orders/bulk-status", {
        ids: selectedOrders,
        status: "Shipping",
      });

      setOrders((prev) =>
        prev.map((o) =>
          selectedOrders.includes(o._id) ? { ...o, status: "Shipping" } : o
        )
      );

      setSelectedOrders([]);
      alert("Đã duyệt các đơn hàng sang trạng thái Shipping.");
    } catch (error) {
      alert("Lỗi khi duyệt hàng loạt.");
      console.error(error);
    }
  };

  const exportAllOrders = async () => {
    try {
      const response = await axios.get("/orders/all");
      const allOrders = response.data.orders;

      const dataToExport = allOrders.map((order) => ({
        "Order Code": order.orderCode || "N/A",
        "Customer Name": order.user?.name || "Unknown",
        Email: order.user?.email || "No email",
        "Payment Method":
          order.paymentMethod === "COD"
            ? "Cash on Delivery"
            : order.paymentMethod === "Stripe"
            ? "Paid via Stripe"
            : order.paymentMethod || "N/A",
        "Total Amount ($)": order.totalAmount.toFixed(2),
        Status: order.status,
        "Payment Date": new Date(order.createdAt).toLocaleString("vi-VN"),
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "All Orders");

      XLSX.writeFile(workbook, "all_orders_export.xlsx"); // Xuất file trực tiếp về máy
    } catch (error) {
      console.error("Lỗi export toàn bộ:", error);
      alert("Không thể export toàn bộ đơn hàng.");
    }
  };
  const handleDownloadPDF = () => {
    const element = document.getElementById("invoice-content");

    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `invoice-${selectedOrder.orderCode || "order"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <motion.div
      className="bg-gray-800 border border-gray-700 shadow-lg rounded-lg overflow-hidden max-w-7xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900 gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white">Order Management</h2>
        </div>
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

      {/* Stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-4 shadow flex items-center gap-4"
          >
            <Package className="h-10 w-10 text-yellow-300" />
            <div>
              <p className="text-sm text-gray-300">Total Orders</p>
              <h3 className="text-2xl font-bold text-white">{totalOrders}</h3>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-700 to-green-600 rounded-lg p-4 shadow flex items-center gap-4"
          >
            <Truck className="h-10 w-10 text-white" />
            <div>
              <p className="text-sm text-green-200">Delivered Orders</p>
              <h3 className="text-2xl font-bold text-white">
                {deliveredOrders}
              </h3>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-4 shadow flex items-center gap-4"
          >
            <Clock className="h-10 w-10 text-white" />
            <div>
              <p className="text-sm text-yellow-200">Processing Orders</p>
              <h3 className="text-2xl font-bold text-white">
                {processingOrders}
              </h3>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-red-700 to-red-500 rounded-lg p-4 shadow flex items-center gap-4"
          >
            <Ban className="h-10 w-10 text-white" />
            <div>
              <p className="text-sm text-red-200">Canceled Orders</p>
              <h3 className="text-2xl font-bold text-white">
                {canceledOrders} ({cancelRate}%)
              </h3>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-lg p-4 shadow flex items-center gap-4"
          >
            <BarChart className="h-10 w-10 text-white" />
            <div>
              <p className="text-sm text-blue-200">Fulfillment Rate</p>
              <h3 className="text-2xl font-bold text-white">
                {fulfillmentRate}%
              </h3>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-4">
        <div className="overflow-x-auto">
          <div className="inline-flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 flex-shrink-0">
              <label htmlFor="order-search" className="text-white mr-1">
                Search:
              </label>
              <input
                id="order-search"
                type="text"
                placeholder="Order code or Customer name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white px-2 py-2 rounded w-[220px] min-w-[160px]"
              />
            </div>

            {/* From */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 flex-shrink-0">
              <label htmlFor="filter-from" className="text-white mr-1">
                From:
              </label>
              <input
                id="filter-from"
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
                className="bg-gray-700 text-white px-2 py-2 rounded"
              />
            </div>

            {/* To */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 flex-shrink-0">
              <label htmlFor="filter-to" className="text-white mr-1">
                To:
              </label>
              <input
                id="filter-to"
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
                className="bg-gray-700 text-white px-2 py-2 rounded"
              />
            </div>

            {/* Apply */}
            <div className="flex-shrink-0">
              <button
                onClick={() => fetchOrders(1)}
                className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded"
              >
                Apply
              </button>
            </div>

            {/* Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 flex-shrink-0">
              <label htmlFor="status-filter" className="text-white mr-1">
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700 text-white px-2 py-2 rounded"
              >
                <option value="">All</option>
                <option value="Processing">Processing</option>
                <option value="Shipping">Shipping</option>
                <option value="Delivered">Delivered</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>

            {/* Payment */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 flex-shrink-0">
              <label htmlFor="payment-filter" className="text-white mr-1">
                Payment:
              </label>
              <select
                id="payment-filter"
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="bg-gray-700 text-white px-2 py-2 rounded"
              >
                <option value="">All</option>
                <option value="COD">COD</option>
                <option value="Stripe">Stripe</option>
              </select>
            </div>

            {/* Export */}
            <div className="flex-shrink-0">
              <button
                onClick={exportAllOrders}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded flex items-center gap-1"
                aria-label="Export all orders"
              >
                <Download className="h-4 w-4" />
                {/* <span className="hidden sm:inline">Export</span> */}
              </button>
            </div>
          </div>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-3">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOrders(orders.map((o) => o._id));
                  } else {
                    setSelectedOrders([]);
                  }
                }}
                checked={
                  selectedOrders.length === orders.length && orders.length > 0
                }
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Order Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Orderer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Payment Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Total Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Payment Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300">
              Detail
            </th>
          </tr>
        </thead>

        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-700">
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders((prev) => [...prev, order._id]);
                    } else {
                      setSelectedOrders((prev) =>
                        prev.filter((id) => id !== order._id)
                      );
                    }
                  }}
                />
              </td>
              <td className="px-6 py-4 text-white">
                {order.orderCode || "No code yet"}
              </td>
              <td className="px-6 py-4 text-gray-300">
                {order.user?.name || "Not determined"}
              </td>
              <td className="px-6 py-4 text-gray-300">
                {renderPaymentMethod(order.paymentMethod)}
              </td>

              <td className="px-6 py-4 text-gray-300">
                ${order.totalAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-gray-300">
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </td>
              <td className="px-6 py-4 text-sm flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                    order.status === "Delivered"
                      ? "bg-green-600"
                      : order.status === "Canceled"
                      ? "bg-red-600"
                      : order.status === "Shipping"
                      ? "bg-blue-600"
                      : "bg-yellow-500"
                  }`}
                >
                  {order.status}
                </span>

                {order.status === "Processing" && (
                  <button
                    onClick={() => handleStatusChange(order._id, "Shipping")}
                    title="Approve orders"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Truck className="h-5 w-5" />
                  </button>
                )}
              </td>

              <td className="px-6 py-4 text-center space-x-2">
                <button
                  onClick={() => handleView(order)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Eye className="h-5 w-5" />
                </button>
                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedOrders.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 shadow-lg border border-gray-600 px-6 py-3 rounded-xl flex items-center gap-4"
        >
          <span className="text-white font-medium">
            {selectedOrders.length} order is selected
          </span>

          <button
            onClick={handleBulkApproveShipping}
            title="Approve selected orders"
            className="bg-blue-600 hover:bg-blue-500 p-2 rounded-full text-white"
          >
            <Truck className="h-5 w-5" />
          </button>
        </motion.div>
      )}

      {/* Phân trang */}
      <div className="flex justify-center items-center my-6 gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => handlePageChange(idx + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === idx + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-600 text-gray-200 hover:bg-gray-500"
            }`}
          >
            {idx + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white text-black max-w-2xl w-full mx-auto mt-24 p-6 rounded-lg shadow-xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-semibold mb-4">Order Details</h2>

        {selectedOrder && (
          <>
            <div className="space-y-4 text-sm">
              <div
                id="invoice-content"
                className="space-y-4 text-sm text-black rounded hidden-print"
              >
                <div className="hidden print:block text-center mb-4">
                  <h2 className="text-xl font-bold uppercase flex items-center gap-2 justify-center">
                    {generalSetting?.logo && (
                      <img
                        src={generalSetting.logo}
                        alt="Logo"
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    {generalSetting?.storeName || "TP.Cosmic Store"}
                  </h2>

                  <p>Address: Ninh Kieu, Can Tho, Viet Nam</p>
                  <p>Hotline: +84 867 886 761</p>
                  <p className="mt-2">
                    Print Date: {new Date().toLocaleDateString("vi-VN")}
                  </p>
                  <hr className="my-2 border-black" />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <p>
                    <strong>Order Code:</strong>{" "}
                    {selectedOrder.orderCode || "No code yet"}
                  </p>
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <p>
                    <strong>Full Name:</strong>{" "}
                    {selectedOrder?.user?.name || "Not determined"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedOrder?.user?.email || "No emails"}
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedOrder.paymentMethod === "COD" ? (
                      <span className="text-yellow-400 font-medium">
                        Cash on Delivery
                      </span>
                    ) : selectedOrder.paymentMethod === "Stripe" ? (
                      <span className="text-green-400 font-medium">
                        Paid via Stripe
                      </span>
                    ) : (
                      selectedOrder.paymentMethod
                    )}
                  </p>
                  {/* <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || "N/A"}</p>
        <p><strong>Paid:</strong> {selectedOrder.isPaid ? "Yes" : "No"}</p> */}
                  {selectedOrder.deliveredAt && (
                    <p>
                      <strong>Delivered At:</strong>{" "}
                      {new Date(selectedOrder.deliveredAt).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                  )}
                  {selectedOrder?.coupon && (
                    <p className="text-green-600 col-span-2">
                      <strong>Coupon Code:</strong> {selectedOrder.coupon.code}{" "}
                      (-
                      {selectedOrder.coupon.discountPercentage}%)
                    </p>
                  )}
                  <p className="col-span-2">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        selectedOrder.status === "Delivered"
                          ? "text-green-600"
                          : selectedOrder.status === "Canceled"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {selectedOrder.status || "Processing"}
                    </span>
                  </p>
                </div>

                {/* Địa chỉ giao hàng */}
                <div>
                  <h3 className="text-emerald-700 font-bold mb-2">
                    Shipping Address
                  </h3>
                  {selectedOrder.shippingAddress &&
                  Object.values(selectedOrder.shippingAddress).some(
                    (v) => v?.trim() !== ""
                  ) ? (
                    <div className="grid sm:grid-cols-2 gap-2 text-black">
                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedOrder.shippingAddress.phone || "N/A"}
                      </p>
                      <p>
                        <strong>Country:</strong>{" "}
                        {selectedOrder.shippingAddress.country || "N/A"}
                      </p>
                      <p>
                        <strong>Address Line 1:</strong>{" "}
                        {selectedOrder.shippingAddress.addressLine1 || "N/A"}
                      </p>
                      <p>
                        <strong>Address Line 2:</strong>{" "}
                        {selectedOrder.shippingAddress.addressLine2 || "N/A"}
                      </p>
                      <p>
                        <strong>City:</strong>{" "}
                        {selectedOrder.shippingAddress.city || "N/A"}
                      </p>
                      <p>
                        <strong>Postal Code:</strong>{" "}
                        {selectedOrder.shippingAddress.postalCode || "N/A"}
                      </p>
                    </div>
                  ) : user?.address ? (
                    // ✅ Nếu không có shippingAddress nhưng user có địa chỉ — dùng địa chỉ mặc định của user
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-black">
                      <p className="text-yellow-400 font-semibold">
                        Using your default address and phone number for
                        shipping.
                      </p>{" "}
                      <br />
                      <p>
                        <strong>Phone:</strong> {user.phone || "N/A"}
                      </p>
                      <p>
                        <strong>Country:</strong> {user.address || "N/A"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-yellow-400 font-semibold">
                      No shipping address provided.
                    </p>
                  )}
                </div>

                {/* Ghi chú */}
                {selectedOrder.note && (
                  <div>
                    <h3 className="text-emerald-700 font-bold">
                      Customer Note
                    </h3>
                    <p className="italic text-black">{selectedOrder.note}</p>
                  </div>
                )}

                {/* Danh sách sản phẩm */}
                <div>
                  <p className="font-bold mb-2">Product List:</p>
                  <table className="w-full text-sm border border-black border-collapse table-fixed">
                    <thead className="bg-gray-700 text-white">
                      <tr>
                        <th className="border border-black px-3 py-2 text-center w-[7%]">
                          No
                        </th>
                        <th className="border border-black px-3 py-2 text-left w-[50%]">
                          Product name
                        </th>
                        <th className="border border-black px-3 py-2 text-center w-[13%]">
                          Quantity
                        </th>
                        <th className="border border-black px-3 py-2 text-right w-[15%]">
                          Unit price
                        </th>
                        <th className="border border-black px-3 py-2 text-right w-[15%]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border border-black px-3 py-2 text-center">
                            {idx + 1}
                          </td>
                          <td className="border border-black px-3 py-2 text-left">
                            {item.product?.name || "(No Name)"}
                          </td>
                          <td className="border border-black px-3 py-2 text-center">
                            {item.quantity}
                          </td>
                          <td className="border border-black px-3 py-2 text-right">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="border border-black px-3 py-2 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan="4"
                          className="text-right px-3 py-2 font-semibold border border-black"
                        >
                          Subtotal:
                        </td>
                        <td className="text-right px-3 py-2 border border-black">
                          $
                          {selectedOrder.products
                            .reduce(
                              (acc, item) => acc + item.price * item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                      {selectedOrder?.coupon && (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-right px-3 py-2 font-semibold text-green-600 border border-black"
                          >
                            Discount:
                          </td>
                          <td className="text-right px-3 py-2 text-green-600 border border-black">
                            -
                            {(
                              (selectedOrder.products.reduce(
                                (acc, item) => acc + item.price * item.quantity,
                                0
                              ) *
                                selectedOrder.coupon.discountPercentage) /
                              100
                            ).toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr className="font-bold">
                        <td
                          colSpan="4"
                          className="text-right px-3 py-2 border border-black"
                        >
                          Total Payment:
                        </td>
                        <td className="text-right px-3 py-2 border border-black">
                          ${selectedOrder.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="hidden print:flex justify-between px-10 mt-10">
                <div className="text-center">
                  <p>{generalSetting?.storeName || "TP.Cosmic Store"}</p>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => window.print()}
                  className="bg-gray-800 hover:bg-gray-600 text-white px-4 py-2 rounded-md mt-4 mr-2 print:hidden"
                >
                  Print Invoice
                </button>

                {/* Close button */}

                <button
                  onClick={handleDownloadPDF}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md mr-2"
                >
                  Download PDF Invoice
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  );
};

export default OrderList;
