import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useOrderStore } from "../stores/useOrderStore";
import { useUserStore } from "../stores/useUserStore";
import { useReviewStore } from "../stores/useReviewStore";
import StarRating from "../components/StarRating";
import ReviewForm from "../components/ReviewForm";
import ReviewEditForm from "../components/ReviewEditForm";
import { Pencil, X, Copy } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const {
    selectedOrder,
    fetchOrderById,
    loading,
    updateOrderStatus,
    confirmOrderDelivered,
    cancelOrderByUser,
  } = useOrderStore();

  const { user } = useUserStore();
  const { reviewsMap, fetchReviewsByProduct } = useReviewStore();

  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    fetchOrderById(orderId);
  }, [orderId]);

  useEffect(() => {
    if (selectedOrder) {
      selectedOrder.products.forEach((item) => {
        if (item.product?._id) {
          fetchReviewsByProduct(item.product._id, selectedOrder._id);
        }
      });
    }
  }, [selectedOrder]);

  if (loading || !selectedOrder) return <LoadingSpinner />;

  const renderStatus = (status) => {
    switch (status) {
      case "Delivered":
        return <span className="text-green-400 font-semibold">Delivered</span>;
      case "Shipping":
        return <span className="text-blue-400 font-semibold">Shipping</span>; // 🆕
      case "Canceled":
        return <span className="text-red-400 font-semibold">Canceled</span>;
      default:
        return (
          <span className="text-yellow-400 font-semibold">Processing</span>
        );
    }
  };

  const handleCopyOrderCode = () => {
    navigator.clipboard.writeText(selectedOrder.orderCode);
    toast.success("Order code copied!");
  };

  const handleMarkAsDelivered = async () => {
    const confirm = window.confirm("Bạn chắc chắn đã nhận được đơn hàng này?");
    if (!confirm) return;

    await confirmOrderDelivered(orderId);

    await fetchOrderById(orderId); // cập nhật lại dữ liệu đơn hàng
  };
  const handleCancelOrder = async () => {
    await cancelOrderByUser(orderId);

    await fetchOrderById(orderId); // cập nhật lại dữ liệu đơn hàng
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-300">Order Detail</h1>
        <Link
          to="/profile"
          className="text-gray-400 hover:text-white flex items-center"
        >
          <X size={20} className="mr-1" />
          Back to Profile
        </Link>
      </div>

      {/* Order Info */}
      {/* Order Info */}
      <section className="bg-gray-900/60 p-6 rounded-xl shadow-lg border border-gray-700 mb-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4 text-white">
          <p className="flex items-center gap-2">
            <strong>Order Code:</strong> {selectedOrder.orderCode}
            <button
              onClick={handleCopyOrderCode}
              className="text-gray-400 hover:text-white"
              title="Copy Order Code"
            >
              <Copy size={16} />
            </button>
          </p>
          <p>
            <strong>Payment Date:</strong>{" "}
            {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
          </p>
          <p>
            <strong>Orderer:</strong> {selectedOrder.user?.name || "Unknown"}
          </p>
          <p>
            <strong>Status:</strong> {renderStatus(selectedOrder.status)}
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
          {selectedOrder.deliveredAt && (
            <p>
              <strong>Delivered At:</strong>{" "}
              {new Date(selectedOrder.deliveredAt).toLocaleString("vi-VN")}
            </p>
          )}

          {selectedOrder.coupon && (
            <p className="text-green-400 col-span-2">
              <strong>Coupon Code:</strong> {selectedOrder.coupon.code} (-
              {selectedOrder.coupon.discountPercentage}%)
            </p>
          )}
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className="text-lg font-semibold text-emerald-400 mb-2">
            Shipping Address
          </h2>
          {selectedOrder.shippingAddress &&
          Object.values(selectedOrder.shippingAddress).some(
            (v) => v?.trim() !== ""
          ) ? (
            // ✅ Hiển thị địa chỉ từ đơn hàng
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-gray-300">
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

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-gray-300">
              <p className="text-yellow-400">
                Using your default address and phone number for shipping.
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
            <p className="text-yellow-400">No shipping address available.</p>
          )}
        </div>

        {/* Order Note */}
        {selectedOrder.note && (
          <div>
            <h2 className="text-lg font-semibold text-emerald-400 mb-2">
              Customer Note
            </h2>
            <p className="italic text-gray-300">{selectedOrder.note}</p>
          </div>
        )}
      </section>

      {/* Product List */}
      <h3 className="text-xl font-semibold mb-2 text-white">
        List of purchased products:
      </h3>
      <table className="w-full border text-sm mb-4">
        <thead className="bg-gray-900/60 text-white">
          <tr>
            <th className="border px-2 py-1">No</th>
            <th className="border px-2 py-1">Product Name</th>
            <th className="border px-2 py-1">Quantity</th>
            <th className="border px-2 py-1">Unit Price</th>
            <th className="border px-2 py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {selectedOrder.products.map((item, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1 text-center">{idx + 1}</td>
              <td className="border px-2 py-1">
                {item.product?.name || "No Name"}
              </td>
              <td className="border px-2 py-1 text-center">{item.quantity}</td>
              <td className="border px-2 py-1 text-right">
                ${item.price.toFixed(2)}
              </td>
              <td className="border px-2 py-1 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4" className="text-right px-2 py-1 font-semibold">
              Subtotal:
            </td>
            <td className="text-right px-2 py-1">
              $
              {selectedOrder.products
                .reduce((acc, item) => acc + item.price * item.quantity, 0)
                .toFixed(2)}
            </td>
          </tr>
          {selectedOrder.coupon && (
            <tr>
              <td
                colSpan="4"
                className="text-right px-2 py-1 font-semibold text-green-400"
              >
                Discount:
              </td>
              <td className="text-right px-2 py-1 text-green-400">
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
            <td colSpan="4" className="text-right px-2 py-1">
              Total Payment:
            </td>
            <td className="text-right px-2 py-1">
              ${selectedOrder.totalAmount.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
      {selectedOrder.status === "Shipping" && (
        <div className="mt-4">
          <button
            onClick={handleMarkAsDelivered}
            className="inline-block px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-semibold"
          >
            Order Received
          </button>
        </div>
      )}

      {selectedOrder.status === "Processing" && (
        <button
          onClick={() => handleCancelOrder(selectedOrder._id)}
          className="inline-block px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-semibold"
        >
          Cancel Order
        </button>
      )}

      {/* Product Reviews */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Your Product Reviews
        </h3>
        {selectedOrder.status === "Delivered" &&
          selectedOrder.products.map((item) => {
            const product = item.product;
            if (!product?._id) return null;

            const key = `${product._id}-${selectedOrder._id}`;
            const reviews = reviewsMap[key] || [];
            const userReview = reviews.find((r) => {
              const reviewUserId =
                typeof r.user === "object" ? r.user._id : r.user;
              return reviewUserId === user._id;
            });

            return (
              <div key={product._id} className="mb-4">
                <h5 className="text-blue-300 font-semibold">{product.name}</h5>
                {!userReview ? (
                  // ✅ chỉ render form nếu KHÔNG có review nào
                  <div className="rounded-md">
                    <ReviewForm
                      productId={product._id}
                      orderId={selectedOrder._id}
                      onSubmitted={() =>
                        fetchReviewsByProduct(product._id, selectedOrder._id)
                      }
                    />
                  </div>
                ) : (
                  // ✅ Nếu có review, hiển thị nội dung review
                  <div
                    className={`bg-gray-900/60 p-3 rounded-md ${
                      userReview.isHidden ? "border border-red-500" : ""
                    }`}
                  >
                    {editingReviewId !== userReview._id ? (
                      <>
                        <div className="flex justify-between items-start">
                          <StarRating rating={userReview.rating} size={16} />
                          <button
                            className="text-gray-400 hover:text-white"
                            onClick={() => setEditingReviewId(userReview._id)}
                            title="Edit Review"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                        <p className="text-sm mt-2 text-gray-300">
                          {userReview.comment}
                        </p>

                        {/* ✅ Hiển thị phản hồi nếu có */}
                        {userReview.reply && (
                          <div className="mt-3 p-3 bg-gray-800/80 rounded-md border-l-4 border-blue-400">
                            <p className="text-sm text-blue-300 mb-1 font-medium">
                              Staff reply:
                            </p>
                            <p className="text-sm text-gray-300">
                              {userReview.reply.content}
                            </p>
                            {userReview.reply.staff?.name && (
                              <p className="text-xs text-gray-400 mt-1 italic">
                                – {userReview.reply.staff.name}
                              </p>
                            )}
                          </div>
                        )}

                        {userReview.isHidden && (
                          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                            <span>🚫</span> This review is being hidden by the
                            admin
                          </p>
                        )}
                      </>
                    ) : (
                      <ReviewEditForm
                        review={userReview}
                        onUpdated={() => {
                          fetchReviewsByProduct(product._id, selectedOrder._id);
                          setEditingReviewId(null);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default OrderDetailPage;
